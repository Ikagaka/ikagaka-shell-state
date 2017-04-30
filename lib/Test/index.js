"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const $ = require("jquery");
const SU = require("../Util/");
const narloader_1 = require("narloader");
const _1 = require("ikagaka-shell-loader/lib/");
const SHS = require("../State/ShellState");
const QUnit = require("qunitjs");
const empower = require('empower');
const formatter = require('power-assert-formatter');
const qunitTap = require("qunit-tap");
//QUnit.config.autostart = false;
empower(QUnit.assert, formatter(), { destructive: true });
qunitTap(QUnit, function () { console.log.apply(console, arguments); }, { showSourceOnFailure: false });
function cvt(a) {
    return Object.keys(a).reduce((o, key) => (o[key] = () => Promise.resolve(a[key]), o), {});
}
QUnit.module('SurfaceUtil');
QUnit.test("SurfaceUtil.find", (assert) => {
    const paths = [
        "surface0.png",
        "surface10.png",
        "elements/element0.png"
    ];
    let results = SU.find(paths, "./surface0.png");
    assert.ok(results[0] === paths[0]);
    results = SU.find(paths, "SURFACE10.PNG");
    assert.ok(results[0] === paths[1]);
    results = SU.find(paths, "elements\\element0.png");
    assert.ok(results[0] === paths[2]);
});
QUnit.test("SurfaceUtil.choice", (assert) => {
    let results = (() => { let arr = []; for (let i = 0; i < 1000; i++) {
        arr.push(SU.choice([1, 2, 3]));
    } return arr; })();
    let a = results.reduce(((count, val) => val === 1 ? count + 1 : count), 0) / results.length;
    assert.ok(0.2 < a && a < 0.4);
    let b = results.reduce(((count, val) => val === 2 ? count + 1 : count), 0) / results.length;
    assert.ok(0.2 < b && b < 0.4);
    let c = results.reduce(((count, val) => val === 3 ? count + 1 : count), 0) / results.length;
    assert.ok(0.2 < c && c < 0.4);
});
QUnit.test("SurfaceUtil.random, SurfaceUtil.periodic SurfaceUtil.always (wait 10 sec)", (assert) => {
    const done = assert.async();
    assert.expect(3);
    const endtime = Date.now() + 1000 * 10;
    return Promise.all([
        new Promise((resolve, reject) => {
            let count = 0;
            let func = (next) => {
                if (endtime < Date.now()) {
                    assert.ok(4 <= count && count <= 6, "random, 2");
                    return resolve();
                }
                count++;
                next();
            };
            SU.random(func, 2);
        }),
        new Promise((resolve, reject) => {
            let count = 0;
            let func = (next) => {
                if (endtime < Date.now()) {
                    assert.ok(4 <= count && count <= 6, "periodic");
                    return resolve();
                }
                count++;
                next();
            };
            SU.periodic(func, 2);
        }),
        new Promise((resolve, reject) => {
            let count = 0;
            let func = (next) => {
                if (endtime < Date.now()) {
                    assert.ok(9 <= count && count <= 11, "always");
                    return resolve();
                }
                count++;
                setTimeout(next, 1000);
            };
            SU.always(func);
        })
    ]).then(done);
});
QUnit.test("SurfaceUtil.randomRange", (assert) => {
    assert.expect(10);
    let results = (() => { let arr = []; for (let i = 0; i < 1000; i++) {
        arr.push(SU.randomRange(0, 9));
    } return arr; })();
    const histgram = (() => { let arr = []; for (let i = 0; i < 10; i++) {
        arr.push(results.filter((a) => a === i));
    } return arr; })();
    histgram.forEach((arr, i) => {
        const parsent = arr.length / 10;
        assert.ok(5 <= parsent && parsent <= 15, "" + i);
    });
});
QUnit.module('Shell.SurfaceState');
QUnit.test('SR.SurfaceState', (assert) => __awaiter(this, void 0, void 0, function* () {
    const dir = yield narloader_1.NarLoader.loadFromURL("/nar/mobilemaster.nar");
    const dic = yield cvt(dir.getDirectory("shell/master").asArrayBuffer());
    const shell = yield _1.load(dic);
    console.log(shell);
    // 当たり判定表示
    shell.config.enableRegion = true;
    // bind の変更とかできる子
    const shellState = new SHS.ShellState(shell);
    const scopeId = 0;
    const surfaceId = 0;
    const srfState = shellState.createSurfaceState(scopeId, surfaceId, (tree) => { console.info(tree); return Promise.resolve(); });
    srfState.debug = true;
    console.log(srfState);
    // 初回描画
    yield srfState.render();
    assert.ok(true);
}));
QUnit.module('Shell.Renderer');
const _2 = require("../Renderer/");
QUnit.test('Renderer', (assert) => __awaiter(this, void 0, void 0, function* () {
    setCanvasStyle();
    const dir = yield narloader_1.NarLoader.loadFromURL("/nar/mobilemaster.nar");
    const dic = yield cvt(dir.getDirectory("shell/master").asArrayBuffer());
    const shell = yield _1.load(dic);
    console.log(shell);
    // 当たり判定表示
    shell.config.enableRegion = true;
    // bind の変更とかできる子
    const shellState = new SHS.ShellState(shell);
    // ベースサーフェス生成器
    const baseCache = new _2.SurfaceBaseRenderer(shell);
    // プリロードすると安心だけど重い
    //await baseCache.preload();
    const scopeId = 0;
    const surfaceId = 0;
    // まずベースサーフェスサイズを取得
    const { width, height } = yield baseCache.getBaseSurfaceSize(surfaceId);
    const realCanvas = _2.Util.createCanvas(width, height);
    document.body.appendChild(realCanvas);
    // レンダラに実 DOM canvas を attach
    const rndr = new _2.SurfacePatternRenderer(baseCache);
    rndr.attachCanvas(new _2.Canvas(realCanvas));
    rndr.offscreen.debug = true;
    // surface model を生成
    const srfState = shellState.createSurfaceState(scopeId, surfaceId, (tree) => { rndr.render(surfaceId, tree); return Promise.resolve(); });
    srfState.debug = true;
    console.log(srfState);
    // 初回描画
    yield srfState.render();
    assert.ok(true);
}));
function setCanvasStyle() {
    $(function () {
        $("<style />").html("canvas,img{border:1px solid black;}").appendTo($("head"));
    });
}
