import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TimelineComponent } from './timeline/timeline.component';

@NgModule({
  declarations: [
    TimelineComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    TimelineComponent,
  ],
})
export class TimelineDepGraphModule { }
