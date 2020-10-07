import { Status } from './Status';

export type TaskId = string;

/**
 * Task represents a single node in the dependeny graph.
 */
export interface Task {
  readonly id: TaskId;
  name: string;
  status: Status;
  dependants: Task[];
  startTime?: Date;
  finishTime?: Date;
  subTasks?: Task[];
}

/**
 * Checks if the tasks are equal in value ot not.
 * @param task1 The first Task to be compared.
 * @param task2 The second Task to be compared.
 * @return Whether the compared tasks are equal in value or not.
 */
export function equalsTask(task1: Task, task2: Task): boolean {
  return equalTaskFields(task1, task2)
    && equalsTaskArray(task1.dependants, task2.dependants);
}

/**
 * Given an array of tasks, return the tasks that
 * do not depend on any other task.
 * @param tasks Array of tasks representing a directed acyclic graph (DAG).
 * @return Array of tasks that do not depend on any other task.
 */
export function rootTasks(tasks: Task[]): Task[] {
  if (tasks == null) {
    return null;
  }
  const roots: Task[] = [];
  const visited = new Set<TaskId>();
  for (const item of tasks) {
    if (!visited.has(item.id)) {
      dfsTraversal(item, visited);
    }
  }
  for (const item of tasks) {
    if (!visited.has(item.id)) {
      roots.push(item);
    }
  }
  return roots;
}

/**
 * Given an array of tasks, return the tasks that
 * do not have any dependants.
 * @param tasks Array of tasks representing a directed acyclic graph (DAG).
 * @return Array of tasks that do not have any dependants.
 */
export function leafTasks(tasks: Task[]): Task[] {
  if (tasks == null) {
    return null;
  }
  const leafs: Task[] = [];
  for (const item of tasks) {
    if (item.dependants == null || item.dependants.length === 0) {
      leafs.push(item);
    }
  }
  return leafs;
}

/**
 * Given an array of tasks and an id, return the task assositated with that id.
 * If the task is not found, return null instead.
 * @param tasks Array of tasks where the search will be done.
 * @param taskId The id corresponding to the task.
 * @return The task associated with the given id.
 */
export function getTaskById(tasks: Task[], taskId: TaskId): Task {
  if (tasks == null) {
    return null;
  }
  for (const item of tasks) {
    if (item.id === taskId) { return item; }
    const t = getTaskById(item.subTasks, taskId);
    if (t !== null) { return t; }
  }
  return null;
}

function dfsTraversal(curr: Task, visisted: Set<TaskId>): Task {
  for (const dep of curr.dependants) {
    if (!visisted.has(dep.id)) {
      visisted.add(dep.id);
      const t = dfsTraversal(dep, visisted);
      if (t !== null) {
        return t;
      }
    }
  }
  return null;
}

function equalTaskFields(task1: Task, task2: Task): boolean {
  return task1.id === task2.id
    && task1.name === task2.name
    && task1.status === task2.status
    && task1.startTime.getTime() === task2.startTime.getTime()
    && task1.finishTime.getTime() === task2.finishTime.getTime();
}

function equalsTaskArray(arr1: Task[], arr2: Task[]): boolean {
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
