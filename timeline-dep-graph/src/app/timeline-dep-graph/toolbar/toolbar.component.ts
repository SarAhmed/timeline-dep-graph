import { Component, Input } from '@angular/core';
import { Timeline } from 'vis';

@Component({
  selector: 'tdg-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})
export class ToolbarComponent {

  @Input('timeline') timeline: Timeline;

  constructor() { }

  zoomIn(): void {
    this.timeline.zoomIn(0.2);
  }

  zoomOut(): void {
    this.timeline.zoomOut(0.2);
  }

  moveLeft(): void {
    this.move(0.2);
  }

  moveRight(): void {
    this.move(-0.2);
  }

  private move(percentage): void {
    const range = this.timeline.getWindow();
    const interval = range.end - range.start;

    this.timeline.setWindow({
      start: range.start.valueOf() - interval * percentage,
      end: range.end.valueOf() - interval * percentage
    });
  }

}
