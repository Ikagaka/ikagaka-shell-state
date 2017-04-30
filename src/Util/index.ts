
import * as deep from "deep-diff";
export type SUDiff = deepDiff.IDiff[];
export function diff(lhs: Object, rhs: Object, prefilter?: deepDiff.IPrefilter, acc?: deepDiff.IAccumulator): SUDiff {
  const ret = deep.diff(lhs, rhs, prefilter, acc);
  return ret != null ? ret : [];
}


// find filename that matches arg "filename" from arg "paths"
// filename: in surface.txt, as ./surface0.png,　surface0.PNG, .\element\element0.PNG ...
export function find(paths: string[], filename: string): string[] {
  filename = filename.split("\\").join("/");
  if(filename.slice(0,2) === "./") filename = filename.slice(2);
  const reg =new RegExp("^"+filename.replace(".", "\.")+"$", "i");
  const hits = paths.filter((key)=> reg.test(key));
  return hits;
}

// 検索打ち切って高速化
export function fastfind(paths: string[], filename: string): string {
  filename = filename.split("\\").join("/");
  if(filename.slice(0,2) === "./") filename = filename.slice(2);
  const reg = new RegExp("^"+filename.replace(".", "\.")+"$", "i");
  for(let i=0; i < paths.length; i++){
    if (reg.test(paths[i])){
      return paths[i];
    }
  }
  return "";
}


// random(func, n) means call func 1/n per sec
export function random(callback: (nextTick: Function) => void, probability: number): any {
  return setTimeout((() =>{
    function nextTick(){ random(callback, probability); }
    if (Math.random() < 1/probability) callback(nextTick)
    else nextTick();
  }), 1000);
}

// cron
export function periodic(callback: (nextTick: Function) => void, sec: number): any {
  return setTimeout((() =>
    callback(()=>
      periodic(callback, sec) )
  ), sec * 1000);
}

// 非同期ループするだけ
export function always(  callback: (nextTick: Function) => void): any {
  return setTimeout((() =>
    callback(() => always(callback) )
  ), 0);
}

// min-max 間のランダム値
export function randomRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// [1,2,3] -> 1 or 2 or 3 as 33% probability
export function choice<T>(arr: T[]): T {
  return arr[Math.ceil(Math.random()*100*(arr.length))%arr.length];
}





export function has<T>(dir: {[key: string]: T }, path: string): string {
  return fastfind(Object.keys(dir), path);
}
export function get<T>(dir: {[key:string]: T }, path: string): Promise<T> {
  let key = "";
  if((key = this.has(dir, path)) === ""){
    return Promise.reject("file not find");
  }
  return Promise.resolve(dir[key]);
}



// 0 -> sakura
export function scope(scopeId: number): string {
  return scopeId === 0 ? "sakura"
       : scopeId === 1 ? "kero"
       : "char"+scopeId;
}

// sakura -> 0
// parse error -> -1
export function unscope(charId: string): number {
  return charId === "sakura" ? 0
       : charId === "kero"   ? 1
       : Number((/^char(\d+)/.exec(charId)||["","-1"])[1]);
}



