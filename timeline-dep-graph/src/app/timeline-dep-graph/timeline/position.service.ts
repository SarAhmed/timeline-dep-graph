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

import { Timeline } from 'vis';

import { getTaskById, Task, TaskId } from './../Task';

/**
 * AbsolutePosition represents the absolute position of a dom item.
 */
export interface AbsolutePosition {
  left: number;
  top: number;
  right: number;
  bottom: number;
  midX: number;
  midY: number;
  width: number;
  height: number;
}

/**
 * RelativePosition represents the relative position of a dom item.
 */
export interface RelativePosition {
  top: number;
  left: number;
  width: number;
  height: number;
  parent: {
    top: number;
    height: number;
  };
}

export class PositionService {
  private timeline: Timeline;
  private tasks: Task[] = [];

  setTimeline(timeline: Timeline): void {
    this.timeline = timeline;
  }

  setTasks(tasks: Task[]): void {
    this.tasks = tasks;
  }

  getTaskPosition(task: Task): AbsolutePosition | undefined {
    const item: RelativePosition = this.timeline.itemSet.items[task.id];
    if (item) {
      const timelineHeight = this.timeline.dom.center.offsetHeight;
      const svgHeight = this.timeline.dom.center.parentNode.offsetHeight - 2;
      return getAbsolutePosition(item, timelineHeight, svgHeight);
    }
    return this.getTasksBoundingBox(task.subTasks);
  }

  getTaskPositionById(taskId: TaskId): AbsolutePosition | undefined {
    const task = getTaskById(this.tasks, taskId);
    if (!task) {
      return;
    }
    return this.getTaskPosition(task);
  }

  private getTasksBoundingBox(tasks: Task[])
    : AbsolutePosition | undefined {
    const bboxArray = tasks.map(t => {
      const p = this.getTaskPosition(t);
      if (p && !this.timeline.itemSet.items[t.id]) {
        // Add some space for the taskName.
        addTopPadding(p, 20);
      }
      return p;
    }).filter((t): t is AbsolutePosition => !!t);

    const bbox = getBoundingBox(bboxArray);
    return bbox;
  }
}

/**
 * Compute the minimum bounding box contatining all the provided items.
 * @param positions Array of the items' positions.
 * @return The minimum bounding box position.
 */
function getBoundingBox(positions: AbsolutePosition[])
  : AbsolutePosition | undefined {
  if (positions.length === 0) {
    return undefined;
  }

  const maxX = positions.reduce((a, b) => a.right > b.right ? a : b).right;
  const minX = positions.reduce((a, b) => a.left < b.left ? a : b).left;
  const minY = positions.reduce((a, b) => a.top < b.top ? a : b).top;
  const maxY = positions.reduce((a, b) => a.bottom > b.bottom ? a : b).bottom;

  return {
    left: minX,
    top: minY,
    right: maxX,
    bottom: maxY,
    midX: minX + (maxX - minX) / 2,
    midY: minY + (maxY - minY) / 2,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Add top padding to the container with the specified amount in pixels.
 * @param bbox Container's absolute position.
 * @param amount padding amount in pixels.
 */
export function addTopPadding(bbox: AbsolutePosition, amount: number): void {
  bbox.top -= amount;
  bbox.height += amount;
}

/**
 * Add bottom padding to the container with the specified amount in pixels.
 * @param bbox Container's absolute position.
 * @param amount padding amount in pixels.
 */
export function addBottomPadding(bbox: AbsolutePosition, amount: number): void {
  bbox.bottom += amount;
  bbox.height += amount;
}

/**
 * Add top and bottom padding to the container
 * with the specified amount in pixels.
 * @param bbox Container's absolute position.
 * @param amount padding amount in pixels.
 */
export function addPadding(bbox: AbsolutePosition, amount: number): void {
  addTopPadding(bbox, amount);
  addBottomPadding(bbox, amount);
}

/**
 * @param rPos The relative position to be converted into absolute position.
 * @param parentHeight The innerHeight of parent node of the item's container.
 * @param containerHeight The innerHeight of the item's node.
 * @return The absolute position of the item.
 */
export function getAbsolutePosition(
  rPos: RelativePosition, parentHeight: number, containerHeight: number)
  : AbsolutePosition {
  const leftX = rPos.left;
  const offSet = containerHeight - parentHeight;
  const topY = rPos.parent.top + rPos.parent.height - rPos.top - rPos.height +
    offSet;
  return {
    left: leftX,
    top: topY,
    right: leftX + rPos.width,
    bottom: topY + rPos.height,
    midX: leftX + rPos.width / 2,
    midY: topY + rPos.height / 2,
    width: rPos.width,
    height: rPos.height
  };
}

/**
 * Check if the given absolute position is valid or not.
 * Where every field in the given position holds a valid value.
 * @param position Absolute position.
 * @return Whether the position is valid or not.
 */
export function isValidAbsolutePosition(position: AbsolutePosition): boolean {
  for (const val of Object.values(position)) {
    if (!val) {
      return false;
    }
  }
  return true;
}
