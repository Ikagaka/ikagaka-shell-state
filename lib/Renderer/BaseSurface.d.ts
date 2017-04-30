import { CanvasCache } from "./Cache";
import { Canvas } from "./Canvas";
import { Shell } from "ikagaka-shell-loader/lib/Model/Shell";
import { Renderer } from "./Renderer";
export declare class SurfaceBaseRenderer extends Renderer {
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
