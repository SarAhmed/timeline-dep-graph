import { Task } from './Task';

export interface Item {
  readonly id: string;
  content: string;
  start?: Date;
  end?: Date;
}

export function maptoItem(task: Task): Item {
  const item = {
    id: task.id,
    start: task.startTime,
    end: task.finishTime,
    content: task.name,
  };
  return item;
}
