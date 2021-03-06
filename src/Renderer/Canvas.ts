/**
 * はみ出しを考慮したCanvas
 */

import * as Util from "./Util";

export class Canvas {
  // baseCanvas
  cnv: HTMLCanvasElement
  // overlayではみ出した際canvasのリサイズがされるがその時の補正値
  basePosX: number;
  basePosY: number;
  baseWidth: number;
  baseHeight: number;
  constructor(cnv: HTMLCanvasElement) {
    this.cnv = cnv;
    this.basePosX = 0;
    this.basePosY = 0;
    this.baseWidth = cnv.width;
    this.baseHeight = cnv.height;
  }
}


export function copy(srfCnv: Canvas): Canvas{
  // Canvas を元に新しい Canvas をつくる
  const srfCnv2 = new Canvas(Util.copy(srfCnv.cnv));
  srfCnv2.basePosX = srfCnv.basePosX;
  srfCnv2.basePosY = srfCnv.basePosY;
  srfCnv2.baseWidth = srfCnv.baseWidth;
  srfCnv2.baseHeight = srfCnv.baseHeight;
  return srfCnv2;
}

