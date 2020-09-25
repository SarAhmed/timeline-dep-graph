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

    const deMoveRightBtn = fixture.debugElement.query(By.css('button.moveRight'));
    deMoveRightBtn.nativeElement.click();

    expect(component.timeline.setWindow).toHaveBeenCalledWith({
      start: 0.2,
      end: 1.2,
    });
  });

});

function createMockTimeline(): Timeline {
  const mockTimeline = {
    zoomIn: jasmine.createSpy('zoomIn'),
    zoomOut: jasmine.createSpy('zoomOut'),
    setWindow: jasmine.createSpy('setWindow'),
    getWindow: jasmine.createSpy('getWindow').and.returnValue({
      start: {
        valueOf: () => 0
      },
      end: {
        valueOf: () => 1
      }
    })
  } as Timeline;

  return mockTimeline;
}
