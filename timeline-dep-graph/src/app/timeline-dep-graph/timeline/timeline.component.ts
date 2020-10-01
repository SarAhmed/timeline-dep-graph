import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DataSet, Timeline, TimelineOptions } from 'vis';

import { ArrowGeneratorService } from './../arrow-generator.service';
import { Item, maptoItem } from './../Item';
import { equalsTask, Task, TaskId } from './../Task';

export interface ItemPosition {
  left: number;
  top: number;
  right: number;
  bottom: number;
  mid_x: number;
  mid_y: number;
  width: number;
  height: number;
}

interface TaskChangesHolder {
  prev?: Task;
  curr?: Task;
}

interface DependeciesChanges {
  add: Task[];
  remove: Task[];
}

@Component({
  selector: 'tdg-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements AfterViewInit, OnChanges {

  timeline: Timeline;
  private svg: SVGSVGElement;
  private items = new DataSet<Item>();
  private itemPositionMap = new Map<TaskId, ItemPosition>();
  private outgoingArrowsMap = new Map<TaskId, Map<TaskId, SVGPathElement>>();
  private incomingArrowsMap = new Map<TaskId, Map<TaskId, SVGPathElement>>();

  @ViewChild('timelineVis', { static: true }) timelineVis: ElementRef;

  constructor(private readonly cdRef: ChangeDetectorRef,
              private readonly arrowGenerator: ArrowGeneratorService,
  ) { }

  @Input() tasks: Task[] = [];

  /**
   * The height of the timeline is in pixels or as a percentage.
   * When height is undefined or null,
   * the height of the timeline is automatically adjusted to fit the contents.
   * ```
   * height = 400; // Sets the timeline's height to 400px
   * height = "400px"; // Sets the timeline's height to 400px
   * height = "50%"; // Timeline spans 50% of its parent's height.
   * ```
   * It is possible to set a maximum height using option `maxHeight`;
   * to prevent the timeline from getting too high;
   * in case of automatically calculated height.
   */
  @Input() height?: number | string;

  /**
   * The maxHeight of the timeline is in pixels or as a percentage.
   * ```
   * maxHeight = 400; // Sets the timeline's maximum height to 400px.
   * maxHeight = "400px"; // Sets the timeline's maximum height to 400px.
   * maxHeight = "50%"; // Timeline spans in maximum 50% of its parent's height.
   * ```
   */
  @Input() maxHeight?: number | string;

  /**
   * The minHeight of the timeline is in pixels or as a percentage.
   * ```
   * minHeight = 400; // Sets the timeline's minimum height to 400px.
   * minHeight = "400px"; // Sets the timeline's minimum height to 400px.
   * minHeight = "50%"; // Timeline spans in minimum 50% of its parent's height.
   * ```
   */
  @Input() minHeight?: number | string;

  /**
   * The width of the timeline is in pixels or as a percentage.
   * When width is undefined or null,
   * the width of the timeline spans 100% of its parent's width.
   * width = 400; // Sets the timeline's width to 400px.
   * width = "400px"; // Sets the timeline's width to 400px.
   * width = "50%"; // Timeline spans 50% of its parent's width.
   */
  @Input() width?: number | string;

  ngAfterViewInit(): void {
    this.renderTimeline();
    this.renderSVG();
    this.checkTasksChanges([], this.tasks);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.tasks || !this.timeline) {
      return;
    }
    const prev = changes.tasks.previousValue || [];
    const curr = changes.tasks.currentValue || [];
    this.checkTasksChanges(prev, curr);
  }

  /**
   * Checks if there is any changes in the input tasks array,
   * and updates the dependecy graph accordingly
   */
  private checkTasksChanges(prev: Task[], curr: Task[]): void {
    const map = new Map<TaskId, TaskChangesHolder>();

    for (const task of prev) {
      map.set(task.id, { prev: task });
    }

    for (const task of curr) {
      if (map.has(task.id)) {
        map.get(task.id).curr = task;
      } else {
        map.set(task.id, { curr: task });
      }
    }

    const updatedDependecis: DependeciesChanges = {
      add: [],
      remove: [],
    };
    for (const val of map.values()) {
      const prevTask = val.prev;
      const currTask = val.curr;

      if (!currTask) {
        const item = maptoItem(prevTask);
        this.items.remove(item);
        this.itemPositionMap.delete(item.id);
        updatedDependecis.remove.push(prevTask);
      }
      else if (!prevTask) {
        const item = maptoItem(currTask);
        this.items.add(item);
        this.itemPositionMap.set(item.id, this.getItemPosition(item.id));
        updatedDependecis.add.push(currTask);
      }
      else if (!equalsTask(currTask, prevTask)) {
        const item = maptoItem(currTask);
        this.items.update(item);
        this.itemPositionMap.set(item.id, this.getItemPosition(item.id));
      }
    }
    this.updateDependencies(updatedDependecis);
  }

  private updateDependencies(changes: DependeciesChanges): void {
    for (const task of changes.remove) {
      const outgoingArrows = this.outgoingArrowsMap.get(task.id);
      if (!outgoingArrows) {
        continue;
      }
      for (const [childId, arrow] of outgoingArrows) {
        this.arrowGenerator.removeArrow(this.svg, arrow);
        outgoingArrows.delete(childId);

        this.incomingArrowsMap.get(childId).delete(task.id);
      }
      const incomingArrows = this.incomingArrowsMap.get(task.id);

      if (!incomingArrows) {
        continue;
      }
      for (const [parentId, arrow] of incomingArrows) {
        this.arrowGenerator.removeArrow(this.svg, arrow);
        incomingArrows.delete(parentId);

        this.outgoingArrowsMap.get(parentId).delete(task.id);

      }
    }

    for (const task of changes.add) {
      let outgoingArrows = this.outgoingArrowsMap.get(task.id);
      if (!outgoingArrows) {
        outgoingArrows = new Map<TaskId, SVGPathElement>();
        this.outgoingArrowsMap.set(task.id, outgoingArrows);
      }

      for (const child of task.dependants) {
        const start = this.itemPositionMap.get(task.id);
        const end = this.itemPositionMap.get(child.id);
        const arrow = this.arrowGenerator.addArrow(this.svg, start, end);
        outgoingArrows.set(child.id, arrow);

        let incomingArrows = this.incomingArrowsMap.get(child.id);
        if (!incomingArrows) {
          incomingArrows = new Map<TaskId, SVGPathElement>();
          this.incomingArrowsMap.set(child.id, incomingArrows);
        }
        incomingArrows.set(task.id, arrow);
      }
    }
  }

  private renderSVG(): void {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    this.svg.style.position = 'absolute';
    this.svg.style.top = '0px';
    this.svg.style.height = '100%';
    this.svg.style.width = '100%';
    this.svg.style.display = 'block';

    this.timeline.dom.center.appendChild(this.svg);
  }

  private renderTimeline(): void {
    const timelineOptions = this.getTimelineOptions();

    this.timeline = new Timeline(
      this.timelineVis.nativeElement,
      this.items,
      timelineOptions);
    this.cdRef.detectChanges();

    this.timeline.on('changed', () => {
      this.reCalculateItemsPositions();
      this.updateArrowsCoordinates();
    });
  }

  private reCalculateItemsPositions(): void {
    for (const id of this.itemPositionMap.keys()) {
      const currPos = this.getItemPosition(id);

      /*This is to a work around the vis.js bug,
        where items fall under the timeline
        when a certain zoom limit is exceeded.*/
      if (currPos.top > 0) {
        this.itemPositionMap.set(id, currPos);
      }
    }
  }

  private getItemPosition(id: TaskId): ItemPosition {
    const item = this.timeline.itemSet.items[id];

    const leftX = item.left;
    const topY = item.parent.top + item.parent.height - item.top - item.height;
    return {
      left: leftX,
      top: topY,
      right: leftX + item.width,
      bottom: topY + item.height,
      mid_x: leftX + item.width / 2,
      mid_y: topY + item.height / 2,
      width: item.width,
      height: item.height
    };
  }

  private updateArrowsCoordinates(): void {
    for (const [parentId, children] of this.outgoingArrowsMap) {
      for (const [childId, arrow] of children) {
        const start = this.itemPositionMap.get(parentId);
        const end = this.itemPositionMap.get(childId);
        if (!start || !end || !arrow) {
          continue;
        }

        this.arrowGenerator.setArrowCoordinates(arrow, start, end);
      }
    }
  }

  private getTimelineOptions(): TimelineOptions {
    const timelineStart = new Date();
    timelineStart.setDate(timelineStart.getDate() - 1);

    // Set the start of the timeline to one day before the current time.
    const timelineOptions: TimelineOptions = {
      start: timelineStart.getTime(),
    };

    if (this.height != null) {
      timelineOptions.height = this.height;
    }
    if (this.width != null) {
      timelineOptions.width = this.width;
    }
    if (this.maxHeight != null) {
      timelineOptions.maxHeight = this.maxHeight;
    }
    if (this.minHeight != null) {
      timelineOptions.minHeight = this.minHeight;
    }

    return timelineOptions;
  }

}
