import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DataSet, Timeline, TimelineOptions } from 'vis';

@Component({
  selector: 'tdg-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements AfterViewInit {

  timeline: Timeline;
  private items = new DataSet();

  @ViewChild('timelineVis', { static: true }) timelineVis: ElementRef;

  constructor(private readonly cdRef: ChangeDetectorRef) { }

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
