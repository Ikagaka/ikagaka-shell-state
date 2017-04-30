"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Surface のアニメーション状態およびレイヤ状態を表すモデル
 */
class SurfaceModel {
    constructor(scopeId, surfaceId) {
        this.scopeId = scopeId;
        this.surfaceId = surfaceId;
        this.renderingTree = new SurfaceRenderingTree(surfaceId);
        this.serikos = {};
        this.talkCount = 0;
        this.destructed = false;
        this.move = { x: 0, y: 0 };
    }
}
exports.SurfaceModel = SurfaceModel;
class Seriko {
    constructor(patternID = -1) {
        this.patternID = patternID;
        this.paused = false;
        this.exclusive = false;
        this.canceled = false;
        this.finished = false;
    }
}
exports.Seriko = Seriko;
/*
 * 現在のサーフェスのレイヤ状態を一意に表すレンダリングツリー
 */
class SurfaceRenderingTree {
    constructor(surface) {
        this.base = surface;
        this.foregrounds = [];
        this.backgrounds = [];
        this.collisions = [];
    }
}
exports.SurfaceRenderingTree = SurfaceRenderingTree;
class SurfaceRenderingLayer {
    constructor(type, surface, x, y) {
        this.type = type;
        this.surface = surface;
        this.x = x;
        this.y = y;
    }
}
exports.SurfaceRenderingLayer = SurfaceRenderingLayer;
