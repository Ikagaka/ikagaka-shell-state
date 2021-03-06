/*
 * CacheCanvas は ディレクトリアクセスをフックし
 * 比較的重い処理である surface*.png の色抜き処理をキャッシングする
 * baseCache
 */

import * as Util from "./Util";
import {CanvasCache} from "./Cache";
import {Canvas} from "./Canvas";
import {Shell} from "ikagaka-shell-loader/lib/Model/Shell";
import {SurfaceDefinition} from "ikagaka-shell-loader/lib/Model/SurfaceDefinitionTree";
import {Renderer} from "./Renderer";

/**
 * elementを合成して baseSurface を構成します。
 */
export class SurfaceBaseRenderer {

  rndr: Renderer;
  cache: CanvasCache;     // 色抜きキャッシュ
  bases: Canvas[]; // 合成後のベースサーフェス
  shell: Shell;

  constructor(shell: Shell){
    this.rndr = new Renderer();
    this.bases = [];
    this.shell = shell;
    this.cache = new CanvasCache(shell.directory);
  }

  preload(): Promise<this>{
    const surfaces = this.shell.surfaceDefTree.surfaces
    console.time("preload");
    return Promise.all(
      surfaces.map((surface, n)=> this.getBaseSurface(n) )
    ).then(()=>{
      console.timeEnd("preload");
      this.cache.clear();
      return this;
    })
  }

  getBaseSurface(n: number): Promise<Canvas> {
    // elements を合成するだけ
    const surfaceTree = this.shell.surfaceDefTree.surfaces;
    const cache = this.cache;
    const bases = this.bases;
    const srf = surfaceTree[n];
    if(!(srf instanceof SurfaceDefinition) || srf.elements.length === 0){
      // そんな定義なかった || element0も何もなかった
      console.warn("SurfaceBaseRenderer#getBaseSurface: no such a surface: "+n);
      return Promise.reject("SurfaceBaseRenderer#getBaseSurface: no such a surface: "+n);
    }
    if(bases[n] instanceof Canvas){
      // キャッシュがあった
      return Promise.resolve(bases[n]);
    }
    const elms = srf.elements;
    return Promise.all(
      elms.map(({file, type, x, y})=>{
        // asisはここで処理しちゃう
        let asis = false;
        if(type === "asis"){
          type = "overlay"; // overlayにしとく
          asis = true;
        }
        if(type === "bind" || type === "add"){
          type = "overlay"; // overlayにしとく
        }
        // ファイルとりにいく
        return cache.getCanvas(file, asis)
        .then((cnv)=>{ return {file, type, x, y, canvas: new Canvas(cnv) }; })
        .catch((err)=>{
          console.warn("SurfaceBaseRenderer#getBaseSurface: no such a file", file, n, srf);
        });
      })
    ).then((elms)=>{
      const _elms = <{file: string, type: string, x: number, y: number, canvas: Canvas }[]>elms.filter((a)=> a != null);
      this.rndr.composeElements(_elms);
      // キャッシング
      bases[n] = new Canvas(Util.copy(this.rndr.cnv));
      return bases[n];
    });
  }

  getBaseSurfaceSize(n:number): Promise<{width: number, height: number}> {
    return this.getBaseSurface(n).then((srfCnv)=>{
      return {
        width: srfCnv.baseWidth,
        height: srfCnv.baseHeight
      };
    });
  }
}