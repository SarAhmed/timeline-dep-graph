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
import { Task, getSuperTask } from './Task';

// ItemData represents the vis-item data.
export interface ItemData {
  readonly 'id': string;
  // An ID including all parents of the item.
  // e.g. 'task1::subtask2::action1' represents action1 under subtask1 under
  // task 1.
  readonly fullId: string;
  name: string;
  status: Status;
  content: string;
  start?: Date;
  end?: Date;
  className: string;
  expandable: boolean;
  group: string;
  subgroup: string;
}

interface ItemSet {
  [id: string]: { data: ItemData };
}

/**
 * @param task The task to be mapped into a vis-item.
 * @param allTasks The list of all tasks in the timeline.
 * @param isGrouped Whether the timeline's items are grouped by status or not.
 * @return The vis-item's data corresponding to the task fields.
 */
export function maptoItem(
  task: Task, allTasks: Task[], isGrouped: boolean): ItemData {
  let className = 'transeparent';
  if (task.subTasks.length > 0) {
    className += ' tdg-pointer';
  }

  let parent = getSuperTask(allTasks, task.id);
  let fullId = task.id;
  let subgroup = '';
  while (!!parent) {
    fullId = `${parent.id}::${fullId}`;
    subgroup = `${parent.id}::${subgroup}`;
    parent = getSuperTask(allTasks, parent.id);
  }

  return {
    'id': task.id,
    fullId,
    name: task.name,
    status: task.status,
    start: task.startTime,
    end: task.finishTime,
    content: task.name,
    className,
    expandable: task.subTasks.length > 0,
    group: isGrouped ? task.status : 'unGrouped',
    subgroup,
  };
}

/**
 * @param items Dicrtionary represnting the timeline's items.
 * @param isGrouped Whether the timeline's items are grouped by status or not.
 */
export function setItemsGroups(
  items: ItemSet, isGrouped: boolean): void {
  for (const item of Object.values(items)) {
    item.data.group = isGrouped ? item.data.status : 'unGrouped';
  }
}

/**
 * @param items Dicrtionary represnting the timeline's items.
 * @return Set containing used statuses.
 */
export function getUsedStatusSet(
  items: ItemSet): Set<Status> {
  const groupSet = new Set<Status>();
  for (const item of Object.values(items)) {
    groupSet.add(item.data.status);
  }
  return groupSet;
}

/**
 * Get the earliest item from the given item-set.
 * @param items Dicrtionary represnting the timeline's items.
 * @return The item that has the smallest start time.
 */
export function earliestItem(itemSet: ItemSet)
  : ItemData {
  const items = Object.values(itemSet);
  return items.reduce(
    (a, b) => a.data.start!.getTime() < b.data.end!.getTime() ? a : b
  ).data;
}

/**
 * Get the latest item from the given item-set.
 * @param items Dicrtionary represnting the timeline's items.
 * @return The item that has the greatest end time.
 */
export function latestItem(itemSet: ItemSet)
  : ItemData {
  const items = Object.values(itemSet);
  return items.reduce(
    (a, b) => a.data.end!.getTime() > b.data.end!.getTime() ? a : b
  ).data;
}
