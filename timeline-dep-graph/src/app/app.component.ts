import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';

import { Task } from './timeline-dep-graph/Task';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'timeline-dep-graph';
  constructor(private readonly cdRef: ChangeDetectorRef) { }

  tasksDemo: Task[] = [{ // Test Add
    id: '1',
    name: 'Task 1',
    dependants: [],
    startTime: new Date('2020-09-28'),
    finishTime: new Date('2020-09-29'),
  }];

  ngAfterViewInit(): void {
    setTimeout(() => {
      const tasksDemo2 = [ // Test Add
        {
          id: '1',
          name: 'Task 1',
          dependants: [],
          startTime: new Date('2020-09-28'),
          finishTime: new Date('2020-09-29'),
        },
        {
        id: '2',
        name: 'Task 2',
        dependants: [],
        startTime: new Date('2020-09-28'),
        finishTime: new Date('2020-09-30'),
      }];
      this.tasksDemo = tasksDemo2;
      this.cdRef.detectChanges();

      setTimeout(() => {
        const tasksDemo3 = [ // Test Update
          {
            id: '1',
            name: 'Sarah',
            dependants: [],
            startTime: new Date('2020-09-28'),
            finishTime: new Date('2020-09-29'),
          },
          {
          id: '2',
          name: 'Task 2',
          dependants: [],
          startTime: new Date('2020-09-28'),
          finishTime: new Date('2020-09-30'),
        }];
        this.tasksDemo = tasksDemo3;
        this.cdRef.detectChanges();

        setTimeout(() => {
          const tasksDemo4 = [ // Test Remove
            {
              id: '1',
              name: 'Sarah',
              dependants: [],
              startTime: new Date('2020-09-28'),
              finishTime: new Date('2020-09-29'),
            },
            ];
          this.tasksDemo = tasksDemo4;
          this.cdRef.detectChanges();
        }, 2000);

      }, 2000);

    }, 2000);
  }
}
