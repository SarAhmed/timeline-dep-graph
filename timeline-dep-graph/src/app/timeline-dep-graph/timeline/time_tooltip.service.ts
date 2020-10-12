import { Timeline } from 'vis';

import { ItemData } from './../Item';
import { getAbsolutePosition } from './position.service';

interface Tooltip {
  el: HTMLElement;
  itemId: string;
  /*
  * If the hover action was on the first half of the item,
  * hoverOnStart is set to true.
  * Otherwise, hoverOnStart is set to false.
  */
  hoverOnStart: boolean;
}

export class TimeTooltipService {
  private timeline: Timeline;
  private tooltip: Tooltip | null;

  setTimeline(timeline: Timeline): void {
    this.timeline = timeline;

    // Update the tooltip coordinates on zooming in/out.
    this.timeline.on('changed', () => {
      this.setTooltipCoordinates();
    });

    this.timeline.on('mouseOver', (prop) => {
      if (prop.what !== 'item') {
        return;
      }
      // Show tooltip on hovering over item.
      this.clearTooltip();
      const tooltipEl = this.createTooltipEl();

      const itemId = prop.item;
      const itemData: ItemData = this.timeline.itemSet.items[itemId].data;

      const snappedTime = new Date(prop.time).getTime();
      if (!itemData.start || !itemData.end) {
        return;
      }
      const start = itemData.start.getTime();
      const end = itemData.end.getTime();
      if (snappedTime - start < end - snappedTime) {
        this.timeline.addCustomTime(start, 'customTimeBar');
        tooltipEl.innerHTML = itemData.start.toISOString();
        this.tooltip = {
          el: tooltipEl,
          itemId,
          hoverOnStart: true,
        };
      } else {
        this.timeline.addCustomTime(end, 'customTimeBar');
        tooltipEl.innerHTML = itemData.end.toISOString();
        this.tooltip = {
          el: tooltipEl,
          itemId,
          hoverOnStart: false,
        };
      }
      this.setTooltipCoordinates();

    });

    // Remove tooltip -if exists- on moving out an item.
    this.timeline.on('itemout', () => {
      this.clearTooltip();
    });
  }

  private clearTooltip(): void {
    if (this.tooltip == null) {
      return;
    }
    this.timeline.dom.center.parentNode.removeChild(this.tooltip.el);
    this.timeline.removeCustomTime('customTimeBar');
    this.tooltip = null;
  }

  private setTooltipCoordinates(): void {
    if (this.tooltip == null) {
      return;
    }
    const timelineHeight = this.timeline.dom.center.offsetHeight;
    const containerHeight = this.timeline.dom.center.parentNode.offsetHeight;

    const item = this.timeline.itemSet.items[this.tooltip.itemId];
    if (item == null) {
      this.clearTooltip();
      return;
    }

    const itemPos = getAbsolutePosition(item, timelineHeight, containerHeight);
    if (this.tooltip.hoverOnStart) {
      this.tooltip.el.style.left =
        `${itemPos.left - (this.tooltip.el.offsetWidth / 2)}px`;
    } else {
      this.tooltip.el.style.left =
        `${itemPos.right - (this.tooltip.el.offsetWidth / 2)}px`;
    }
    this.tooltip.el.style.top = `${itemPos.top - (itemPos.height / 2)}px`;
  }

  private createTooltipEl(): HTMLElement {
    const tooltip = document.createElement('b');
    tooltip.style.position = 'absolute';
    tooltip.style.background = '#6E94FF';
    tooltip.style.padding = '0px';
    tooltip.style.margin = '0px';
    tooltip.style.zIndex = '1';

    this.timeline.dom.center.parentNode.appendChild(tooltip);
    return tooltip;
  }
}
