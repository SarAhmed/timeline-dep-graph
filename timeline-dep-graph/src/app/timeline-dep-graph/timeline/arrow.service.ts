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

import { Injectable } from '@angular/core';
import { Timeline } from 'vis';

import { Task } from '../Task';
import { TaskId } from './../Task';
import { DependencyChanges } from './dependency_changes_lib.';
import { AbsolutePosition, isValidAbsolutePosition, PositionService } from './position.service';

interface ArrowCoordinates {
  start: AbsolutePosition;
  end: AbsolutePosition;
}

@Injectable()
export class ArrowService {
  private svg: SVGSVGElement;
  private readonly outgoingArrowsMap =
    new Map<TaskId, Map<TaskId, SVGPathElement>>();
  private readonly incomingArrowsMap =
    new Map<TaskId, Map<TaskId, SVGPathElement>>();
  private timeline: Timeline;

  constructor(private positionService: PositionService) { }

  setTimeline(timeline: Timeline): void {
    this.timeline = timeline;
    this.renderSVG();
    this.renderArrowHead();

    this.timeline.on('changed', () => {
      this.updateArrowsCoordinates();
    });
  }

  updateDependencies(changes: DependencyChanges): void {
    this.removeArrows(changes.remove);
    this.addArrows(changes.add);
    this.updateArrows(changes.update);
  }

  private updateArrows(tasks: Task[]): void {
    const childrenIds = new Set<TaskId>();

    for (const task of tasks) {
      const outgoingArrows = this.outgoingArrowsMap.get(task.id);
      for (const child of task.dependants) {
        childrenIds.add(child.id);
        if (!outgoingArrows || !outgoingArrows.has(child.id)) {
          this.addArrow(task.id, child.id);
        }
      }

      for (const [childId, arrow] of outgoingArrows || []) {
        if (!childrenIds.has(childId)) {
          this.removeArrow(task.id, childId, arrow);
        }
      }
    }
  }

  private addArrows(tasks: Task[]): void {
    for (const task of tasks) {
      for (const child of task.dependants) {
        this.addArrow(task.id, child.id);
      }
    }
  }

  private addArrow(parentId: TaskId, childId: TaskId): void {
    const arrowCoordinates = this.getArrowCoordinates(parentId, childId);
    if (!arrowCoordinates) {
      return;
    }
    const arrow = this.createPath();
    setArrowCoordinates(arrow, arrowCoordinates.start, arrowCoordinates.end);

    let outgoingArrows = this.outgoingArrowsMap.get(parentId);
    if (!outgoingArrows) {
      outgoingArrows = new Map<TaskId, SVGPathElement>();
      this.outgoingArrowsMap.set(parentId, outgoingArrows);
    }
    outgoingArrows.set(childId, arrow);

    let incomingArrows = this.incomingArrowsMap.get(childId);
    if (!incomingArrows) {
      incomingArrows = new Map<TaskId, SVGPathElement>();
      this.incomingArrowsMap.set(childId, incomingArrows);
    }
    incomingArrows.set(parentId, arrow);
  }

  private removeArrows(tasks: Task[]): void {
    for (const task of tasks) {
      // Remove outgoing arrows from the task.
      const outgoingArrows = this.outgoingArrowsMap.get(task.id);
      if (outgoingArrows) {
        for (const [childId, arrow] of outgoingArrows) {
          this.removeArrow(task.id, childId, arrow);
        }
      }

      // Remove incoming arrows to the task.
      const incomingArrows = this.incomingArrowsMap.get(task.id);
      if (incomingArrows) {
        for (const [parentId, arrow] of incomingArrows) {
          this.removeArrow(parentId, task.id, arrow);
        }
      }
    }
  }

  private removeArrow(parentId: TaskId, childId: TaskId, arrow: SVGPathElement):
    void {
    this.outgoingArrowsMap.get(parentId)?.delete(childId);
    this.incomingArrowsMap.get(childId)?.delete(parentId);
    this.svg.removeChild(arrow);
  }

  private renderSVG(): void {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    this.svg.style.position = 'absolute';
    this.svg.style.top = '0px';
    this.svg.style.height = '100%';
    this.svg.style.width = '100%';
    this.svg.style.display = 'block';
    this.svg.style.zIndex = '-2';

    this.timeline.dom.center.parentNode.appendChild(this.svg);
  }

  private renderArrowHead(): void {
    const head = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'marker'
    );
    const headPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );

    head.setAttribute('id', 'arrowhead');
    head.setAttribute('viewBox', '0 0 10 10');
    head.setAttribute('refX', '5');
    head.setAttribute('refY', '5');
    head.setAttribute('orient', 'auto');
    head.setAttribute('markerWidth', '6');
    head.setAttribute('markerHeight', '6');

    headPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    headPath.style.fill = 'black';

    head.appendChild(headPath);
    this.svg.appendChild(head);
  }

  private updateArrowsCoordinates(): void {
    for (const [parentId, children] of this.outgoingArrowsMap) {
      for (const [childId, arrow] of children) {
        const arrowCoordinates = this.getArrowCoordinates(parentId, childId);
        if (!arrowCoordinates) {
          continue;
        }
        setArrowCoordinates(
          arrow, arrowCoordinates.start, arrowCoordinates.end);
      }
    }
  }

  private getArrowCoordinates(parentId: string, childId: string)
    : ArrowCoordinates | undefined {
    const start = this.positionService.getTaskPositionById(parentId);
    if (!start) {
      return;
    }

    const end = this.positionService.getTaskPositionById(childId);
    if (!end) {
      return;
    }

    /*
     * When the item is outside the window frame (i.e. horizontal overflow),
     * the start / end coordinates are null.
     */
    if (start.right == null || start.left == null) {
      // Put the start-task on the same horizonral level as the end-task.
      start.midY = end.midY;
      start.height = end.height;

      start.right = 0;
      start.left = 0;
    }
    if (end.left == null) {
      // Put the end-task on the same horizonral level as the start-task.
      end.midY = start.midY;
      end.height = start.height;

      end.right = window.innerWidth;
      end.left = window.innerWidth;
    }
    return { start, end };
  }

  private createPath(): SVGPathElement {
    const path = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    path.setAttribute('d', 'M 0 0');
    path.style.stroke = 'black';
    path.style.strokeWidth = '1px';
    path.style.fill = 'none';
    this.svg.appendChild(path);

    return path;
  }
}

function setArrowCoordinates(
  arrow: SVGPathElement, start: AbsolutePosition, end: AbsolutePosition): void {
  if (!isValidAbsolutePosition(start) || !isValidAbsolutePosition(start)) {
    return;
  }
  const bezierCurve = Math.min(start.height, end.height);
  arrow.setAttribute('marker-end', 'url(#arrowhead)');
  arrow.setAttribute(
    'd',
    `M ${start.right} ${start.midY} C ${start.right + bezierCurve} ${start.midY} ${end.left - bezierCurve} ${end.midY} ${end.left} ${end.midY}`
  );
}
