/*
 * shell config 状態モデルを更新する副作用関数群
 */
import {Shell} from "ikagaka-shell-loader/lib/Model/Shell";
import {Config} from "ikagaka-shell-loader/lib/Model/Config";
import {EventEmitter} from "events";
import {SurfaceState} from "./SurfaceState";
import {SurfaceModel, SurfaceRenderingTree} from "../Model/SurfaceModel";

export class ShellState extends EventEmitter {
  readonly shell: Shell;
  config: Config;

  constructor(shell: Shell){
    super();
    this.shell = shell;
    this.config = shell.config;
  }
  
  destructor(){
    this.removeAllListeners("render");
  }

  createSurfaceState(scopeId: number, surfaceId: number, rndr: (scopeId: number, surfaceId: number, tree: SurfaceRenderingTree)=> Promise<void>): SurfaceState {
    const state = new SurfaceState(new SurfaceModel(scopeId, surfaceId), this.shell, rndr);
    const render = ()=> state.render();
    this.on("render", render);
    state.addListener("destructing", ()=>{ this.removeListener("render", render); });
    return state;
  }


  showRegion(): void {
    const {shell} = this;
    const {config} = shell;
    config.enableRegion = true;
    this.emit("render");
  }

  hideRegion(): void {
    const {shell} = this;
    const {config} = shell;
    config.enableRegion = false;
    this.emit("render");
  }

  bind(category: string, parts: string): void
  bind(scopeId: number, bindgroupId: number): void
  bind(a: number|string, b: number|string): void {
    const {shell} = this;
    const {config} = shell;
    bind_value(config, a, b, true);
    this.emit("render");
  }

  // 着せ替えオフ
  unbind(category: string, parts: string): void
  unbind(scopeId: number, bindgroupId: number): void
  unbind(a: number|string, b: number|string): void {
    const {shell} = this;
    const {config} = shell;
    bind_value(config, a, b, false);
    this.emit("render");
  }
}

// 着せ替えオンオフ
function bind_value(config: Config, a: number|string, b: number|string, flag: boolean): void {
  const {bindgroup, char} = config;
  if(typeof a === "number" && typeof b === "number"){
    const scopeId = a;
    const bindgroupId = b;
    if(bindgroup[scopeId] == null){
      console.warn("ShellState#bind_value: bindgroup", "scopeId:",scopeId, "bindgroupId:",bindgroupId, "is not defined")
      return;
    }
    bindgroup[scopeId][bindgroupId] = flag;
    return;
  }
  if(typeof a === "string" && typeof b === "string"){
    const _category = a;
    const _parts = b;
    char.forEach((char, scopeId)=>{
      char.bindgroup.forEach((bindgroup, bindgroupId)=>{
        const {category, parts} = bindgroup.name;
        if(_category === category && _parts === parts){
          bind_value(config, scopeId, bindgroupId, flag);
        }
      });
    });
  }
  console.error("ShellState#bind_value:", "TypeError:", a, b);
  return;
}

