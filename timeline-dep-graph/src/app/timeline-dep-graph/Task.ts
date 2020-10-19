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

import { Status } from './Status';

export type TaskId = string;

/**
 * Task represents a single node in the dependeny graph.
 */
export interface Task {
  readonly id: TaskId;
  name: string;
  status: Status;
  dependents: TaskId[];
  startTime?: Date;
  finishTime?: Date;
  subTasks: Task[];
}

/**
 * Checks if the tasks are equal in value or not.
 * @param task1 The first Task to be compared.
 * @param task2 The second Task to be compared.
 * @return Whether the compared tasks are equal in value or not.
 */
export function equalsTask(task1: Task, task2: Task): boolean {
  return equalTaskFields(task1, task2)
    && JSON.stringify(task1.dependents.sort()) ===
    JSON.stringify(task2.dependents.sort())
    && equalsTaskArray(task1.subTasks, task2.subTasks);
}

/**
 * Given an array of tasks, return the tasks that
 * do not depend on any other task.
 * @param tasks Array of tasks representing a directed acyclic graph (DAG).
 * @return Array of tasks that do not depend on any other task.
 */
export function rootTasks(tasks: Task[]): Task[] {
  const roots: Task[] = [];
  const visited = new Set<TaskId>();
  for (const task of tasks) {
    if (!visited.has(task.id)) {
      dfsTraversal(tasks, task, visited);
    }
  }
  for (const task of tasks) {
    if (!visited.has(task.id)) {
      roots.push(task);
    }
  }
  return roots;
}

/**
 * Given an array of tasks, return the tasks that
 * do not have any dependents.
 * @param tasks Array of tasks representing a directed acyclic graph (DAG).
 * @return Array of tasks that do not have any dependents.
 */
export function leafTasks(tasks: Task[]): Task[] {
  const leafs: Task[] = [];
  for (const task of tasks) {
    if (task.dependents.length === 0) {
      leafs.push(task);
    }
  }
  return leafs;
}

/**
 * Given an array of tasks and an id, return the task assositated with that id.
 * If the task is not found, return undefined instead.
 * @param tasks Array of tasks where the search will be done.
 * @param taskId The id corresponding to the task.
 * @return The task associated with the given id.
 */
export function getTaskById(tasks: Task[], taskId: TaskId): Task | undefined {
  for (const task of tasks) {
    if (task.id === taskId) { return task; }
    const t = getTaskById(task.subTasks, taskId);
    if (t) { return t; }
  }
  return undefined;
}

/**
 * Given an array of tasks and an id, return the super task of that id.
 * If the task is not found, return undefined instead.
 * @param tasks Array of tasks where the search will be done.
 * @param taskId The id corresponding to the task.
 * @return The super task of the given id.
 */
export function getSuperTask(tasks: Task[], taskId: TaskId): Task | undefined {
  for (const task of tasks) {
    for (const sub of task.subTasks) {
      if (sub.id === taskId) {
        return task;
      }
    }
    const sup = getSuperTask(task.subTasks, taskId);
    if (sup) {
      return sup;
    }
  }
  return undefined;
}

/**
 * Checks if the tasks' fields are equal or not.
 * @param task1 The first Task to be compared.
 * @param task2 The second Task to be compared.
 * @return Whether the compared tasks' fields are equal or not.
 */
export function equalTaskFields(task1: Task, task2: Task): boolean {
  return task1.id === task2.id
    && task1.name === task2.name
    && task1.status === task2.status
    && task1.startTime?.getTime() === task2.startTime?.getTime()
    && task1.finishTime?.getTime() === task2.finishTime?.getTime();
}

/**
 * Checks if the given arrays have equal entries' fields
 * or not regardless of the entries order.
 * @param arr1 The first Task Array to be compared.
 * @param arr2 The first Task Array to be compared.
 * @return Whether the compared arrays' task fields are equal or not.
 */
export function equalsTaskArray(arr1: Task[], arr2: Task[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  arr1 = arr1.sort((a: Task, b: Task) => a.id.localeCompare(b.id));
  arr2 = arr2.sort((a: Task, b: Task) => a.id.localeCompare(b.id));
  for (const idx in arr1) {
    if (!equalTaskFields(arr1[idx], arr2[idx])) {
      return false;
    }
  }
  return true;
}

/**
 * Filter the tasks array to get the task(s) that started before the given time.
 * And set the finish time of the unfinished tasks to be the given time.
 * @param tasks Array of tasks to be filtered.
 * @param currTime The time based on the filtering will be done.
 */
export function patchAndFilterTasks(tasks: Task[], currTime: Date): Task[] {
  const filtered: Task[] = [];
  for (const task of tasks) {
    if (!task.startTime || task.startTime.getTime() >= currTime.getTime()) {
      continue;
    }
    const clonedTask = cloneTask(task);
    if (!clonedTask.finishTime) {
      clonedTask.finishTime = currTime;
    }
    clonedTask.subTasks = patchAndFilterTasks(clonedTask.subTasks, currTime);

    filtered.push(clonedTask);
  }
  return filtered;
}

function cloneTask(task: Task): Task {
  return {
    id: task.id,
    name: task.name,
    status: task.status,
    dependents: task.dependents,
    startTime: task.startTime,
    finishTime: task.finishTime,
    subTasks: task.subTasks.map(t => cloneTask(t)),
  };
}

function dfsTraversal(tasks: Task[], curr: Task, visisted: Set<TaskId>): void {
  for (const dep of curr.dependents) {
    if (!visisted.has(dep)) {
      visisted.add(dep);
      const deptask = getTaskById(tasks, dep);
      if (!deptask) {
        continue;
      }
      dfsTraversal(tasks, deptask, visisted);
    }
  }
}
