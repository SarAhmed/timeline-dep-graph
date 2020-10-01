import { Task } from '../Task';

export interface DependecyChanges {
  add: Task[];
  remove: Task[];
  update: Task[];
}

export function createDependecyChanges(): DependecyChanges {
  return {
    add: [],
    remove: [],
    update: [],
  };
}
