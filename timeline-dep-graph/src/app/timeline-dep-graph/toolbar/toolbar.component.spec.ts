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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Timeline } from 'vis';

import { ToolbarComponent } from './toolbar.component';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolbarComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the component', () => {
    expect(component).toBeTruthy();
  });

  it('calls zoomIn method on zooming in', () => {
    component.timeline = createMockTimeline();
    fixture.detectChanges();

    const deZoomInBtn = fixture.debugElement.query(By.css('button.zoomIn'));
    deZoomInBtn.nativeElement.click();

    expect(component.timeline.zoomIn).toHaveBeenCalled();
  });

  it('calls zoomOut method on zooming out', () => {
    component.timeline = createMockTimeline();
    fixture.detectChanges();

    const deZoomOutBtn = fixture.debugElement.query(By.css('button.zoomOut'));
    deZoomOutBtn.nativeElement.click();

    expect(component.timeline.zoomOut).toHaveBeenCalled();
  });

  it('moves the timeline window to the left with 0.2 precentage', () => {
    component.timeline = createMockTimeline();
    fixture.detectChanges();

    const deMoveLeftBtn = fixture.debugElement.query(By.css('button.moveLeft'));
    deMoveLeftBtn.nativeElement.click();

    expect(component.timeline.setWindow).toHaveBeenCalledWith({
      start: -0.2,
      end: 0.8,
    });
  });

  it('moves the timeline window to the right with 0.2 precentage', () => {
    component.timeline = createMockTimeline();
    fixture.detectChanges();

    const deMoveRightBtn = fixture.debugElement.query(
      By.css('button.moveRight')
    );
    deMoveRightBtn.nativeElement.click();

    expect(component.timeline.setWindow).toHaveBeenCalledWith({
      start: 0.2,
      end: 1.2,
    });
  });

  it('navigates to the beginning of the rollout', () => {
    component.timeline = createMockTimeline();
    fixture.detectChanges();

    const deFocusEarliestBtn = fixture.debugElement.query(
      By.css('button.focusEarliest')
    );
    deFocusEarliestBtn.nativeElement.click();

    expect(component.timeline.setWindow).toHaveBeenCalledWith({
      start: new Date(new Date('2020-10-10').getTime() - (1000 * 5)),
      end: new Date(new Date('2020-10-11').getTime() + (1000 * 5)),
    });
  });

  it('navigates to the beginning of the rollout', () => {
    component.timeline = createMockTimeline();
    fixture.detectChanges();

    const deFocusLatestBtn = fixture.debugElement.query(
      By.css('button.focusLatest')
    );
    deFocusLatestBtn.nativeElement.click();

    expect(component.timeline.setWindow).toHaveBeenCalledWith({
      start: new Date(new Date('2020-10-11').getTime() - (1000 * 5)),
      end: new Date(new Date('2020-10-12').getTime() + (1000 * 5)),
    });
  });

  it('fits the visible window of the timeline to contain all the tasks', () => {
    component.timeline = createMockTimeline();
    fixture.detectChanges();

    const deFitBtn = fixture.debugElement.query(
      By.css('button.fit')
    );
    deFitBtn.nativeElement.click();

    expect(component.timeline.fit).toHaveBeenCalled();
  });
});

function createMockTimeline(): Timeline {
  const mockTimeline = {
    zoomIn: jasmine.createSpy('zoomIn'),
    zoomOut: jasmine.createSpy('zoomOut'),
    setWindow: jasmine.createSpy('setWindow'),
    itemSet: {
      items: {
        'a': {
          data: {
            start: new Date('2020-10-10'),
            end: new Date('2020-10-11'),
          }
        },
        'b': {
          data: {
            start: new Date('2020-10-11'),
            end: new Date('2020-10-12'),
          }
        },
      }
    },
    getWindow: jasmine.createSpy('getWindow').and.returnValue({
      start: {
        valueOf: () => 0
      },
      end: {
        valueOf: () => 1
      }
    }),
    fit: jasmine.createSpy('fit'),
  } as Timeline;

  return mockTimeline;
}
