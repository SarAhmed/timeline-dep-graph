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

interface TaskChangesHolder {
  prev?: Task;
  curr?: Task;
}

export interface DependeciesChanges {
  add: Task[];
  remove: Task[];
  update: Task[];
}

@Component({
  selector: 'tdg-timeline',
  providers: [ArrowGeneratorService],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements AfterViewInit, OnChanges {

  timeline: Timeline;
  private items = new DataSet<Item>();

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
    this.arrowGenerator.setTimeline(this.timeline);
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

    const updatedTasks: DependeciesChanges = {
      add: [],
      remove: [],
      update: [],
    };
    for (const val of map.values()) {
      const prevTask = val.prev;
      const currTask = val.curr;

      if (!currTask) {
        updatedTasks.remove.push(prevTask);
      }
      else if (!prevTask) {
        updatedTasks.add.push(currTask);
      }
      else if (!equalsTask(currTask, prevTask)) {
        updatedTasks.update.push(currTask);
      }
    }

    this.updateItems(updatedTasks);
    this.arrowGenerator.updateArrows(updatedTasks);
  }

  private updateItems(updatedTasks: DependeciesChanges): void {
    for (const task of updatedTasks.add) {
      const item = maptoItem(task);
      this.items.add(item);
    }
    for (const task of updatedTasks.update) {
      const item = maptoItem(task);
      this.items.update(item);
    }
    for (const task of updatedTasks.remove) {
      const item = maptoItem(task);
      this.items.remove(item);
    }
  }

  private renderTimeline(): void {
    const timelineOptions = this.getTimelineOptions();

    this.timeline = new Timeline(
      this.timelineVis.nativeElement,
      this.items,
      timelineOptions);
    this.cdRef.detectChanges();
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
