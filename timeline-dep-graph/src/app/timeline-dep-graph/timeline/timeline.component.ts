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

import { maptoItem } from './../Item';
import { equalsTask, Task, TaskId } from './../Task';

interface TaskChangesHolder {
  'prev'?: Task;
  'curr'?: Task;
}

interface DepGraphUpdates {
  'remove': Task[];
  'add': Task[];
  'update': Task[];
}

@Component({
  selector: 'tdg-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements AfterViewInit, OnChanges {

  timeline: Timeline;
  private items = new DataSet();

  @ViewChild('timelineVis', { static: true }) timelineVis: ElementRef;

  constructor(private readonly cdRef: ChangeDetectorRef) { }

  @Input() tasks: Task[] = [];

  /**
   * The height/width of the timeline in pixels or as a percentage.
   * When height is undefined or null,
   * the height of the timeline is automatically adjusted to fit the contents.
   */
  @Input() height?: number | string;
  @Input() width?: number | string;
  @Input() maxHeight?: number | string;
  @Input() minHeight?: number | string;

  ngAfterViewInit(): void {
    this.renderTimeline();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tasks) {
      const prev = changes.tasks.previousValue || [];
      const curr = changes.tasks.currentValue || [];
      this.checkTasksChanges(prev, curr);
    }
  }

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

    const changedTasks: DepGraphUpdates = { remove: [], add: [], update: [] };

    for (const [_, val] of map) {
      const prevTask = val.prev;
      const currTask = val.curr;

      if (!currTask) {
        changedTasks.remove.push(prevTask);
      } else if (!prevTask) {
        changedTasks.add.push(currTask);
      } else if (currTask && prevTask && !equalsTask(currTask, prevTask)) {
        changedTasks.update.push(currTask);
      }
    }
    this.updateDepGraph(changedTasks);
  }

  private updateDepGraph(changedTasks: DepGraphUpdates): void {
    for (const task of changedTasks.remove) {
      const item = maptoItem(task);
      this.items.remove(item);
    }

    for (const task of changedTasks.add) {
      const item = maptoItem(task);
      this.items.add(item);
    }

    for (const task of changedTasks.update) {
      const item = maptoItem(task);
      this.items.update(item);
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
