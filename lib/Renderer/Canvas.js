"use strict";
/**
 * はみ出しを考慮したCanvas
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Util = require("./Util");
class Canvas {
    constructor(cnv) {
        this.cnv = cnv;
        this.basePosX = 0;
        this.basePosY = 0;
        this.baseWidth = cnv.width;
        this.baseHeight = cnv.height;
    }
}
exports.Canvas = Canvas;
function copy(srfCnv) {
    // Canvas を元に新しい Canvas をつくる
    const srfCnv2 = new Canvas(Util.copy(srfCnv.cnv));
    srfCnv2.basePosX = srfCnv.basePosX;
    srfCnv2.basePosY = srfCnv.basePosY;
    srfCnv2.baseWidth = srfCnv.baseWidth;
    srfCnv2.baseHeight = srfCnv.baseHeight;
    return srfCnv2;
}
exports.copy = copy;
