import { TimeTooltipService } from './time_tooltip.service';
import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrowService } from './arrow.service';
import { TimelineComponent } from './timeline.component';
import { Status } from '../Status';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;
  let mockedArrowService: Partial<ArrowService>;
  let mockedTimeTooltipService: Partial<ArrowService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimelineComponent],
      providers: [
        ArrowService,
        TimeTooltipService,
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    mockedArrowService = jasmine.createSpyObj<ArrowService>(['setTimeline', 'updateDependencies']);
    TestBed.overrideProvider(ArrowService, { useValue: mockedArrowService });

    mockedTimeTooltipService =
      jasmine.createSpyObj<ArrowService>(['setTimeline', 'updateDependencies']);
    TestBed.overrideProvider(
      ArrowService, { useValue: mockedTimeTooltipService }
    );

    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the component', () => {
    expect(component).toBeTruthy();
  });

  it('adds Task(s) to the timeline', () => {
    const dataSet = component.timeline.itemsData.getDataSet();
    spyOn(dataSet, 'add');

    component.tasks = [
      {
        id: '1',
        name: 'Task 1',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-29'),
      },
      {
        id: '2',
        name: 'Task 2',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-24'),
        finishTime: new Date('2020-09-27'),
      },
    ];
    component.ngOnChanges({
      tasks: new SimpleChange(null, component.tasks, null)
    });

    fixture.detectChanges();

    expect(dataSet.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '1' })
    );
    expect(dataSet.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '2' })
    );
  });

  it('removes Task(s) from the timeline', () => {
    const dataSet = component.timeline.itemsData.getDataSet();
    spyOn(dataSet, 'remove');

    const firstValue = component.tasks = [
      {
        id: '1',
        name: 'Task 1',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-29'),
      },
      {
        id: '2',
        name: 'Task 2',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-24'),
        finishTime: new Date('2020-09-27'),
      },
      {
        id: '3',
        name: 'Task 3',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-29'),
      },
      {
        id: '4',
        name: 'Task 4',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-24'),
        finishTime: new Date('2020-09-27'),
      },
    ];
    component.ngOnChanges({
      tasks: new SimpleChange(null, firstValue, true)
    });
    fixture.detectChanges();

    const secondValue = component.tasks = [
      {
        id: '4',
        name: 'Task 4',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-24'),
        finishTime: new Date('2020-09-27'),
      },
      {
        id: '1',
        name: 'Task 1',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-29'),
      },
    ];
    component.ngOnChanges({
      tasks: new SimpleChange(firstValue, secondValue, false)
    });
    fixture.detectChanges();

    expect(dataSet.remove).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '2' })
    );
    expect(dataSet.remove).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '3' })
    );
  });

  it('update Task(s) in the timeline', () => {
    const dataSet = component.timeline.itemsData.getDataSet();
    spyOn(dataSet, 'update');

    const firstValue = component.tasks = [
      {
        id: '1',
        name: 'Task 1',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-29'),
      },
      {
        id: '2',
        name: 'Task 2',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-24'),
        finishTime: new Date('2020-09-27'),
      },
      {
        id: '3',
        name: 'Task 3',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-29'),
      },
    ];
    component.ngOnChanges({
      tasks: new SimpleChange(null, firstValue, true)
    });
    fixture.detectChanges();

    const secondValue = component.tasks = [
      {
        id: '1',
        name: 'Task 1',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-29'),
      },
      {
        id: '2',
        name: 'Task TWO',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-24'),
        finishTime: new Date('2020-09-27'),
      },
      {
        id: '3',
        name: 'Task THREE',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-29'),
      },
    ];
    component.ngOnChanges({
      tasks: new SimpleChange(firstValue, secondValue, false)
    });
    fixture.detectChanges();

    expect(dataSet.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '2' })
    );
    expect(dataSet.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '3' })
    );
  });

  it('add & Remove & Update Task(s) in the timeline', () => {
    const dataSet = component.timeline.itemsData.getDataSet();
    spyOn(dataSet, 'add');
    spyOn(dataSet, 'remove');
    spyOn(dataSet, 'update');

    const firstValue = component.tasks = [
      {
        id: '1',
        name: 'Task 1',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-29'),
      },
      {
        id: '2',
        name: 'Task 2',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-24'),
        finishTime: new Date('2020-09-27'),
      },
      {
        id: '3',
        name: 'Task 3',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-29'),
      },
    ];
    component.ngOnChanges({
      tasks: new SimpleChange(null, firstValue, true)
    });
    fixture.detectChanges();

    const secondValue = component.tasks = [
      {
        id: '2',
        name: 'Task 2',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-24'),
        finishTime: new Date('2020-09-27'),
      },
      {
        id: '3',
        name: 'Task THREE',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-29'),
      },
      {
        id: '0',
        name: 'Task 0',
        status: Status.SUCCESS,
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-29'),
      },
    ];
    component.ngOnChanges({
      tasks: new SimpleChange(firstValue, secondValue, false)
    });
    fixture.detectChanges();

    expect(dataSet.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '1' })
    );
    expect(dataSet.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '2' })
    );
    expect(dataSet.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '3' })
    );
    expect(dataSet.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '0' })
    );
    expect(dataSet.add).toHaveBeenCalledTimes(4);

    expect(dataSet.remove).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '1' })
    );
    expect(dataSet.remove).toHaveBeenCalledTimes(1);

    expect(dataSet.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '3' })
    );
    expect(dataSet.update).toHaveBeenCalledTimes(1);
  });
});
