/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TestBed } from '@angular/core/testing';
import { Timeline } from 'vis';

import { Status } from '../Status';
import { Task } from '../Task';
import { ArrowService } from './arrow.service';
import { PositionService } from './position.service';

describe('ArrowService', () => {
  let arrowService: ArrowService;
  let positionService: PositionService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArrowService,
        PositionService,
      ]
    });
    arrowService = TestBed.inject(ArrowService);
    positionService = TestBed.inject(PositionService);
  });

  it('creates the service', () => {
    expect(arrowService).toBeTruthy();
  });

  it('appends SVG to the timeline dom on setting the timeline', () => {
    const mockTimeline = createMockTimeline();

    spyOn(document, 'createElementNS').and.callThrough();

    arrowService.setTimeline(mockTimeline);

    expect(document.createElementNS).toHaveBeenCalledWith('http://www.w3.org/2000/svg', 'svg');
    expect(mockTimeline.dom.center.parentNode.appendChild)
      .toHaveBeenCalledWith(jasmine.any(SVGSVGElement));
  });

  it('adds dependency arrow(s)', () => {
    const mockTimeline = createMockTimeline();
    arrowService.setTimeline(mockTimeline);

    const task1: Task = {
      id: '1',
      name: 'Task 1',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-09-28'),
      finishTime: new Date('2020-09-29'),
    };
    const task2: Task = {
      id: '2',
      name: 'Task 2',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-10-02'),
      finishTime: new Date('2020-10-03'),
    };
    const task3: Task = {
      id: '3',
      name: 'Task 3',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-10-03'),
      finishTime: new Date('2020-10-05'),
    };
    const task4: Task = {
      id: '4',
      name: 'Task 4',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-10-03'),
      finishTime: new Date('2020-10-05'),
    };

    task1.dependants.push('2');
    task2.dependants.push('3');
    task2.dependants.push('4');

    const tasks = [task1, task2, task3, task4];
    mockTimeline.itemSet.items = convertToItems(tasks);

    const changes = {
      add: tasks,
      remove: [],
      update: [],
    };

    spyOn(document, 'createElementNS').and.callThrough();
    positionService.getTaskPositionById = jasmine.createSpy('getTaskPosition')
      .and.returnValue({
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        midX: 0,
        midY: 0,
        width: 0,
        height: 0,
      });

    arrowService.updateDependencies(changes);

    expect(document.createElementNS).toHaveBeenCalledWith('http://www.w3.org/2000/svg', 'path');
    expect(document.createElementNS).toHaveBeenCalledTimes(3);
  });
});

interface RelativePosition {
  top: number;
  left: number;
  width: number;
  height: number;
  parent: {
    top: number;
    height: number;
  };
}

function createMockTimeline(): Timeline {
  const mockTimeline = {
    on: jasmine.createSpy('on'),
    itemSet: {
      items: [],
    },
    dom: {
      center: {
        parentNode: {
          appendChild: jasmine.createSpy('appendChild'),
        },
      },
    },
  } as Timeline;

  return mockTimeline;
}

function convertToItems(tasks: Task[]): { [_: string]: RelativePosition; } {
  const items: { [_: string]: RelativePosition; } = {};
  for (const task of tasks) {
    items[task.id] = {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      parent: {
        top: 0,
        height: 0,
      }
    };
  }
  return items;
}
