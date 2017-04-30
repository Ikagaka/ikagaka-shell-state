export declare function isHit(cnv: HTMLCanvasElement, x: number, y: number): boolean;
export declare function createCanvas(width?: number, height?: number): HTMLCanvasElement;
export declare function copy(cnv: HTMLCanvasElement | HTMLImageElement): HTMLCanvasElement;
export declare function fastcopy(cnv: HTMLCanvasElement | HTMLImageElement, tmpctx: CanvasRenderingContext2D): void;
export declare function fetchImageFromArrayBuffer(buffer: ArrayBuffer, mimetype?: string): Promise<HTMLImageElement>;
export declare function fetchImageFromURL(url: string): Promise<HTMLImageElement>;
export declare function cvt(a: {
    [a: string]: ArrayBuffer;
}): {
    [a: string]: () => Promise<ArrayBuffer>;
};
export declare function setPictureFrame(element: HTMLElement, description: string): void;
export declare function craetePictureFrame(description: string, target?: HTMLElement): {
    add: (element: string | HTMLElement, txt?: string) => void;
};
