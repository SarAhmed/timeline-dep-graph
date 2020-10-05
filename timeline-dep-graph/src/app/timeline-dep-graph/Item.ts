import { Status } from './Status';
import { Task } from './Task';

// Item represents the vis.js API associated with a task.
export interface Item {
  readonly 'id': string;
  name: string;
  status: Status;
  content: string;
  start?: Date;
  end?: Date;
  className?: string;
}

export function maptoItem(task: Task): Item {
  return {
    id: task.id,
    name: task.name,
    status: task.status,
    start: task.startTime,
    end: task.finishTime,
    content: task.name,
    className: 'transeparent',
  };
}
