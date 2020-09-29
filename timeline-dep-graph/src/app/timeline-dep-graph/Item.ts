import { Task } from './Task';

// Item represents the vis.js API associated with a task.
export interface Item {
  readonly id: string;
  content: string;
  start?: Date;
  end?: Date;
}

export function maptoItem(task: Task): Item {
  return {
    id: task.id,
    start: task.startTime,
    end: task.finishTime,
    content: task.name,
  };
}
