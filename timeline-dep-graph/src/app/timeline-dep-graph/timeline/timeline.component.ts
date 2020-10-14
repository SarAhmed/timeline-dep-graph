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
import { getSuperTask, getTaskById, Task, TaskId } from './../Task';
import { ArrowService } from './arrow.service';
import { DependencyChanges, getdependencyChanges } from './dependency_changes_lib.';
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
  ],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements AfterViewInit, OnChanges, OnDestroy {
  timeline: Timeline;
  private items = new DataSet<ItemData>();
  private readonly destroyed$ = new ReplaySubject<void>();
  private isGrouped = false;

  @ViewChild('timelineVis', { static: true }) timelineVis: ElementRef;

  constructor(private readonly cdRef: ChangeDetectorRef,
    private readonly arrowService: ArrowService,
    private readonly timeTooltipService: TimeTooltipService,
    private readonly hierarchyService: HierarchyService,
    private readonly positionService: PositionService,
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

  @Output() selectedTask = new EventEmitter<TaskId>();

  @Output() hoveredTask = new EventEmitter<TaskId>();

  ngAfterViewInit(): void {
    this.renderTimeline();
    this.arrowService.setTimeline(this.timeline);
    this.timeTooltipService.setTimeline(this.timeline);
    this.hierarchyService.setTimeline(this.timeline);
    this.positionService.setTimeline(this.timeline);
    this.positionService.setTasks(this.tasks);

    this.timeline.on(
      'doubleClick', (props: { item: string, event: Event } | undefined) => {
        if (!props || !props.item) {
          return;
        }
        if (props.event.target instanceof SVGRectElement) {
          const itemId = props.item;
          const task = getTaskById(this.tasks, itemId);
          if (task) {
            this.expandtask(task);
          }
        }
      });

    this.hierarchyService.compressTask$.pipe(takeUntil(this.destroyed$))
      .subscribe(itemId => {
        const task = getTaskById(this.tasks, itemId);
        if (task) {
          this.compressTask(task);
        }
      });

    this.hierarchyService.hoverOnTask$.pipe(takeUntil(this.destroyed$))
      .subscribe(this.hoveredTask);

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
      'mouseOver', (props: { item: string, event: Event } | undefined) => {
        if (!props || !props.item) {
          return;
        }
        this.hoveredTask.emit(props.item);
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
    if (changes.tasks) { // Update the affected tasks only.
      const prev = changes.tasks.previousValue || [];
      const curr = changes.tasks.currentValue || [];
      this.positionService.setTasks(curr);

      const updatedTasks = getdependencyChanges(prev, curr);
      updatedTasks.add = this.getVisibleTasks(updatedTasks.add);
      updatedTasks.remove = this.getVisibleTasks(updatedTasks.remove);
      updatedTasks.update = this.getVisibleTasks(updatedTasks.update);

      this.updateDepGraph(updatedTasks);
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
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private expandtask(task: Task): void {
    if (this.hierarchyService.isExpanded(task.id)) {
      return;
    }
    const sup = getSuperTask(this.tasks, task.id);
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

  private focusOn(prev: TaskId, curr: TaskId): void {
    if (prev) {
      const prevItem = this.timeline.itemSet.items[prev]?.data;
      if (prevItem) {
        this.removeHighlightOnItem(prevItem);
      }
    }
    if (curr) {
      const task = getTaskById(this.tasks, curr);
      if (!task) {
        return;
      }
      this.compressTask(task);
      const sup = getSuperTask(this.tasks, task.id);
      if (sup) {
        this.expandtask(sup);
      }

      const currItem = this.timeline.itemSet.items[curr]?.data;
      this.timeline.focus(curr);
      this.highlightItem(currItem);
    }
  }

  private updateDepGraph(
    updatedTasks: DependencyChanges): void {
    this.updateItems(updatedTasks);
    this.arrowService.updateDependencies(updatedTasks);
  }

  private updateItems(updatedTasks: DependencyChanges): void {
    for (const task of updatedTasks.add) {
      const item = maptoItem(task, this.isGrouped);
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
        const item = maptoItem(task, this.isGrouped);
        this.items.update(item);
      }
    }

    for (const task of updatedTasks.remove) {
      if (this.hierarchyService.isExpanded(task.id)) {
        this.compressTask(task);
      }
      const item = maptoItem(task, this.isGrouped);
      this.items.remove(item);
    }
  }

  private getVisibleTasks(tasks: Task[]): Task[] {
    return tasks.filter(t => {
      const ancestor = getSuperTask(this.tasks, t.id);
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
      order: (a: ItemData, b: ItemData) => a.id.localeCompare(b.id),
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
