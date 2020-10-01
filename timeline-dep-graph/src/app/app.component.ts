import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Task } from './timeline-dep-graph/Task';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'timeline-dep-graph';
  constructor(private readonly cdRef: ChangeDetectorRef) { }

  tasksDemo: Task[];

  ngOnInit(): void {
    const task1: Task = {
      id: '1',
      name: 'Task 1',
      dependants: [],
      startTime: new Date('2020-09-28'),
      finishTime: new Date('2020-09-29'),
    };
    const task2: Task = {
      id: '2',
      name: 'Task 2',
      dependants: [],
      startTime: new Date('2020-10-02'),
      finishTime: new Date('2020-10-03'),
    };
    const task3: Task = {
      id: '3',
      name: 'Task 3',
      dependants: [],
      startTime: new Date('2020-10-03'),
      finishTime: new Date('2020-10-05'),
    };
    const task4: Task = {
      id: '4',
      name: 'Task 4',
      dependants: [],
      startTime: new Date('2020-10-03'),
      finishTime: new Date('2020-10-05'),
    };

    task1.dependants.push(task2);

    task2.dependants.push(task3);
    task2.dependants.push(task4);

    this.tasksDemo = [task1, task2, task3, task4];
    this.cdRef.detectChanges();
    setTimeout(() => {
      const taskOne: Task = {
        id: '1',
        name: 'Task 1',
        dependants: [],
        startTime: new Date('2020-09-29'),
        finishTime: new Date('2020-10-1'),
      };

      this.tasksDemo = [taskOne, task2, task3, task4];
      this.cdRef.detectChanges();
    }, 2000);

    setTimeout(() => {
      this.tasksDemo = [task3, task4];
      this.cdRef.detectChanges();
    }, 4000);

    setTimeout(() => {
      task1.dependants = [task3, task4];

      this.tasksDemo = [task1, task3, task4];
      this.cdRef.detectChanges();
    }, 6000);

    setTimeout(() => {
      task1.dependants = [task3];

      this.tasksDemo = [task1, task3];
      this.cdRef.detectChanges();
    }, 8000);

    setTimeout(() => {
      this.tasksDemo = [task3];
      this.cdRef.detectChanges();
    }, 10000);

    setTimeout(() => {
      this.tasksDemo = [];
      this.cdRef.detectChanges();
    }, 12000);
  }
}
