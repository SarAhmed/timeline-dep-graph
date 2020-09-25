import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
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

  constructor(private readonly cdRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.renderTimeline();
  }

  private renderTimeline(): void{
    const timelineStart = new Date();
    timelineStart.setDate(timelineStart.getDate() - 1);

    // Set the start of the timeline to one day before the current time.
    const timelineOptions: TimelineOptions = {start: timelineStart.getTime()};

    this.timeline  = new Timeline(this.timelineVis.nativeElement, this.items, timelineOptions);
    this.cdRef.detectChanges();
  }

}
