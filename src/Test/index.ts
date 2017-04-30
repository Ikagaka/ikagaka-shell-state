import $ = require("jquery");
import * as SU from "../Util/";
import {NarLoader} from "narloader";
import {load} from "ikagaka-shell-loader/lib/";
import * as SHS from "../State/ShellState";


import QUnit = require('qunitjs');
const empower   = <Function>require('empower');
const formatter = <Function>require('power-assert-formatter');
const qunitTap  = <Function>require("qunit-tap");
//QUnit.config.autostart = false;
empower(QUnit.assert, formatter(), { destructive: true });
qunitTap(QUnit, function() { console.log.apply(console, arguments); }, {showSourceOnFailure: false});


function cvt(a: {[a:string]: ArrayBuffer}): {[a:string]: ()=> Promise<ArrayBuffer>} {
  return Object.keys(a).reduce((o,key)=> (o[key] = ()=> Promise.resolve(a[key]), o), {});
}



QUnit.module('SurfaceUtil');




QUnit.test("SurfaceUtil.find", (assert)=>{
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

QUnit.test("SurfaceUtil.choice", (assert)=>{
  let results = (()=>{ let arr:number[]=[]; for(let i=0;i<1000;i++){arr.push(SU.choice([1,2,3]));} return arr; })();
  let a = results.reduce(((count, val)=> val === 1 ? count+1 : count), 0)/results.length;
  assert.ok(0.2 < a && a < 0.4);
  let b = results.reduce(((count, val)=> val === 2 ? count+1 : count), 0)/results.length;
  assert.ok(0.2 < b && b < 0.4);
  let c = results.reduce(((count, val)=> val === 3 ? count+1 : count), 0)/results.length;
  assert.ok(0.2 < c && c < 0.4);
});


QUnit.test("SurfaceUtil.random, SurfaceUtil.periodic SurfaceUtil.always (wait 10 sec)", (assert)=>{
  const done = assert.async();
  assert.expect(3);
  const endtime = Date.now() + 1000*10;
  return Promise.all([
    new Promise((resolve, reject)=>{
      let count = 0;
      let func = (next:Function)=>{
        if(endtime < Date.now()){
          assert.ok(4 <= count && count <= 6, "random, 2");
          return resolve()
        }
        count++;
        next();
      };
      SU.random(func, 2);
    }),
    new Promise((resolve, reject)=>{
      let count = 0
      let func = (next:Function)=>{
        if(endtime < Date.now()){
          assert.ok(4 <= count && count <= 6, "periodic");
          return resolve();
        }
        count++;
        next();
      }
      SU.periodic(func, 2);
    }),
    new Promise((resolve, reject)=>{
      let count = 0;
      let func = (next:Function)=>{
        if(endtime < Date.now()){
          assert.ok(9 <= count && count <= 11, "always");
          return resolve();
        }
        count++;
        setTimeout(next, 1000);
      }
      SU.always(func)
    })
  ]).then(done);
});


QUnit.test("SurfaceUtil.randomRange", (assert)=>{
  assert.expect(10);
  let results = (()=>{ let arr:number[]=[]; for(let i=0;i<1000;i++){arr.push(SU.randomRange(0, 9));} return arr; })();
  const histgram = (()=>{ let arr:number[][]=[]; for(let i=0;i<10;i++){arr.push(results.filter((a)=> a === i));} return arr; })();
  histgram.forEach((arr, i)=>{
    const parsent = arr.length/10;
    assert.ok(5 <= parsent && parsent <= 15, ""+i);
  });
});




QUnit.module('Shell.SurfaceState');

QUnit.test('SR.SurfaceState', async (assert)=>{
  const dir = await NarLoader.loadFromURL("/nar/mobilemaster.nar");
  const dic = await cvt(dir.getDirectory("shell/master").asArrayBuffer());
  const shell = await load(dic);
  console.log(shell);
  // 当たり判定表示
  shell.config.enableRegion = true;
  // bind の変更とかできる子
  const shellState = new SHS.ShellState(shell);
  const scopeId = 0;
  const surfaceId = 0;
  const srfState = shellState.createSurfaceState(scopeId, surfaceId, (tree)=>{ console.info(tree); return Promise.resolve(); });
  srfState.debug = true;
  
  console.log(srfState);

  // 初回描画
  await srfState.render();
  assert.ok(true);
});



QUnit.module('Shell.Renderer');

import {SurfaceBaseRenderer, SurfacePatternRenderer, Canvas, Util} from "../Renderer/";

QUnit.test('Renderer', async (assert)=>{
  setCanvasStyle();
  const dir = await NarLoader.loadFromURL("/nar/mobilemaster.nar");
  const dic = await cvt(dir.getDirectory("shell/master").asArrayBuffer());
  const shell = await load(dic);
  console.log(shell);
  // 当たり判定表示
  shell.config.enableRegion = true;
  // bind の変更とかできる子
  const shellState = new SHS.ShellState(shell);
  // ベースサーフェス生成器
  const baseCache = new SurfaceBaseRenderer(shell);
  // プリロードすると安心だけど重い
  //await baseCache.preload();
  const scopeId = 0;
  const surfaceId = 0;
  // まずベースサーフェスサイズを取得
  const {width, height} = await baseCache.getBaseSurfaceSize(surfaceId);
  const realCanvas = Util.createCanvas(width, height);
  document.body.appendChild(realCanvas);
  // レンダラに実 DOM canvas を attach
  const rndr = new SurfacePatternRenderer(baseCache);
  rndr.attachCanvas(new Canvas(realCanvas));
  
  rndr.offscreen.debug = true;
  // surface model を生成
  const srfState = shellState.createSurfaceState(scopeId, surfaceId, (tree)=>{ rndr.render(surfaceId, tree); return Promise.resolve(); });

  srfState.debug = true;
  
  console.log(srfState);

  // 初回描画
  await srfState.render();
  assert.ok(true);
});

function setCanvasStyle(){
  $(function() {
    $("<style />").html("canvas,img{border:1px solid black;}").appendTo($("head"));
  });
}
