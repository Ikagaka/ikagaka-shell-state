/// <reference types="node" />
import { Shell } from "ikagaka-shell-loader/lib/Model/Shell";
import { Config } from "ikagaka-shell-loader/lib/Model/Config";
import { EventEmitter } from "events";
import { SurfaceState } from "./SurfaceState";
import { SurfaceRenderingTree } from "../Model/SurfaceModel";
export declare class ShellState extends EventEmitter {
    readonly shell: Shell;
    config: Config;
    constructor(shell: Shell);
    destructor(): void;
    createSurfaceState(scopeId: number, surfaceId: number, rndr: (tree: SurfaceRenderingTree) => Promise<void>): SurfaceState;
    showRegion(): void;
    hideRegion(): void;
    bind(category: string, parts: string): void;
    bind(scopeId: number, bindgroupId: number): void;
    unbind(category: string, parts: string): void;
    unbind(scopeId: number, bindgroupId: number): void;
}
export declare function bind_value(config: Config, a: number | string, b: number | string, flag: boolean): void;
