import { Item } from './Item';
import { Status } from './Status';
export type TaskId = string;

export interface Task {
  readonly id: TaskId;
  name: string;
  status: Status;
  dependants: Task[];
  startTime?: Date;
  finishTime?: Date;
}

export function equalsTask(task1: Task, task2: Task): boolean {
  return equalTaskFields(task1, task2)
    && equalsTaskArray(task1.dependants, task2.dependants);
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
