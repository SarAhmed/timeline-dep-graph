import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Timeline } from 'vis';

import { Task, TaskId } from '../Task';
import { AbsolutePosition, addPadding, addTopPadding, PositionService } from './position.service';

interface HierarchyElement {
  taskId: TaskId;
  rect: SVGRectElement;
  taskName: SVGTextElement;
}

@Injectable()
export class HierarchyService {
  private svg: SVGSVGElement;
  private timeline: Timeline;
  private hierarchyMap = new Map<TaskId, HierarchyElement>();
  private compressTask = new BehaviorSubject<TaskId>('-');
  compressTask$ = this.compressTask.asObservable();

  constructor(private positionService: PositionService) { }

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

    const rect = this.createRect();
    rect.classList.add(`tdg-${task.status}`);
    rect.classList.add('tdg-hierarchy');
    rect.id = `tdg-expanded-${task.id}`;
    rect.addEventListener('click', (event: Event) => {
      const id = (event.target as HTMLElement)?.id;
      const taskId = id.split('tdg-expanded-')[1];
      this.compressTask.next(taskId);
    });

    const taskName = this.createText(`&nbsp;&nbsp;${task.name}`);

    this.hierarchyMap.set(task.id, { taskId: task.id, rect, taskName });
  }

  removeHierarchyEl(taskId: TaskId): void {
    const hierarchyEl = this.hierarchyMap.get(taskId);
    if (!hierarchyEl) {
      return;
    }
    this.hierarchyMap.delete(taskId);
    this.svg.removeChild(hierarchyEl.rect);
    this.svg.removeChild(hierarchyEl.taskName);
  }

  updateHierarchyEl(task: Task): void {
    this.removeHierarchyEl(task.id);
    this.addHierarchyEl(task);
  }

  isExpanded(taskId: TaskId): boolean {
    return this.hierarchyMap.has(taskId);
  }

  private updateHierarchyPositions(): void {
    for (const hierarchy of this.hierarchyMap.values()) {
      const boundingBox =
        this.positionService.getTaskPositionById(hierarchy.taskId);
      if (!boundingBox) {
        continue;
      }
      setHierarchyCoordinates(hierarchy.rect, hierarchy.taskName, boundingBox);
    }
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

  private createRect(): SVGRectElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('rx', '5');
    rect.setAttribute('ry', '5');

    this.svg.appendChild(rect);

    return rect;
  }

  private createText(content: string): SVGTextElement {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.innerHTML = content;
    text.setAttribute('font-weight', 'bold');

    this.svg.appendChild(text);

    return text;
  }
}

function setRectCoordinates(rect: SVGRectElement, bbox: AbsolutePosition)
  : void {
  rect.setAttribute('x', `${bbox.left}`);
  rect.setAttribute('y', `${bbox.top}`);
  rect.setAttribute('width', `${bbox.width}`);
  rect.setAttribute('height', `${bbox.height}`);
}

function setTaskNameCoordinates(
  taskName: SVGTextElement, bbox: AbsolutePosition): void {
  taskName.setAttribute('x', `${bbox.left}`);
  taskName.setAttribute('y', `${bbox.top}`);
}

function setHierarchyCoordinates(
  rect: SVGRectElement, taskName: SVGTextElement, bbox: AbsolutePosition)
  : void {
  addPadding(bbox, 5);
  setRectCoordinates(rect, bbox);
  addTopPadding(bbox, 5);
  setTaskNameCoordinates(taskName, bbox);
}
