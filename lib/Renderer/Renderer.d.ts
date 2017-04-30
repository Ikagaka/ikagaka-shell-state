import * as SDT from "ikagaka-shell-loader/lib/Model/SurfaceDefinitionTree";
import { Canvas } from "./Canvas";
export declare class Renderer {
    srfCnv: Canvas;
    cnv: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    tmpcnv: HTMLCanvasElement;
    tmpctx: CanvasRenderingContext2D;
    debug: boolean;
    use_self_alpha: boolean;
    constructor(srfCnv?: Canvas);
    reset(): void;
    clear(): void;
    composeElements(elms: {
        type: string;
        x: number;
        y: number;
        canvas: Canvas;
    }[]): Canvas;
    composeElement(canvas: Canvas, type: string, x?: number, y?: number): void;
    rebase(srfCnv: Canvas): void;
    init(srfCnv: Canvas): void;
    base(part: Canvas): void;
    overlay(part: Canvas, x: number, y: number): void;
    overlayfast(part: Canvas, x: number, y: number): void;
    interpolate(part: Canvas, x: number, y: number): void;
    replace(part: Canvas, x: number, y: number): void;
    prepareOverlay(part: Canvas, x: number, y: number): void;
    reduce(part: Canvas, x: number, y: number): void;
    drawRegions(regions: SDT.SurfaceCollision[], description?: string): void;
    drawRegion(region: SDT.SurfaceCollision): void;
    drawEllipseWithBezier(x: number, y: number, w: number, h: number): void;
}
export declare function isHit(srfCnv: Canvas, sdef: SDT.SurfaceDefinition, x: number, y: number): {
    transparency: boolean;
    name: string;
};
