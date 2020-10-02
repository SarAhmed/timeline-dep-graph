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

import { Item, maptoItem } from './../Item';
import { Task } from './../Task';
import { ArrowService } from './arrow.service';
import { DependecyChanges, getDependecyChanges } from './dependency_changes_lib.';

@Component({
  selector: 'tdg-timeline',
  providers: [ArrowService],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements AfterViewInit, OnChanges {

  timeline: Timeline;
  private items = new DataSet<Item>();

  @ViewChild('timelineVis', { static: true }) timelineVis: ElementRef;

  constructor(private readonly cdRef: ChangeDetectorRef,
              private readonly arrowService: ArrowService,
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
    this.arrowService.setTimeline(this.timeline);
    this.updateDepGraph({
      add: this.tasks,
      remove: [],
      update: []
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.tasks || !this.timeline) {
      return;
    }
    const prev = changes.tasks.previousValue || [];
    const curr = changes.tasks.currentValue || [];
    const updatedTasks = getDependecyChanges(prev, curr);
    this.updateDepGraph(updatedTasks);
  }

  private updateDepGraph(updatedTasks: DependecyChanges): void {
    this.updateItems(updatedTasks);
    this.arrowService.updateArrows(updatedTasks);
  }

  private updateItems(updatedTasks: DependecyChanges): void {
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
