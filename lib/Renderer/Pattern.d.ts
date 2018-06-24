import { SurfaceRenderingTree } from "../Model/SurfaceModel";
import { Canvas } from "./Canvas";
import { SurfaceBaseRenderer } from "./BaseSurface";
import { Renderer } from "./Renderer";
export declare class SurfacePatternRenderer {
    baseRndr: SurfaceBaseRenderer;
    realRndr: Renderer;
    offscreen: Renderer;
    constructor(baseRndr: SurfaceBaseRenderer, srfCnv?: Canvas);
    attachCanvas(srfCnv: Canvas): void;
    render(surfaceId: number, renderingTree: SurfaceRenderingTree): Promise<Canvas>;
    private convoluteTree;
}
