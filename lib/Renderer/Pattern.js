"use strict";
/*
 * アニメーションパーツを生成する
 * 与えられた surface model から current surface を生成する
 */
Object.defineProperty(exports, "__esModule", { value: true });
const SurfaceModel_1 = require("../Model/SurfaceModel");
const Renderer_1 = require("./Renderer");
class SurfacePatternRenderer {
    constructor(baseRndr, srfCnv) {
        this.offscreen = new Renderer_1.Renderer();
        this.realRndr = new Renderer_1.Renderer(srfCnv);
        this.baseRndr = baseRndr;
    }
    attachCanvas(srfCnv) {
        this.realRndr.rebase(srfCnv);
    }
    render(surfaceId, renderingTree) {
        // この this へ現在のサーフェス画像を書き込む
        const { shell } = this.baseRndr;
        const surfaceNode = shell.surfaceDefTree.surfaces[surfaceId];
        const { base, foregrounds, backgrounds } = renderingTree;
        const { enableRegion } = shell.config;
        const { collisions, animations } = surfaceNode;
        return this.baseRndr.getBaseSurface(base).then((baseSrfCnv) => {
            // この baseSrfCnv は cache そのものなのでいじるわけにはいかないのでコピーする
            this.offscreen.init(baseSrfCnv);
            this.offscreen.clear(); // 短形を保ったまま消去
            // この this な srfCnv がreduceの単位元になる
            return this.convoluteTree(new SurfaceModel_1.SurfaceRenderingLayer("overlay", renderingTree, 0, 0)); // 透明な base へ overlay する
        }).then(() => {
            // 当たり判定を描画
            if (enableRegion) {
                backgrounds.forEach((layerSet) => {
                    layerSet.forEach((layer) => {
                        this.offscreen.drawRegions(layer.surface.collisions, "" + surfaceId);
                    });
                });
                this.offscreen.drawRegions((collisions), "" + surfaceId);
                foregrounds.forEach((layerSet) => {
                    layerSet.forEach((layer) => {
                        this.offscreen.drawRegions(layer.surface.collisions, "" + surfaceId);
                    });
                });
            }
            // debug用
            //console.log(this.bufferRender.log);
            //SurfaceUtil.log(SurfaceUtil.copy(this.bufferRender.cnv));
            //document.body.scrollTop = 99999;
            //this.endAll();
            this.realRndr.init(this.offscreen.srfCnv); // オフスクリーン canvas を real dom canvas へ書き込み
            return this.realRndr.srfCnv;
        });
    }
    convoluteTree(layer) {
        // debug
        // const a = Util.craetePictureFrame("convTree")
        const { type, surface, x, y } = layer;
        const { base, backgrounds, foregrounds } = surface;
        const process = (layerSets) => layerSets.reduce((prm, layerSet) => layerSet.reduce((prm, layer) => prm.then(() => this.convoluteTree(layer)), prm), Promise.resolve());
        return process(backgrounds).then(() => this.baseRndr.getBaseSurface(base).then((baseSrfCnv) => {
            // backgrounds の上に base を描画
            // いろいろやっていても実際描画するのは それぞれのベースサーフェスだけです
            // a.add(Util.copy(this.rndr.srfCnv.cnv), "current");
            // a.add(Util.copy(baseSrfCnv.cnv), "base");
            this.offscreen.composeElement(baseSrfCnv, type, x, y);
            // a.add(Util.copy(this.rndr.srfCnv.cnv), "result");
        }).catch(console.warn.bind(console)) // 失敗してもログ出して解決
        ).then(() => process(foregrounds));
    }
}
exports.SurfacePatternRenderer = SurfacePatternRenderer;
