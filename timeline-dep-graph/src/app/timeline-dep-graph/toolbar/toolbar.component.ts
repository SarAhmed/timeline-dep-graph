import { Component, Input } from '@angular/core';
import { Timeline } from 'vis';

const ZOOM_RATIO = 0.2;
const MOTION_RATIO = 0.2;

@Component({
  selector: 'tdg-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  @Input('timeline') timeline: Timeline;

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

  private move(percentage): void {
    const range = this.timeline.getWindow();
    const interval = range.end - range.start;

    this.timeline.setWindow({
      start: range.start.valueOf() - interval * percentage,
      end: range.end.valueOf() - interval * percentage,
    });
  }

}
