/// <reference types="node" />
import { Shell } from "ikagaka-shell-loader/lib/Model/Shell";
import { Config } from "ikagaka-shell-loader/lib/Model/Config";
import { SurfaceDefinition } from "ikagaka-shell-loader/lib/Model/SurfaceDefinitionTree";
import { SurfaceModel, SurfaceRenderingTree } from "../Model/SurfaceModel";
import { EventEmitter } from "events";
export declare class SurfaceState extends EventEmitter {
    readonly surface: SurfaceModel;
    readonly shell: Shell;
    readonly config: Config;
    readonly surfaceNode: SurfaceDefinition;
    debug: boolean;
    readonly rndr: (scopeId: number, surfaceId: number, tree: SurfaceRenderingTree) => Promise<void>;
    readonly continuations: {
        [animId: number]: {
            resolve: Function;
            reject: Function;
        };
    };
    constructor(surface: SurfaceModel, shell: Shell, rndr: (scopeId: number, surfaceId: number, tree: SurfaceRenderingTree) => Promise<void>);
    destructor(): void;
    render(): Promise<void>;
    private initSeriko(animId);
    updateBind(): Promise<void>;
    begin(animId: number): void;
    end(animId: number): void;
    endAll(): void;
    private setIntervalTimer(animId, interval, args);
    play(animId: number): Promise<void>;
    private step(animId, seriko);
    stop(animId: number): void;
    pause(animId: number): void;
    resume(animId: number): void;
    talk(): void;
    yenE(): Promise<void>;
    constructRenderingTree(): void;
}
