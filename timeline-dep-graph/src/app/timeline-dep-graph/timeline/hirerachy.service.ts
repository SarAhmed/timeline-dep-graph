import { Injectable } from '@angular/core';
import { Timeline } from 'vis';

import { AbsolutePosition, getAbsolutePosition, getBoundingBox, RelativePosition } from './../Item';
import { Task, TaskId } from './../Task';

interface HirerachyElements {
  task: Task;
  rect: SVGRectElement;
  taskName: SVGTextElement;
}

@Injectable({
  providedIn: 'root'
})
export class HirerachyService {
  private svg: SVGSVGElement;
  private timeline: Timeline;
  private hirerachyMap = new Map<TaskId, HirerachyElements>();

  setTimeline(timeline: Timeline): void {
    this.timeline = timeline;
    this.renderSVG();

    this.timeline.on('changed', () => {
      this.updateHirerachy();
    });

  }

  setHirerachy(task: Task): void {
    const positions = this.getTasksPositions(task.subTasks);
    const boundingBox = getBoundingBox(positions);

    const rect = this.createRect();
    rect.classList.add(`tdg-${task.status}`);
    rect.classList.add('tdg-hirerachy');

    const taskName = this.createText(`&nbsp;&nbsp;${task.name}`);

    this.hirerachyMap.set(task.id, { task, rect, taskName });
    setRectCoordinates(rect, boundingBox);
    setTaskNameCoordinates(taskName, boundingBox);
  }

  private updateHirerachy(): void {
    for (const hirerachy of this.hirerachyMap.values()) {
      const positions = this.getTasksPositions(hirerachy.task.subTasks);
      const boundingBox = getBoundingBox(positions);

      setRectCoordinates(hirerachy.rect, boundingBox);
      setTaskNameCoordinates(hirerachy.taskName, boundingBox);
    }
  }

  private getTasksPositions(tasks: Task[]): AbsolutePosition[] {
    return tasks.map(t => {
      const timelineHeight = this.timeline.dom.center.offsetHeight;
      const svgHeight = this.timeline.dom.center.parentNode.offsetHeight - 2;

      const item: RelativePosition = this.timeline.itemSet.items[t.id];
      if (!item) {
        return undefined;
      }
      return getAbsolutePosition(item, timelineHeight, svgHeight);
    }).filter((t): t is AbsolutePosition => !!t);
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
  rect.setAttribute('y', `${bbox.top - 2.5}`);
  rect.setAttribute('width', `${bbox.width}`);
  rect.setAttribute('height', `${bbox.height + 5}`);
}

function setTaskNameCoordinates(
  taskName: SVGTextElement, bbox: AbsolutePosition): void {
  taskName.setAttribute('x', `${bbox.left}`);
  taskName.setAttribute('y', `${bbox.top - 7}`);
}
