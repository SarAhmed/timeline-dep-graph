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
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Timeline } from 'vis';

import { Task, TaskId } from '../Task';
import { AbsolutePosition, addPadding, addTopPadding, isValidAbsolutePosition, PositionService } from './position.service';


type TaskName = SVGTextElement;
type TaskContainer = SVGRectElement;

interface HierarchyElement {
  taskId: TaskId;
  container: TaskContainer;
  taskName: TaskName;
}

@Injectable()
export class HierarchyService implements OnDestroy {
  private svg: SVGSVGElement;
  private timeline: Timeline;
  private readonly hierarchyMap = new Map<TaskId, HierarchyElement>();
  private readonly compressTask = new ReplaySubject<TaskId>(1);
  private readonly taskOver = new ReplaySubject<TaskId>(1);
  private readonly taskOut = new ReplaySubject<TaskId>(1);
  private readonly selectTask = new ReplaySubject<TaskId>(1);

  readonly compressTask$: Observable<TaskId> = this.compressTask;
  readonly TaskOver$: Observable<TaskId> = this.taskOver;
  readonly TaskOut$: Observable<TaskId> = this.taskOut;
  readonly selectTask$: Observable<TaskId> = this.selectTask;

  constructor(private positionService: PositionService) { }

  ngOnDestroy(): void {
    this.compressTask.complete();
    this.taskOver.complete();
    this.taskOut.complete();
    this.selectTask.complete();
  }

  setTimeline(timeline: Timeline): void {
    this.timeline = timeline;
    this.renderSVG();

    this.timeline.on('changed', () => {
      this.updateHierarchyPositions();
    });
  }

  addHierarchyEl(task: Task): void {
    if (task.subTasks.length === 0) {
      return;
    }
    const boundingBox = this.positionService.getTaskPosition(task);
    if (!boundingBox) {
      return;
    }

    const container = this.createContainer();
    this.setContainerStatus(container, task);
    container.id = `tdg-expanded-${task.id}`;

    container.addEventListener('click', (event: Event) => {
      const id = (event.target as HTMLElement)?.id;
      const taskId = id.split('tdg-expanded-')[1];
      this.compressTask.next(taskId);
    });

    container.addEventListener('mouseover', (event: Event) => {
      const id = (event.target as HTMLElement)?.id;
      const taskId = id.split('tdg-expanded-')[1];
      this.taskOver.next(taskId);
    });

    container.addEventListener('mouseout', (event: Event) => {
      const id = (event.target as HTMLElement)?.id;
      const taskId = id.split('tdg-expanded-')[1];
      this.taskOut.next(taskId);
    });

    const taskName = this.createTaskName(`${task.name}`);
    taskName.id = `tdg-expanded-task-name-${task.id}`;
    taskName.addEventListener('click', (event: Event) => {
      const id = (event.target as HTMLElement)?.id;
      const taskId = id.split('tdg-expanded-task-name-')[1];
      this.selectTask.next(taskId);
    });

    setHierarchyCoordinates(container, taskName, boundingBox);

    this.hierarchyMap.set(
      task.id, { taskId: task.id, container, taskName });
  }

  removeHierarchyEl(taskId: TaskId): void {
    const hierarchyEl = this.hierarchyMap.get(taskId);
    if (!hierarchyEl) {
      return;
    }
    this.hierarchyMap.delete(taskId);
    this.svg.removeChild(hierarchyEl.container);
    this.svg.removeChild(hierarchyEl.taskName);
  }

  updateHierarchyEl(task: Task): void {
    const hierarchyEl = this.hierarchyMap.get(task.id);
    if (!hierarchyEl) {
      return;
    }
    this.updateHierarchyElPosition(hierarchyEl);
    this.setContainerStatus(hierarchyEl.container, task);
    hierarchyEl.taskName.innerHTML = task.name;
  }

  isExpanded(taskId: TaskId): boolean {
    return this.hierarchyMap.has(taskId);
  }

  private setContainerStatus(container: SVGRectElement, task: Task): void {
    container.setAttribute('class', '');
    container.classList.add(`tdg-${task.status}`);
    container.classList.add('tdg-hierarchy');
    container.classList.add('tdg-pointer');
  }

  private updateHierarchyPositions(): void {
    for (const hierarchy of this.hierarchyMap.values()) {
      this.updateHierarchyElPosition(hierarchy);
    }
  }

  private updateHierarchyElPosition(hierarchyEl: HierarchyElement): void {
    const boundingBox =
      this.positionService.getTaskPositionById(hierarchyEl.taskId);
    if (!boundingBox) {
      return;
    }
    setHierarchyCoordinates(
      hierarchyEl.container, hierarchyEl.taskName, boundingBox
    );
  }

  private renderSVG(): void {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    this.svg.style.position = 'absolute';
    this.svg.style.top = '0px';
    this.svg.style.height = '100%';
    this.svg.style.width = '100%';
    this.svg.style.display = 'block';
    this.svg.style.zIndex = '-1';

    this.timeline.dom.center.parentNode.appendChild(this.svg);
  }

  private createContainer(): TaskContainer {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('rx', '5');
    rect.setAttribute('ry', '5');

    this.svg.appendChild(rect);

    return rect;
  }

  private createTaskName(content: string): TaskName {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.innerHTML = content;
    text.setAttribute('font-weight', 'bold');

    this.svg.appendChild(text);

    return text;
  }
}

function setContainerCoordinates(rect: TaskContainer, bbox: AbsolutePosition)
  : void {
  if (!isValidAbsolutePosition(bbox)) {
    return;
  }
  rect.setAttribute('x', `${bbox.left}`);
  rect.setAttribute('y', `${bbox.top}`);
  rect.setAttribute('width', `${bbox.width}`);
  rect.setAttribute('height', `${bbox.height}`);
}

function setTaskNameCoordinates(
  taskName: TaskName, bbox: AbsolutePosition): void {
  if (!isValidAbsolutePosition(bbox)) {
    return;
  }
  taskName.setAttribute('x', `${bbox.left + 10}`);
  taskName.setAttribute('y', `${bbox.top}`);
}

function setHierarchyCoordinates(
  rect: TaskContainer, taskName: TaskName, bbox: AbsolutePosition)
  : void {
  if (!isValidAbsolutePosition(bbox)) {
    return;
  }
  addPadding(bbox, 5);
  setContainerCoordinates(rect, bbox);
  addTopPadding(bbox, 5);
  setTaskNameCoordinates(taskName, bbox);
}
