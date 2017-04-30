/*
 * Surface のアニメーション状態およびレイヤ状態を表すモデル
 */
export class SurfaceModel {
  readonly scopeId: number;
  readonly surfaceId: number;

  renderingTree:   SurfaceRenderingTree; // 実際に表示されるべき再帰的なbindも含めたレイヤツリー
  readonly serikos:         {[animId: number]: Seriko}; // interval再生が有効なアニメーションID
  talkCount:       number;
  destructed:      boolean;
  readonly move: {x: number, y: number};
  constructor(scopeId: number, surfaceId: number) {
    this.scopeId = scopeId;
    this.surfaceId = surfaceId;
    this.renderingTree = new SurfaceRenderingTree(surfaceId);
    this.serikos = {};
    this.talkCount = 0;
    this.destructed = false;
    this.move = {x: 0, y: 0};
  }
}

export class Seriko {
  patternID:  number;
  paused:     boolean; // \![anim,pause] みたいなの 
  exclusive:  boolean; // このアニメーションは排他されているか
  canceled:   boolean; // 何らかの理由で強制停止された
  finished:   boolean; // このアニメーションは正常終了した

  constructor(patternID=-1){
    this.patternID = patternID;
    this.paused     = false;
    this.exclusive  = false;
    this.canceled   = false;
    this.finished   = false;
  }
}

import {SurfaceCollision} from "ikagaka-shell-loader/src/Model/SurfaceDefinitionTree";

/*
 * 現在のサーフェスのレイヤ状態を一意に表すレンダリングツリー
 */
export class SurfaceRenderingTree { 
  readonly base:        number;
  foregrounds: SurfaceRenderingLayerSet[];
  backgrounds: SurfaceRenderingLayerSet[];
  collisions:  SurfaceCollision[];
  constructor(surface: number){
    this.base = surface;
    this.foregrounds = [];
    this.backgrounds = [];
    this.collisions = [];
  }
}

export type SurfaceRenderingLayerSet = SurfaceRenderingLayer[];

export class SurfaceRenderingLayer {
  readonly type: string;
  readonly surface: SurfaceRenderingTree;
  readonly x: number;
  readonly y: number;
  constructor(type: string, surface: SurfaceRenderingTree, x: number, y: number){
    this.type = type;
    this.surface = surface;
    this.x = x;
    this.y = y;
  }
}