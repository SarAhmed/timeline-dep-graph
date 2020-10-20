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

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataSet, Timeline, TimelineOptions } from 'vis';

import { ItemData, maptoItem, setItemsGroups } from './../Item';
import { getSuperTask, getTaskById, patchAndFilterTasks, Task, TaskId } from './../Task';
import { ArrowService } from './arrow.service';
import { DependencyChanges, getdependencyChanges } from './dependency_changes_lib.';
import { GroupingService } from './grouping.service';
import { HierarchyService } from './hierarchy.service';
import { PositionService } from './position.service';
import { TimeTooltipService } from './time_tooltip.service';

@Component({
  selector: 'tdg-timeline',
  providers: [
    ArrowService,
    TimeTooltipService,
    HierarchyService,
    PositionService,
    GroupingService,
  ],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements AfterViewInit, OnChanges, OnDestroy {
  timeline: Timeline;
  private filteredTasks: Task[] = [];
  private readonly items = new DataSet<ItemData>();
  private readonly destroyed$ = new ReplaySubject<void>();
  private isGrouped = false;

  @ViewChild('timelineVis', { static: true }) timelineVis: ElementRef;

  constructor(private readonly cdRef: ChangeDetectorRef,
              private readonly arrowService: ArrowService,
              private readonly timeTooltipService: TimeTooltipService,
              private readonly hierarchyService: HierarchyService,
              private readonly positionService: PositionService,
              private readonly groupingService: GroupingService,
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

  /**
   * selectedTask is fired when the task name is being clicked on.
   */
  @Output() selectedTask = new EventEmitter<TaskId>();

  /**
   * taskOver is fired when the cursor moves over a task.
   */
  @Output() taskOver = new EventEmitter<TaskId>();

  /**
   * taskOut is fired when the cursor moves out of a task.
   */
  @Output() taskOut = new EventEmitter<TaskId>();

  ngAfterViewInit(): void {
    this.renderTimeline();
    this.filteredTasks = patchAndFilterTasks(this.tasks, new Date());
    this.arrowService.setTimeline(this.timeline);
    this.timeTooltipService.setTimeline(this.timeline);
    this.hierarchyService.setTimeline(this.timeline);
    this.positionService.setTimeline(this.timeline);
    this.positionService.setTasks(this.filteredTasks);
    this.groupingService.setTimeline(this.timeline);

    this.updateDepGraph({
      add: this.filteredTasks,
      remove: [],
      update: []
    });
    this.timeline.fit();

    this.timeline.on(
      'click', (props: { item: string, event: Event } | undefined) => {
        if (!props || !props.item) {
          return;
        }
        if (props.event.target instanceof SVGRectElement) {
          const itemId = props.item;
          const task = getTaskById(this.filteredTasks, itemId);
          if (task) {
            this.expandtask(task);
          }
        }
      });

    this.hierarchyService.compressTask$.pipe(takeUntil(this.destroyed$))
      .subscribe(itemId => {
        const task = getTaskById(this.filteredTasks, itemId);
        if (task) {
          this.compressTask(task);
        }
      });

    this.hierarchyService.TaskOver$.pipe(takeUntil(this.destroyed$))
      .subscribe(this.taskOver);

    this.hierarchyService.TaskOut$.pipe(takeUntil(this.destroyed$))
      .subscribe(this.taskOut);

    this.hierarchyService.selectTask$.pipe(takeUntil(this.destroyed$))
      .subscribe(this.selectedTask);

    this.timeline.on(
      'click', (props: { item: string, event: Event } | undefined) => {
        if (!props || !props.item) {
          return;
        }
        if (props.event.target instanceof HTMLSpanElement) {
          this.selectedTask.emit(props.item);
        }
      });

    this.timeline.on(
      'itemover', (props: { item: string, event: Event } | undefined) => {
        if (!props || !props.item) {
          return;
        }
        this.taskOver.emit(props.item);
      });

    this.timeline.on(
      'itemout', (props: { item: string, event: Event } | undefined) => {
        if (!props || !props.item) {
          return;
        }
        this.taskOut.emit(props.item);
      });

    this.timeline.on(
      'currentTimeTick', () => {
        const CURRENT_TIME = new Date();
        const newFilteredTasks = patchAndFilterTasks(this.tasks, CURRENT_TIME);

        const updatedTasks = getdependencyChanges(
          this.filteredTasks, newFilteredTasks);

        this.filteredTasks = newFilteredTasks;
        this.positionService.setTasks(this.filteredTasks);

        updatedTasks.add = this.getVisibleTasks(updatedTasks.add);
        updatedTasks.remove = this.getVisibleTasks(updatedTasks.remove);
        updatedTasks.update = this.getVisibleTasks(updatedTasks.update);
        this.updateDepGraph(updatedTasks);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.timeline) {
      return;
    }
    if (changes.tasks) { // Update the affected tasks only.
      const prev: Task[] = changes.tasks.previousValue || [];
      const curr: Task[] = changes.tasks.currentValue || [];

      const CURRENT_TIME = new Date();
      this.filteredTasks = patchAndFilterTasks(curr, new Date());
      this.positionService.setTasks(this.filteredTasks);

      const updatedTasks = getdependencyChanges(prev, curr);
      updatedTasks.add = patchAndFilterTasks(
        this.getVisibleTasks(updatedTasks.add), CURRENT_TIME);
      updatedTasks.remove = patchAndFilterTasks(
        this.getVisibleTasks(updatedTasks.remove), CURRENT_TIME);
      updatedTasks.update = patchAndFilterTasks(
        this.getVisibleTasks(updatedTasks.update), CURRENT_TIME);

      this.updateDepGraph(updatedTasks);

      if (prev.length === 0 && curr.length > 0) {
        this.timeline.fit();
      }
    }
    if (changes.focusTask) {
      const prev = changes.focusTask.previousValue;
      const curr = changes.focusTask.currentValue;
      this.focusOn(prev, curr);
    }
  }

  setIsGrouped(grouped: boolean): void {
    this.isGrouped = grouped;
    setItemsGroups(this.timeline.itemSet.items, this.isGrouped);
    if (this.isGrouped) {
      this.groupingService.groupTasks();
    } else {
      this.groupingService.unGroupTasks();
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private expandtask(task: Task): void {
    if (this.hierarchyService.isExpanded(task.id)) {
      return;
    }
    const sup = getSuperTask(this.filteredTasks, task.id);
    if (sup && !this.hierarchyService.isExpanded(sup.id)) {
      this.expandtask(sup);
    }

    if (task.subTasks.length === 0) {
      return;
    }

    this.updateDepGraph({
      add: task.subTasks,
      remove: [],
      update: []
    });

    this.updateItems({
      add: [],
      remove: [task],
      update: []
    });

    this.hierarchyService.addHierarchyEl(task);
  }

  private compressTask(task: Task): void {
    if (!this.hierarchyService.isExpanded(task.id)) {
      return;
    }
    for (const sub of task.subTasks) {
      this.compressTask(sub);
    }

    this.updateDepGraph({
      add: [],
      remove: task.subTasks,
      update: [],
    });

    this.updateItems({
      add: [task],
      remove: [],
      update: [],
    });

    this.hierarchyService.removeHierarchyEl(task.id);
  }

  private focusOn(prev: TaskId | undefined, curr: TaskId | undefined): void {
    if (prev) {
      const prevItem = this.timeline.itemSet.items[prev]?.data;
      if (prevItem) {
        this.removeHighlightOnItem(prevItem);
      }
    }
    if (curr) {
      const task = getTaskById(this.filteredTasks, curr);
      if (!task || !task.startTime || !task.finishTime) {
        return;
      }
      this.compressTask(task);
      const sup = getSuperTask(this.filteredTasks, task.id);
      if (sup) {
        this.expandtask(sup);
      }

      const currItem = this.timeline.itemSet.items[curr]?.data;

      /*
       * Set the timeline visible window's start time to
       * 5 seconds before the task start time,
       * and the end time to 5 seconds after the task finish time.
       */
      this.timeline.setWindow(
        new Date(task.startTime.getTime() - (1000 * 5)),
        new Date(task.finishTime.getTime() + (1000 * 5)));

      this.highlightItem(currItem);
    }
  }

  private updateDepGraph(
    updatedTasks: DependencyChanges): void {
    this.updateItems(updatedTasks);
    this.arrowService.updateDependencies(updatedTasks);
  }

  private updateItems(updatedTasks: DependencyChanges): void {
    this.groupingService.addGroups(
      [...updatedTasks.add, ...updatedTasks.update]);

    for (const task of updatedTasks.add) {
      const item = maptoItem(task, this.filteredTasks, this.isGrouped);
      this.items.add(item, this.isGrouped);
    }

    for (const task of updatedTasks.update) {
      if (this.hierarchyService.isExpanded(task.id)) {
        if (task.subTasks.length === 0) {
          this.compressTask(task);
        } else {
          this.hierarchyService.updateHierarchyEl(task);
        }
      } else {
        const item = maptoItem(task, this.filteredTasks, this.isGrouped);
        this.items.update(item);
      }
    }

    for (const task of updatedTasks.remove) {
      if (this.hierarchyService.isExpanded(task.id)) {
        this.compressTask(task);
      }
      const item = maptoItem(task, this.filteredTasks, this.isGrouped);
      this.items.remove(item);
    }
  }

  private getVisibleTasks(tasks: Task[]): Task[] {
    return tasks.filter(t => {
      const ancestor = getSuperTask(this.filteredTasks, t.id);
      return !ancestor || this.hierarchyService.isExpanded(ancestor.id);
    });
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
      order: (a: ItemData, b: ItemData) => a.fullId < b.fullId ? -1 : 1,
      margin: {
        item: 15,
      },
      orientation: 'both',
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
    <b>&nbsp;&nbsp<span class="tdg-taskName-b">${before.name}</span></b>
      <div class='tdg-task-progress-wrapper'>
        <svg class="tdg-task-progress-bar">
          <rect x="0" y="0" rx="5" ry="5" height="100%" width="100%" class="tdg-${before.status}"/>
        </svg>
        <div class="tdg-expand">${before.expandable ? '<b>+</b>' : ''}</div>
      </div>
      <small class="tdg-${before.status}">&nbsp;&nbsp;${before.status}</small>
    </div>
    `;
  }

  private highlightItem(item: ItemData): void {
    const originialClassName = item.className;
    item.className = `${item.className} highlighted`;
    this.items.update(item);
  }

  private removeHighlightOnItem(item: ItemData): void {
    item.className = `${item.className.replace(' highlighted', '')}`;
    this.items.update(item);
  }
}
