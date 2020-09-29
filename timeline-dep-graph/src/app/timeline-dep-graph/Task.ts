export type TaskId = string;

export interface Task {
  readonly id: TaskId;
  name: string;
  dependants: Task[];
  startTime?: Date;
  finishTime?: Date;
}

export function equalsTask(task1: Task, task2: Task): boolean {
  return task1.id === task2.id
    && task1.name === task2.name
    && task1.startTime.getTime() === task2.startTime.getTime()
    && task1.finishTime.getTime() === task2.finishTime.getTime();
}
