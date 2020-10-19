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

import { Injectable } from '@angular/core';
import { Timeline } from 'vis';

import { getUsedStatusSet } from '../Item';
import { Status } from './../Status';
import { Task } from './../Task';

interface Group {
  'id': string;
  content: string;
  style: string;
}

@Injectable()
export class GroupingService {
  private timeline: Timeline;
  private isGrouped = false;
  private statusSet = new Set<Status>();

  setTimeline(timeline: Timeline): void {
    this.timeline = timeline;
    this.unGroupTasks();
    this.timeline.on('changed', () => {
      const changes = getUsedStatusSet(this.timeline.itemSet.items);
      if (isEqualSet(changes, this.statusSet)) {
        return;
      }
      this.statusSet = changes;
      if (this.isGrouped) {
        this.groupTasks();
      }
    });
  }

  groupTasks(): void {
    this.isGrouped = true;
    const groups: Group[] = [];
    for (const status of Object.values(Status)) {
      if (!this.statusSet.has(status)) {
        continue;
      }
      const padding: Group = {
        'id': `tdg-group-padding-${status}`,
        content: '<br>',
        style: 'border: 1px solid transparent;'
      };
      const group: Group = {
        'id': status,
        content: status,
        style: 'text-transform: capitalize;'
      };
      groups.push(padding);
      groups.push(group);
    }
    this.timeline.setGroups(groups);
  }

  unGroupTasks(): void {
    this.isGrouped = false;
    const groups: Group[] = [];
    const padding: Group = {
      'id': 'tdg-group-padding-unGrouped',
      content: '<br>',
      style: 'border: 1px solid transparent;width: 0px;',
    };
    const group: Group = {
      'id': 'unGrouped',
      content: '<br>',
      style: 'width: 0px;',
    };

    groups.push(padding);
    groups.push(group);
    this.timeline.setGroups(groups);
  }

  addGroups(tasks: Task[]): void {
    // This flag is used to avoid unnecessary unnecessary repainting of groups.
    let newGroup = false;

    for (const task of tasks) {
      if (!this.statusSet.has(task.status)) {
        this.statusSet.add(task.status);
        newGroup = true;
      }
    }
    if (this.isGrouped && newGroup) {
      this.groupTasks();
    }
  }
}

function isEqualSet(set1: Set<Status>, set2: Set<Status>): boolean {
  if (set1.size !== set2.size) {
    return false;
  }
  for (const s of set1) {
    if (!set2.has(s)) {
      return false;
    }
  }
  return true;
}
