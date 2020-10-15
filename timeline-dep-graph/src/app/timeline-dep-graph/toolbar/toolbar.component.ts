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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Timeline } from 'vis';

const ZOOM_RATIO = 0.2;
const MOTION_RATIO = 0.2;

@Component({
  selector: 'tdg-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  grouped = false;

  @Input() timeline: Timeline;

  @Output() groupedTimeline = new EventEmitter<boolean>();

  constructor() { }

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

  fit(): void {
    this.timeline.fit();
  }

  groupTasks(): void {
    this.grouped = !this.grouped;
    this.groupedTimeline.emit(this.grouped);
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
