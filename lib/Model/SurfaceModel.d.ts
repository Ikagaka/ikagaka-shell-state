export declare class SurfaceModel {
    readonly scopeId: number;
    readonly surfaceId: number;
    renderingTree: SurfaceRenderingTree;
    readonly serikos: {
        [animId: number]: Seriko;
    };
    talkCount: number;
    destructed: boolean;
    readonly move: {
        x: number;
        y: number;
    };
    constructor(scopeId: number, surfaceId: number);
}
export declare class Seriko {
    patternID: number;
    paused: boolean;
    exclusive: boolean;
    canceled: boolean;
    finished: boolean;
    constructor(patternID?: number);
}
import { SurfaceCollision } from "ikagaka-shell-loader/src/Model/SurfaceDefinitionTree";
export declare class SurfaceRenderingTree {
    readonly base: number;
    foregrounds: SurfaceRenderingLayerSet[];
    backgrounds: SurfaceRenderingLayerSet[];
    collisions: SurfaceCollision[];
    constructor(surface: number);
}
export declare type SurfaceRenderingLayerSet = SurfaceRenderingLayer[];
export declare class SurfaceRenderingLayer {
    readonly type: string;
    readonly surface: SurfaceRenderingTree;
    readonly x: number;
    readonly y: number;
    constructor(type: string, surface: SurfaceRenderingTree, x: number, y: number);
}
