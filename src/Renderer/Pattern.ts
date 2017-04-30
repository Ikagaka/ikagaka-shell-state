/*
 * アニメーションパーツを生成する
 * 与えられた surface model から current surface を生成する
 */

import * as Util from "../Util/index";
import {SurfaceRenderingLayer, SurfaceRenderingLayerSet, SurfaceModel, SurfaceRenderingTree} from "../Model/SurfaceModel";
import * as ST from "ikagaka-shell-loader/lib/Model/SurfaceDefinitionTree";
import {Shell} from "ikagaka-shell-loader/lib/Model/Shell";

import {Canvas} from "./Canvas";
import {SurfaceBaseRenderer} from "./BaseSurface";
import {Renderer} from "./Renderer";

export class SurfacePatternRenderer {
  baseRndr: SurfaceBaseRenderer
  realRndr: Renderer; // 実 DOM へのレンダラ
  offscreen: Renderer; // オフスクリーン canvas

  constructor(baseRndr: SurfaceBaseRenderer, srfCnv?: Canvas){
    this.offscreen = new Renderer();
    this.realRndr = new Renderer(srfCnv);
    this.baseRndr = baseRndr;
  }

  attachCanvas(srfCnv: Canvas){
    this.realRndr.rebase(srfCnv);
  }

  render(surfaceId: number, renderingTree: SurfaceRenderingTree): Promise<Canvas> {
    // この this へ現在のサーフェス画像を書き込む
    const {shell} = this.baseRndr;
    const surfaceNode = shell.surfaceDefTree.surfaces[surfaceId];
    const {base, foregrounds, backgrounds} = renderingTree;
    const {enableRegion} = shell.config;
    const {collisions, animations} = surfaceNode;
    return this.baseRndr.getBaseSurface(base).then((baseSrfCnv)=>{
      // この baseSrfCnv は cache そのものなのでいじるわけにはいかないのでコピーする
      this.offscreen.init(baseSrfCnv);
      this.offscreen.clear(); // 短形を保ったまま消去
      // この this な srfCnv がreduceの単位元になる
      return this.convoluteTree(new SurfaceRenderingLayer("overlay", renderingTree, 0, 0)); // 透明な base へ overlay する
    }).then(()=>{
      // 当たり判定を描画
      if (enableRegion) {
        backgrounds.forEach((layerSet)=>{
          layerSet.forEach((layer)=>{
            this.offscreen.drawRegions(layer.surface.collisions, ""+surfaceId);
          });
        });
        this.offscreen.drawRegions((collisions), ""+surfaceId);
        foregrounds.forEach((layerSet)=>{
          layerSet.forEach((layer)=>{
            this.offscreen.drawRegions(layer.surface.collisions, ""+surfaceId);
          });
        });
      }
      // debug用
      //console.log(this.bufferRender.log);
      //SurfaceUtil.log(SurfaceUtil.copy(this.bufferRender.cnv));
      //document.body.scrollTop = 99999;
      //this.endAll();
      this.realRndr.init(this.offscreen.srfCnv);// オフスクリーン canvas を real dom canvas へ書き込み
      return this.realRndr.srfCnv;
    })
  }

  private convoluteTree(layer: SurfaceRenderingLayer): Promise<void> {
    // debug
    // const a = Util.craetePictureFrame("convTree")
    const {type, surface, x, y} = layer;
    const {base, backgrounds, foregrounds} = surface;
    const process = (layerSets: SurfaceRenderingLayerSet[]):Promise<void> =>
      layerSets.reduce((prm, layerSet)=>
        layerSet.reduce((prm, layer)=>
          prm.then(()=>
            this.convoluteTree(layer)
          ), prm) , Promise.resolve());
    return process(backgrounds).then(()=>
      this.baseRndr.getBaseSurface(base).then((baseSrfCnv)=>{
        // backgrounds の上に base を描画
        // いろいろやっていても実際描画するのは それぞれのベースサーフェスだけです
        // a.add(Util.copy(this.rndr.srfCnv.cnv), "current");
        // a.add(Util.copy(baseSrfCnv.cnv), "base");
        this.offscreen.composeElement(baseSrfCnv, type, x, y);
        // a.add(Util.copy(this.rndr.srfCnv.cnv), "result");
      }).catch(console.warn.bind(console)) // 失敗してもログ出して解決
    ).then(()=> process(foregrounds) );
  }
}


