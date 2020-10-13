import { TestBed } from '@angular/core/testing';
import { Timeline } from 'vis';

import { Status } from './../Status';
import { Task } from './../Task';
import { PositionService } from './position.service';

describe('PositionService', () => {
  let service: PositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PositionService,
      ]
    });
    service = TestBed.inject(PositionService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('gets the actual task position if presented on the timeline', () => {
    const mockTimeline = createMockTimeline();
    service.setTimeline(mockTimeline);

    const task1: Task = {
      id: '1',
      name: 'Task 1',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-09-28'),
      finishTime: new Date('2020-09-29'),
    };

    mockTimeline.itemSet.items = {
      '1': {
        top: 0,
        left: 0,
        width: 2,
        height: 2,
        parent: {
          top: 0,
          height: 2,
        }
      },
      '2': {
        top: 0,
        left: 5,
        width: 2,
        height: 2,
        parent: {
          top: 0,
          height: 2,
        }
      }
    };

    const pos = service.getTaskPosition(task1);
    expect(pos).toEqual(jasmine.objectContaining(
      {
        left: 0,
        top: 5,
        right: 2,
        bottom: 7,
        midX: 1,
        midY: 6,
        width: 2,
        height: 2,
      }
    ));
  });

  it('gets the actual task position corresponding to the task-id if presented on the timeline', () => {
    const mockTimeline = createMockTimeline();
    service.setTimeline(mockTimeline);

    const task1: Task = {
      id: '1',
      name: 'Task 1',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-09-28'),
      finishTime: new Date('2020-09-29'),
    };

    const tasks = [task1];
    service.setTasks(tasks);

    mockTimeline.itemSet.items = {
      '1': {
        top: 0,
        left: 0,
        width: 2,
        height: 2,
        parent: {
          top: 0,
          height: 2,
        }
      },
      '2': {
        top: 0,
        left: 5,
        width: 2,
        height: 2,
        parent: {
          top: 0,
          height: 2,
        }
      }
    };

    const pos = service.getTaskPositionById('1');
    expect(pos).toEqual(jasmine.objectContaining(
      {
        left: 0,
        top: 5,
        right: 2,
        bottom: 7,
        midX: 1,
        midY: 6,
        width: 2,
        height: 2,
      }
    ));
  });

  it('gets the subtasks bounding-box position if the task is NOT presented on the timeline (i.e. expanded task)', () => {
    const mockTimeline = createMockTimeline();
    service.setTimeline(mockTimeline);

    const task1: Task = {
      id: '1',
      name: 'Task 1',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-09-28'),
      finishTime: new Date('2020-10-1'),
    };

    const taska: Task = {
      id: 'a',
      name: 'Task a',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-09-28'),
      finishTime: new Date('2020-10-29'),
    };

    const taskb: Task = {
      id: 'b',
      name: 'Task b',
      status: Status.SUCCESS,
      dependants: [],
      subTasks: [],
      startTime: new Date('2020-09-29'),
      finishTime: new Date('2020-10-1'),
    };

    task1.subTasks = [taska, taskb];
    const tasks = [task1];
    service.setTasks(tasks);

    mockTimeline.itemSet.items = {
      'a': {
        top: 0,
        left: 0,
        width: 2,
        height: 2,
        parent: {
          top: 0,
          height: 2,
        }
      },
      'b': {
        top: 0,
        left: 5,
        width: 2,
        height: 2,
        parent: {
          top: 0,
          height: 2,
        }
      }
    };

    const pos = service.getTaskPositionById('1');
    expect(pos).toEqual(jasmine.objectContaining(
      {
        left: 0,
        top: 5,
        right: 7,
        bottom: 7,
        midX: 3.5,
        midY: 6,
        width: 7,
        height: 2,
      }
    ));
  });

  it('returns undefined if the task nor its subtasks are presented on the timeline', () => {
    const mockTimeline = createMockTimeline();

    service.setTimeline(mockTimeline);
    service.setTasks([]);

    const pos = service.getTaskPositionById('abcd');
    expect(pos).toBeUndefined();
  });
});

function createMockTimeline(): Timeline {
  const mockTimeline = {
    itemSet: {
      items: {},
    },
    dom: {
      center: {
        parentNode: {
          offsetHeight: 12,
        },
        offsetHeight: 5,
      },
    },
  } as Timeline;

  return mockTimeline;
}
