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
        // まず ベースサーフェスの大きさを知りたいので element 合成してベースサーフェスを作成
        return this.baseRndr.getBaseSurface(base).then((baseSrfCnv) => {
            // ベースサーフェスを書き込む
            this.offscreen.init(baseSrfCnv);
            this.offscreen.clear(); // 短形を保ったまま消去。大きさだけ得られた。
            const layertree = new SurfaceModel_1.SurfaceRenderingLayer("overlay", renderingTree, 0, 0);
            return this.convoluteTree(layertree); // 透明な offscreen へ overlay する
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
        // 背景を描画
        return process(backgrounds).then(() => 
        // ベースサーフェスを取得
        this.baseRndr.getBaseSurface(base).then((baseSrfCnv) => {
            // a.add(Util.copy(this.rndr.srfCnv.cnv), "current");
            // a.add(Util.copy(baseSrfCnv.cnv), "base");
            // backgrounds の上に base を描画
            // いろいろやっていても実際描画するのは それぞれのベースサーフェスだけです
            this.offscreen.composeElement(baseSrfCnv, type, x, y);
            // a.add(Util.copy(this.rndr.srfCnv.cnv), "result");
        }).catch(console.warn.bind(console)) // 失敗してもログ出して無視
        // 全面を描画
        ).then(() => process(foregrounds));
    }
}
exports.SurfacePatternRenderer = SurfacePatternRenderer;
