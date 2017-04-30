export declare type Path = string;
/**
 * CacheCanvas は ディレクトリアクセスをフックし
 * 比較的重い処理である surface*.png の色抜き処理をキャッシングする
 */
export declare class CanvasCache {
    directory: Map<Path, () => Promise<ArrayBuffer>>;
    cache: Map<Path, HTMLCanvasElement>;
    constructor(dir: {
        [path: string]: () => Promise<ArrayBuffer>;
    });
    hasFile(path: string): boolean;
    hasCache(path: string): boolean;
    getFile(path: string): Promise<ArrayBuffer | null>;
    getCache(path: string): HTMLCanvasElement | null;
    getCanvas(path: string, asis?: boolean, retry?: boolean): Promise<HTMLCanvasElement>;
    clear(): void;
}
