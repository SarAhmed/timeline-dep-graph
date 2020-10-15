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

/**
 * @param items Dicrtionary represnting the timeline's items.
 * @return Set containing used statuses.
 */
export function getUsedStatusSet(
  items: { [id: string]: { data: ItemData }; }): Set<Status> {
  const groupSet = new Set<Status>();
  for (const item of Object.values(items)) {
    groupSet.add(item.data.status);
  }
  return groupSet;
}
