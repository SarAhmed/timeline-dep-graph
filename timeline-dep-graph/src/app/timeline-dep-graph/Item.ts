import { Status } from './Status';
import { Task } from './Task';

// ItemData represents the vis-item data.
export interface ItemData {
  readonly 'id': string;
  name: string;
  status: Status;
  content: string;
  start?: Date;
  end?: Date;
  className: string;
  expandable: boolean;
  group: string;
}

/**
 * @param task The task to be mapped into a vis-item.
 * @param isGrouped Whether the timeline's items are grouped by status or not.
 * @return The vis-item's data corresponding to the task fields.
 */
export function maptoItem(task: Task, isGrouped: boolean): ItemData {
  let className = 'transeparent';
  if (task.subTasks.length > 0) {
    className += ' tdg-pointer';
  }
  return {
    'id': task.id,
    name: task.name,
    status: task.status,
    start: task.startTime,
    end: task.finishTime,
    content: task.name,
    className,
    expandable: task.subTasks.length > 0,
    group: isGrouped ? task.status : 'unGrouped',
  };
}

/**
 * @param items Dicrtionary represnting the timeline's items.
 * @param isGrouped Whether the timeline's items are grouped by status or not.
 */
export function setItemsGroups(
  items: { [id: string]: { data: ItemData }; }, isGrouped: boolean): void {
  for (const item of Object.values(items)) {
    item.data.group = isGrouped ? item.data.status : 'unGrouped';
  }
}
