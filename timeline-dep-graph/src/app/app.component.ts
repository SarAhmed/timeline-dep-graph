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

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Status } from './timeline-dep-graph/Status';
import { Task, TaskId } from './timeline-dep-graph/Task';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'timeline-dep-graph';
  constructor(private readonly cdRef: ChangeDetectorRef) { }

  tasksDemo: Task[];
  focus: TaskId;

  ngOnInit(): void {
    const task1: Task = {
      id: '1',
      name: 'Task 1',
      status: Status.SUCCESS,
      dependants: [],
      startTime: new Date('2020-09-28'),
      finishTime: new Date('2020-09-29'),
    };
    const task2: Task = {
      id: '2',
      name: 'Task 2',
      status: Status.SUCCESS,
      dependants: [],
      startTime: new Date('2020-10-02'),
      finishTime: new Date('2020-10-03'),
    };
    const task3: Task = {
      id: '3',
      name: 'Task 3',
      status: Status.SUCCESS,
      dependants: [],
      startTime: new Date('2020-10-03'),
      finishTime: new Date('2020-10-05'),
    };
    const task4: Task = {
      id: '4',
      name: 'Task 4',
      status: Status.RUNNING,
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
        status: Status.RUNNING,
        dependants: [],
        startTime: new Date('2020-09-29'),
        finishTime: new Date('2020-10-1'),
      };
      this.focus = '3';
      this.tasksDemo = [taskOne, task2, task3, task4];
      this.cdRef.detectChanges();
    }, 2000);

    setTimeout(() => {
      this.focus = null;
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
