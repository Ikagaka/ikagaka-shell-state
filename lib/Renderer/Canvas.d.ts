/**
 * はみ出しを考慮したCanvas
 */
export declare class Canvas {
    cnv: HTMLCanvasElement;
    basePosX: number;
    basePosY: number;
    baseWidth: number;
    baseHeight: number;
    constructor(cnv: HTMLCanvasElement);
}
export declare function copy(srfCnv: Canvas): Canvas;
