"use strict";
/*
 * CacheCanvas は ディレクトリアクセスをフックし
 * 比較的重い処理である surface*.png の色抜き処理をキャッシングする
 * baseCache
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Util = require("./Util");
const Cache_1 = require("./Cache");
const Canvas_1 = require("./Canvas");
const SurfaceDefinitionTree_1 = require("ikagaka-shell-loader/lib/Model/SurfaceDefinitionTree");
const Renderer_1 = require("./Renderer");
/**
 * elementを合成して baseSurface を構成します。
 */
class SurfaceBaseRenderer {
    constructor(shell) {
        this.rndr = new Renderer_1.Renderer();
        this.bases = [];
        this.shell = shell;
        this.cache = new Cache_1.CanvasCache(shell.directory);
    }
    preload() {
        const surfaces = this.shell.surfaceDefTree.surfaces;
        console.time("preload");
        return Promise.all(surfaces.map((surface, n) => this.getBaseSurface(n))).then(() => {
            console.timeEnd("preload");
            this.cache.clear();
            return this;
        });
    }
    getBaseSurface(n) {
        // elements を合成するだけ
        const surfaceTree = this.shell.surfaceDefTree.surfaces;
        const cache = this.cache;
        const bases = this.bases;
        const srf = surfaceTree[n];
        if (!(srf instanceof SurfaceDefinitionTree_1.SurfaceDefinition) || srf.elements.length === 0) {
            // そんな定義なかった || element0も何もなかった
            console.warn("SurfaceBaseRenderer#getBaseSurface: no such a surface: " + n);
            return Promise.reject("SurfaceBaseRenderer#getBaseSurface: no such a surface: " + n);
        }
        if (bases[n] instanceof Canvas_1.Canvas) {
            // キャッシュがあった
            return Promise.resolve(bases[n]);
        }
        const elms = srf.elements;
        return Promise.all(elms.map(({ file, type, x, y }) => {
            // asisはここで処理しちゃう
            let asis = false;
            if (type === "asis") {
                type = "overlay"; // overlayにしとく
                asis = true;
            }
            if (type === "bind" || type === "add") {
                type = "overlay"; // overlayにしとく
            }
            // ファイルとりにいく
            return cache.getCanvas(file, asis)
                .then((cnv) => { return { file, type, x, y, canvas: new Canvas_1.Canvas(cnv) }; })
                .catch((err) => {
                console.warn("SurfaceBaseRenderer#getBaseSurface: no such a file", file, n, srf);
            });
        })).then((elms) => {
            const _elms = elms.filter((a) => a != null);
            this.rndr.composeElements(_elms);
            // キャッシング
            bases[n] = new Canvas_1.Canvas(Util.copy(this.rndr.cnv));
            return bases[n];
        });
    }
    getBaseSurfaceSize(n) {
        return this.getBaseSurface(n).then((srfCnv) => {
            return {
                width: srfCnv.baseWidth,
                height: srfCnv.baseHeight
            };
        });
    }
}
exports.SurfaceBaseRenderer = SurfaceBaseRenderer;
