import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Timeline } from 'vis';

import { Status } from './../Status';

const ZOOM_RATIO = 0.2;
const MOTION_RATIO = 0.2;

@Component({
  selector: 'tdg-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnChanges {

  grouped = true;

  @Input() timeline: Timeline;

  @Output() groupedTimeline = new EventEmitter<boolean>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.timeline) {
      return;
    }
    if (changes.timeline) {
      this.grouped = true;
      this.groupTasks();
    }
  }

  zoomIn(): void {
    this.timeline.zoomIn(ZOOM_RATIO);
  }

  zoomOut(): void {
    this.timeline.zoomOut(ZOOM_RATIO);
  }

  moveLeft(): void {
    this.move(MOTION_RATIO);
  }

  moveRight(): void {
    this.move(-MOTION_RATIO);
  }

  groupTasks(): void {
    this.grouped = !this.grouped;
    this.groupedTimeline.emit(this.grouped);

    if (this.grouped) {
      const groups: any = [];
      for (const status of Object.values(Status)) {
        const padding = {
          'id': `tdg-group-padding-${status}`,
          content: '<br>',
          style: 'border: 1px solid transparent;'
        };
        const group = {
          'id': status,
          content: status,
          style: 'text-transform: capitalize;'
        };
        groups.push(padding);
        groups.push(group);
      }
      this.timeline.setGroups(groups);
    } else {
      const groups = [
        {
          'id': 'tdg-group-padding-unGrouped',
          content: '<br>',
          style: 'border: 1px solid transparent;width: 0px;',
        },
        {
          'id': 'unGrouped',
          content: '<br>',
          style: 'width: 0px;',
        },
      ];
      this.timeline.setGroups(groups);
    }
  }

  private move(percentage): void {
    const range = this.timeline.getWindow();
    const interval = range.end - range.start;

    this.timeline.setWindow({
      start: range.start.valueOf() - interval * percentage,
      end: range.end.valueOf() - interval * percentage,
    });
  }

}
