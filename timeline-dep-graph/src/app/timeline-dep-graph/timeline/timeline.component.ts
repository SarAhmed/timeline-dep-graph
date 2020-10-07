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

import { ItemData, maptoItem } from './../Item';
import { getTaskById, Task, TaskId } from './../Task';
import { ArrowService } from './arrow.service';
import { DependencyChanges, getdependencyChanges } from './dependency_changes_lib.';
import { HirerachyService } from './hirerachy.service';
import { TimeTooltipService } from './time_tooltip.service';

@Component({
  selector: 'tdg-timeline',
  providers: [
    ArrowService,
    TimeTooltipService,
    HirerachyService,
  ],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements AfterViewInit, OnChanges {

  timeline: Timeline;
  private items = new DataSet<ItemData>();

  @ViewChild('timelineVis', { static: true }) timelineVis: ElementRef;

  constructor(private readonly cdRef: ChangeDetectorRef,
              private readonly arrowService: ArrowService,
              private readonly timeTooltipService: TimeTooltipService,
              private readonly hirerachyService: HirerachyService,
  ) { }

  @Input() tasks: Task[] = [];

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

  /**
   * Adjust the visible window such that,
   * the selected task is centered on screen.
   */
  @Input() focusTask?: TaskId;

  ngAfterViewInit(): void {
    this.renderTimeline();
    this.arrowService.setTimeline(this.timeline);
    this.timeTooltipService.setTimeline(this.timeline);
    this.hirerachyService.setTimeline(this.timeline);
    this.timeline.on('select', (props: { items: string }) => {
      if (props == null || props.items.length === 0) {
        return;
      }
      const itemId = props.items[0];
      const task = getTaskById(this.tasks, itemId);
      if (task) {
        this.expandtask(task);
      }
    });

    this.updateDepGraph({
      add: this.tasks,
      remove: [],
      update: []
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.timeline) {
      return;
    }
    if (changes.tasks) {
      const prev = changes.tasks.previousValue || [];
      const curr = changes.tasks.currentValue || [];
      const updatedTasks = getdependencyChanges(prev, curr);
      this.updateDepGraph(updatedTasks);
    }
    if (changes.focusTask) {
      const prev = changes.focusTask.previousValue;
      const curr = changes.focusTask.currentValue;
      this.focusOn(prev, curr);
    }
  }

  private expandtask(task: Task): void {
    if (task == null || task.subTasks == null || task.subTasks.length === 0) {
      return;
    }
    this.updateDepGraph({
      add: task.subTasks || [],
      remove: [],
      update: []
    });

    this.arrowService.setExpandedTaskDependencies(task);

    this.updateDepGraph({
      add: [],
      remove: [task],
      update: []
    });

    this.hirerachyService.setHirerachy(task);
  }

  private focusOn(prev: ItemData, curr: ItemData): void {
    if (prev) {
      const prevItem = this.timeline.itemSet.items[prev].data;
      this.removeHighlightOnItem(prevItem);
    }
    if (curr) {
      const currItem = this.timeline.itemSet.items[curr].data;
      this.timeline.focus(curr);
      this.highlightItem(currItem);
    }
  }

  private updateDepGraph(updatedTasks: DependencyChanges): void {
    this.updateItems(updatedTasks);
    this.arrowService.updateDependencies(updatedTasks);
  }

  private updateItems(updatedTasks: DependencyChanges): void {
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
      template: this.generateItemTemplate,
      order: (a: ItemData, b: ItemData) => a.id.localeCompare(b.id),
    };

    if (this.width != null) {
      timelineOptions.width = this.width;
    }
    if (this.minHeight != null) {
      timelineOptions.minHeight = this.minHeight;
    }

    return timelineOptions;
  }

  private generateItemTemplate(
    before: ItemData, el: HTMLElement, after: ItemData): string {
    return `
    <div class="tdg-itemDetails">
      <b>&nbsp;&nbsp;${before.name}</b>
      <svg class="tdg-task-progress-bar">
        <rect x="0" y="0" rx="5" ry="5" height="100%" width="100%" class="tdg-${before.status}"/>
      </svg>
      <small class="tdg-${before.status}">&nbsp;&nbsp;${before.status}</small>
    </div>
    `;
  }

  private highlightItem(item: ItemData): void {
    const originialClassName = item.className;
    this.items.update({
      id: item.id,
      className: `${originialClassName} highlighted`,
    });
  }

  private removeHighlightOnItem(item: ItemData): void {
    const originialClassName = item.className.replace(' highlighted', '');
    this.items.update({
      id: item.id,
      className: originialClassName,
    });
  }
}
