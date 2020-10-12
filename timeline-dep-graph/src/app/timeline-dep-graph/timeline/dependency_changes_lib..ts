import { Task } from '../Task';
import { equalsTask, equalTaskFields, TaskId } from './../Task';

interface TaskChangesHolder {
  prev?: Task;
  curr?: Task;
}

/**
 * DependencyChanges represnts the changes to be done in the dependency graph.
 * `add` - Holds the tasks to be added to the dependency graph.
 * `remove` - Holds the tasks to be removed from the dependency graph.
 * `update` - Holds the tasks whose details are changed
 * and needs to be updated on the dependency graph.
 */
export interface DependencyChanges {
  add: Task[];
  remove: Task[];
  update: Task[];
}

/**
 * @param prev The previous state of tasks array.
 * @param curr The current state of tasks array.
 * @return     The changes between the previous state and the current state.
 */
export function getdependencyChanges(prev: Task[], curr: Task[])
  : DependencyChanges {
  const map = new Map<TaskId, TaskChangesHolder>();

  for (const task of prev) {
    map.set(task.id, { prev: task });
  }

  for (const task of curr) {
    if (map.has(task.id)) {
      map.get(task.id)!.curr = task;
    } else {
      map.set(task.id, { curr: task });
    }
  }

  const updatedTasks: DependencyChanges = {
    add: [],
    remove: [],
    update: [],
  };
  for (const val of map.values()) {
    const prevTask = val.prev;
    const currTask = val.curr;
    if (!currTask && prevTask) {
      updatedTasks.remove.push(prevTask);
    } else if (!prevTask && currTask) {
      updatedTasks.add.push(currTask);
    } else if (currTask && prevTask && !equalsTask(currTask, prevTask)) {
      if (!equalTaskFields(currTask, prevTask)) {
        updatedTasks.update.push(currTask);
      }
      const subTasksChanges =
        getdependencyChanges(prevTask.subTasks, currTask.subTasks);
      updatedTasks.add = updatedTasks.add.concat(subTasksChanges.add);
      updatedTasks.update = updatedTasks.update.concat(subTasksChanges.update);
      updatedTasks.remove = updatedTasks.remove.concat(subTasksChanges.remove);
    }
  }
  return updatedTasks;
}
