import { CanvasCache } from "./Cache";
import { Canvas } from "./Canvas";
import { Shell } from "ikagaka-shell-loader/lib/Model/Shell";
import { Renderer } from "./Renderer";
/**
 * elementを合成して baseSurface を構成します。
 */
export declare class SurfaceBaseRenderer {
    rndr: Renderer;
    cache: CanvasCache;
    bases: Canvas[];
    shell: Shell;
    constructor(shell: Shell);
    preload(): Promise<this>;
    getBaseSurface(n: number): Promise<Canvas>;
    getBaseSurfaceSize(n: number): Promise<{
        width: number;
        height: number;
    }>;
}
