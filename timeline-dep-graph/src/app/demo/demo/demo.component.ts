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

import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Status } from './../../timeline-dep-graph/Status';
import { Task, TaskId } from './../../timeline-dep-graph/Task';


const MS_PER_MIN = 60 * 1000;

@Component({
  selector: 'tdg-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
})
export class DemoComponent implements OnInit {

  tasks: Task[] = [];
  focus: TaskId;

  tdgForm: FormGroup = new FormGroup({
    tasks: new FormControl(''),
    focus: new FormControl(''),
  });

  @ViewChild('hoveredOnContainer') hoveredOnContainer: ElementRef;
  @ViewChild('selectedContainer') selectedContainer: ElementRef;

  constructor(private readonly cdref: ChangeDetectorRef) { }

  displaySelected(taskId: TaskId): void {
    (this.selectedContainer.nativeElement as HTMLElement).innerHTML = taskId;
  }

  taskOver(taskId: TaskId): void {
    (this.hoveredOnContainer.nativeElement as HTMLElement).innerHTML = taskId;
  }

  taskOut(taskId: TaskId): void {
    const span = (this.hoveredOnContainer.nativeElement as HTMLElement);
    if (span.innerHTML === taskId) {
      span.innerHTML = '';
    } else {
      alert('Something went wrong!');
    }
  }

  updateTasks(): void {
    this.tasks = this.parseInputTasks(JSON.parse(this.tdgForm.value.tasks));
    this.cdref.detectChanges();
  }

  focusTask(): void {
    this.focus = this.tdgForm.value.focus;
  }

  private parseInputTasks(tasks: any[]): Task[] {
    for (const task of tasks) {
      task.startTime =
        task.startTime === 'undefined' ? undefined : new Date(task.startTime);
      task.finishTime =
        task.finishTime === 'undefined' ? undefined : new Date(task.finishTime);

      task.subTasks = this.parseInputTasks(task.subTasks);
    }
    return tasks;
  }

  ngOnInit(): void {
    const now = new Date();
    const task0: Task = {
      id: '0',
      name: 'Task 0',
      status: Status.SUCCESS,
      dependents: [],
      subTasks: [],
      startTime: new Date(now.getTime() - 120 * MS_PER_MIN),
      finishTime: new Date(now.getTime() - 80 * MS_PER_MIN),
    };
    const task1: Task = {
      id: '1',
      name: 'Task 1',
      status: Status.SUCCESS,
      dependents: [],
      subTasks: [],
      startTime: new Date(now.getTime() - 76 * MS_PER_MIN),
      finishTime: new Date(now.getTime() - 30 * MS_PER_MIN),
    };
    const task2: Task = {
      id: '2',
      name: 'Task 2',
      status: Status.RUNNING,
      dependents: [],
      subTasks: [],
      startTime: new Date(now.getTime() - 25 * MS_PER_MIN),
    };
    const task2A: Task = {
      id: '2A',
      name: 'Task 2A',
      status: Status.SUCCESS,
      dependents: [],
      subTasks: [],
      startTime: new Date(now.getTime() - 25 * MS_PER_MIN),
      finishTime: new Date(now.getTime() - 5 * MS_PER_MIN),
    };
    const task2B: Task = {
      id: '2B',
      name: 'Task 2B',
      status: Status.RUNNING,
      dependents: [],
      subTasks: [],
      startTime: new Date(now.getTime() - 4 * MS_PER_MIN),
    };
    task2A.dependents = ['2B'];
    task2.subTasks = [task2A, task2B];

    const task3: Task = {
      id: '3',
      name: 'Task 3',
      status: Status.FAILED,
      dependents: [],
      subTasks: [],
      startTime: new Date(now.getTime() - 27 * MS_PER_MIN),
      finishTime: now,
    };
    const task3A: Task = {
      id: '3A',
      name: 'Task 3A',
      status: Status.SUCCESS,
      dependents: [],
      subTasks: [],
      startTime: new Date(now.getTime() - 27 * MS_PER_MIN),
      finishTime: new Date(now.getTime() - 15 * MS_PER_MIN),
    };
    const task3B: Task = {
      id: '3B',
      name: 'Task 3B',
      status: Status.SUCCESS,
      dependents: [],
      subTasks: [],
      startTime: new Date(now.getTime() - 14 * MS_PER_MIN),
      finishTime: new Date(now.getTime() - 7 * MS_PER_MIN),
    };
    const task3C: Task = {
      id: '3C',
      name: 'Task 3C',
      status: Status.SUCCESS,
      dependents: [],
      subTasks: [],
      startTime: new Date(now.getTime() - 14 * MS_PER_MIN),
      finishTime: new Date(now.getTime() - 8 * MS_PER_MIN),
    };
    const task3D: Task = {
      id: '3D',
      name: 'Task 3D',
      status: Status.FAILED,
      dependents: [],
      subTasks: [],
      startTime: new Date(now.getTime() - 5 * MS_PER_MIN),
      finishTime: now
    };
    task3A.dependents = ['3B', '3C'];
    task3B.dependents = ['3D'];
    task3C.dependents = ['3D'];

    task3.subTasks = [task3A, task3B, task3C, task3D];

    const task4: Task = {
      id: '4',
      name: 'Task 4',
      status: Status.RUNNING,
      dependents: [],
      subTasks: [],
      startTime: new Date(now.getTime() - 76 * MS_PER_MIN),
    };
    task0.dependents = ['1', '4'];
    task1.dependents = ['2', '3'];

    this.tasks = [task0, task1, task2, task3, task4];

    this.tdgForm.patchValue({
      tasks: JSON.stringify(this.tasks, undefined, 2),
    });
  }
}

