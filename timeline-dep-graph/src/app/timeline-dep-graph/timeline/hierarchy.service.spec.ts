import { TestBed } from '@angular/core/testing';
import { Timeline } from 'vis';

import { Status } from './../Status';
import { Task } from './../Task';
import { HierarchyService } from './hierarchy.service';
import { PositionService } from './position.service';

describe('HierarchyService', () => {
  let hierarchyService: HierarchyService;
  let positionService: PositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HierarchyService,
        PositionService,
      ]
    });
    hierarchyService = TestBed.inject(HierarchyService);
    positionService = TestBed.inject(PositionService);
  });

  it('creates the service', () => {
    expect(hierarchyService).toBeTruthy();
  });

  it('appends SVG to the timeline dom on setting the timeline', () => {
    const mockTimeline = createMockTimeline();

    spyOn(document, 'createElementNS').and.callThrough();

    hierarchyService.setTimeline(mockTimeline);

    expect(document.createElementNS).toHaveBeenCalledWith('http://www.w3.org/2000/svg', 'svg');
    expect(mockTimeline.dom.center.parentNode.appendChild)
      .toHaveBeenCalledWith(jasmine.any(SVGSVGElement));
  });

  it('add hierarchy element if the task has atleast one subtask', () => {
    const mockTimeline = createMockTimeline();
    hierarchyService.setTimeline(mockTimeline);

    const task1: Task = {
      id: '1',
      name: 'Task 1',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-09-28'),
      finishTime: new Date('2020-10-1'),
    };

    const taska: Task = {
      id: 'a',
      name: 'Task a',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-09-28'),
      finishTime: new Date('2020-10-29'),
    };

    const taskb: Task = {
      id: 'b',
      name: 'Task b',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-09-29'),
      finishTime: new Date('2020-10-1'),
    };

    task1.subTasks = [taska, taskb];

    spyOn(document, 'createElementNS').and.callThrough();
    spyOn(positionService, 'getTaskPosition').and.returnValue({
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      midX: 0,
      midY: 0,
      width: 0,
      height: 0,
    });

    hierarchyService.addHierarchyEl(task1);

    expect(document.createElementNS).toHaveBeenCalledWith('http://www.w3.org/2000/svg', 'rect');
    expect(document.createElementNS).toHaveBeenCalledWith('http://www.w3.org/2000/svg', 'text');
  });

  it('do NOT add hierarchy element if the task has no subtasks', () => {
    const mockTimeline = createMockTimeline();
    hierarchyService.setTimeline(mockTimeline);

    const task1: Task = {
      id: '1',
      name: 'Task 1',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-09-28'),
      finishTime: new Date('2020-10-1'),
    };

    spyOn(document, 'createElementNS').and.callThrough();
    spyOn(positionService, 'getTaskPosition').and.returnValue({
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      midX: 0,
      midY: 0,
      width: 0,
      height: 0,
    });

    hierarchyService.addHierarchyEl(task1);

    expect(document.createElementNS).not.toHaveBeenCalledWith('http://www.w3.org/2000/svg', 'rect');
    expect(document.createElementNS).not.toHaveBeenCalledWith('http://www.w3.org/2000/svg', 'text');
  });
});

function createMockTimeline(): Timeline {
  const mockTimeline = {
    on: jasmine.createSpy('on'),
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
