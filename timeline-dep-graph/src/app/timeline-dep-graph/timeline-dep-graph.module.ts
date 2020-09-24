import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { TimelineComponent } from './timeline/timeline.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [
    TimelineComponent,
    ToolbarComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [
    TimelineComponent,
    ToolbarComponent,
  ],
})
export class TimelineDepGraphModule { }
