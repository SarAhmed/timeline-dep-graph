import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataSet, Timeline } from 'vis';

@Component({
  selector: 'tdg-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.sass']
})
export class TimelineComponent implements OnInit {

  private timeline: Timeline;
  private items = new DataSet();

  @ViewChild('timelineVis', { static: true }) timelineVis: ElementRef;

  constructor() { }

  ngOnInit(): void {
    this.renderTimeline();
  }

  private renderTimeline(): void{
    const timelineStart = new Date();
    timelineStart.setDate(timelineStart.getDate() - 1);

    // Set the start of the timeline to one day before the current time.
    const timelineOptions = {'start': timelineStart.getTime()};

    this.timeline  = new Timeline(this.timelineVis.nativeElement, this.items, timelineOptions);
  }

}
