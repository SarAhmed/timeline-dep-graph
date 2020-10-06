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
  className?: string;
}

/**
 * ItemPosition represents the absolute position of a vis-item.
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
 * RangeItem represents the relative position of a vis-item.
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

/**
 * @param task The task to be mapped into a vis-item
 * @return The vis-item's data corresponding to the task fields.
 */
export function maptoItem(task: Task): ItemData {
  return {
    'id': task.id,
    name: task.name,
    status: task.status,
    start: task.startTime,
    end: task.finishTime,
    content: task.name,
    className: 'transeparent',
  };
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
