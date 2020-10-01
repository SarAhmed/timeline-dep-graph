import { Injectable } from '@angular/core';

import { ItemPosition } from './timeline/timeline.component';

@Injectable({
  providedIn: 'root'
})
export class ArrowGeneratorService {

  constructor() { }

  addArrow(
    svg: SVGSVGElement, start: ItemPosition, end: ItemPosition)
    : SVGPathElement {

    const arrow = this.createPath(svg);
    this.setArrowCoordinates(arrow, start, end);

    return arrow;
  }

  removeArrow(
    svg: SVGSVGElement, arrow: SVGPathElement): void {
    svg.removeChild(arrow);
  }

  setArrowCoordinates(
    arrow: SVGPathElement, start: ItemPosition, end: ItemPosition): void {
    const bezierCurve = start.height * 2;
    arrow.setAttribute(
      'd',
      `M ${start.right} ${start.mid_y} C ${start.right + bezierCurve} ${start.mid_y} ${end.left - bezierCurve} ${end.mid_y} ${end.left} ${end.mid_y}`
    );
  }

  private createPath(svg: SVGSVGElement): SVGPathElement {
    const somePath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    somePath.setAttribute('d', 'M 0 0');
    somePath.style.stroke = 'black';
    somePath.style.strokeWidth = '1px';
    somePath.style.fill = 'none';
    svg.appendChild(somePath);

    return somePath;
  }
}
