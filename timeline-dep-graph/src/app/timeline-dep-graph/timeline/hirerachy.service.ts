import { BehaviorSubject } from 'rxjs';
import { Timeline } from 'vis';

import { AbsolutePosition, getAbsolutePosition, getBoundingBox, RelativePosition } from './../Item';
import { Task, TaskId } from './../Task';

interface HirerachyElement {
  task: Task;
  rect: SVGRectElement;
  taskName: SVGTextElement;
}

export class HirerachyService {
  private svg: SVGSVGElement;
  private timeline: Timeline;
  private hirerachyMap = new Map<TaskId, HirerachyElement>();
  private compressTask = new BehaviorSubject<TaskId>('-');
  compressTask$ = this.compressTask.asObservable();

  setTimeline(timeline: Timeline): void {
    this.timeline = timeline;
    this.renderSVG();

    this.timeline.on('changed', () => {
      this.updateHirerachy();
    });
  }

  addHirerachyEl(task: Task): void {
    const positions = this.getTasksPositions(task.subTasks);
    const boundingBox = getBoundingBox(positions);
    if (!boundingBox) {
      return;
    }

    const rect = this.createRect();
    rect.classList.add(`tdg-${task.status}`);
    rect.classList.add('tdg-hirerachy');
    rect.id = `tdg-expanded-${task.id}`;
    rect.addEventListener('click', (event: Event) => {
      const id = (event.target as HTMLElement)?.id;
      const taskId = id.split('tdg-expanded-')[1];
      this.compressTask.next(taskId);
    });

    const taskName = this.createText(`&nbsp;&nbsp;${task.name}`);

    this.hirerachyMap.set(task.id, { task, rect, taskName });
    setHirerachyCoordinates(rect, taskName, boundingBox);
  }

  removeHirerachyEl(taskId: TaskId): void {
    const hirerachyEl = this.hirerachyMap.get(taskId);
    if (!hirerachyEl) {
      return;
    }
    this.hirerachyMap.delete(taskId);
    this.svg.removeChild(hirerachyEl.rect);
    this.svg.removeChild(hirerachyEl.taskName);
  }

  isExpanded(taskId: TaskId): boolean {
    return this.hirerachyMap.has(taskId);
  }

  private updateHirerachy(): void {
    for (const hirerachy of this.hirerachyMap.values()) {
      const positions = this.getTasksPositions(hirerachy.task.subTasks);
      const boundingBox = getBoundingBox(positions);

      if (!boundingBox) {
        continue;
      }

      setHirerachyCoordinates(hirerachy.rect, hirerachy.taskName, boundingBox);
    }
  }

  private getTasksPositions(tasks: Task[]): AbsolutePosition[] {
    return tasks.map(t => {
      const timelineHeight = this.timeline.dom.center.offsetHeight;
      const svgHeight = this.timeline.dom.center.parentNode.offsetHeight - 2;

      const item: RelativePosition = this.timeline.itemSet.items[t.id];
      if (!item) {
        const subTasks = this.getTasksPositions(t.subTasks);
        const bbox = getBoundingBox(subTasks);
        if (bbox) {
          addTopPadding(bbox, 20);
          return bbox;
        }
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
    this.svg.style.zIndex = '-1';
    this.svg.addEventListener('click',
      () => {
        console.log('console.log("wohoooo")');
      });

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

function addTopPadding(bbox: AbsolutePosition, amount: number): void {
  bbox.top -= amount;
  bbox.height += amount;
}

function addBottomPadding(bbox: AbsolutePosition, amount: number): void {
  bbox.bottom += amount;
  bbox.height += amount;
}

function addPadding(bbox: AbsolutePosition, amount: number): void {
  addTopPadding(bbox, amount);
  addBottomPadding(bbox, amount);
}

function setHirerachyCoordinates(
  rect: SVGRectElement, taskName: SVGTextElement, bbox: AbsolutePosition)
  : void {
  addPadding(bbox, 5);
  setRectCoordinates(rect, bbox);
  addTopPadding(bbox, 5);
  setTaskNameCoordinates(taskName, bbox);
}
