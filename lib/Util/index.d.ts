export declare type SUDiff = deepDiff.IDiff[];
export declare function diff(lhs: Object, rhs: Object, prefilter?: deepDiff.IPrefilter, acc?: deepDiff.IAccumulator): SUDiff;
export declare function find(paths: string[], filename: string): string[];
export declare function fastfind(paths: string[], filename: string): string;
export declare function random(callback: (nextTick: Function) => void, probability: number): any;
export declare function periodic(callback: (nextTick: Function) => void, sec: number): any;
export declare function always(callback: (nextTick: Function) => void): any;
export declare function randomRange(min: number, max: number): number;
export declare function choice<T>(arr: T[]): T;
export declare function has<T>(dir: {
    [key: string]: T;
}, path: string): string;
export declare function get<T>(dir: {
    [key: string]: T;
}, path: string): Promise<T>;
export declare function scope(scopeId: number): string;
export declare function unscope(charId: string): number;
