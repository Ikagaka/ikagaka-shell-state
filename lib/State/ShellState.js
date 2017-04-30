"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const SurfaceState_1 = require("./SurfaceState");
const SurfaceModel_1 = require("../Model/SurfaceModel");
class ShellState extends events_1.EventEmitter {
    constructor(shell) {
        super();
        this.shell = shell;
        this.config = shell.config;
    }
    destructor() {
        this.removeAllListeners("render");
    }
    createSurfaceState(scopeId, surfaceId, rndr) {
        const state = new SurfaceState_1.SurfaceState(new SurfaceModel_1.SurfaceModel(scopeId, surfaceId), this.shell, rndr);
        const render = () => state.render();
        this.on("render", render);
        state.addListener("destructing", () => { this.removeListener("render", render); });
        return state;
    }
    showRegion() {
        const { shell } = this;
        const { config } = shell;
        config.enableRegion = true;
        this.emit("render");
    }
    hideRegion() {
        const { shell } = this;
        const { config } = shell;
        config.enableRegion = false;
        this.emit("render");
    }
    bind(a, b) {
        const { shell } = this;
        const { config } = shell;
        bind_value(config, a, b, true);
        this.emit("render");
    }
    unbind(a, b) {
        const { shell } = this;
        const { config } = shell;
        bind_value(config, a, b, false);
        this.emit("render");
    }
}
exports.ShellState = ShellState;
// 着せ替えオンオフ
function bind_value(config, a, b, flag) {
    const { bindgroup, char } = config;
    if (typeof a === "number" && typeof b === "number") {
        const scopeId = a;
        const bindgroupId = b;
        if (bindgroup[scopeId] == null) {
            console.warn("ShellState#bind_value: bindgroup", "scopeId:", scopeId, "bindgroupId:", bindgroupId, "is not defined");
            return;
        }
        bindgroup[scopeId][bindgroupId] = flag;
        return;
    }
    if (typeof a === "string" && typeof b === "string") {
        const _category = a;
        const _parts = b;
        char.forEach((char, scopeId) => {
            char.bindgroup.forEach((bindgroup, bindgroupId) => {
                const { category, parts } = bindgroup.name;
                if (_category === category && _parts === parts) {
                    bind_value(config, scopeId, bindgroupId, flag);
                }
            });
        });
    }
    console.error("ShellState#bind_value:", "TypeError:", a, b);
    return;
}
