import { Status } from './Status';
import { Task } from './Task';

// Item represents the vis.js API associated with a task.
export interface ItemData {
  readonly 'id': string;
  name: string;
  status: Status;
  content: string;
  start?: Date;
  end?: Date;
  className?: string;
}

export interface ItemPosition {
  left: number;
  top: number;
  right: number;
  bottom: number;
  midX: number;
  midY: number;
  width: number;
  height: number;
}

export interface RangeItem {
  top: number;
  left: number;
  width: number;
  height: number;
  parent: {
    top: number;
    height: number;
  };
}

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

export function getItemPosition(
  item: RangeItem, parentHeight: number, containerHeight: number)
  : ItemPosition {
  const leftX = item.left;
  const offSet = containerHeight - parentHeight;
  const topY = item.parent.top + item.parent.height - item.top - item.height +
    offSet;
  return {
    left: leftX,
    top: topY,
    right: leftX + item.width,
    bottom: topY + item.height,
    midX: leftX + item.width / 2,
    midY: topY + item.height / 2,
    width: item.width,
    height: item.height
  };
}
