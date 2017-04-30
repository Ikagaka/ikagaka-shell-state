"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deep = require("deep-diff");
function diff(lhs, rhs, prefilter, acc) {
    const ret = deep.diff(lhs, rhs, prefilter, acc);
    return ret != null ? ret : [];
}
exports.diff = diff;
// find filename that matches arg "filename" from arg "paths"
// filename: in surface.txt, as ./surface0.png,　surface0.PNG, .\element\element0.PNG ...
function find(paths, filename) {
    filename = filename.split("\\").join("/");
    if (filename.slice(0, 2) === "./")
        filename = filename.slice(2);
    const reg = new RegExp("^" + filename.replace(".", "\.") + "$", "i");
    const hits = paths.filter((key) => reg.test(key));
    return hits;
}
exports.find = find;
// 検索打ち切って高速化
function fastfind(paths, filename) {
    filename = filename.split("\\").join("/");
    if (filename.slice(0, 2) === "./")
        filename = filename.slice(2);
    const reg = new RegExp("^" + filename.replace(".", "\.") + "$", "i");
    for (let i = 0; i < paths.length; i++) {
        if (reg.test(paths[i])) {
            return paths[i];
        }
    }
    return "";
}
exports.fastfind = fastfind;
// random(func, n) means call func 1/n per sec
function random(callback, probability) {
    return setTimeout((() => {
        function nextTick() { random(callback, probability); }
        if (Math.random() < 1 / probability)
            callback(nextTick);
        else
            nextTick();
    }), 1000);
}
exports.random = random;
// cron
function periodic(callback, sec) {
    return setTimeout((() => callback(() => periodic(callback, sec))), sec * 1000);
}
exports.periodic = periodic;
// 非同期ループするだけ
function always(callback) {
    return setTimeout((() => callback(() => always(callback))), 0);
}
exports.always = always;
// min-max 間のランダム値
function randomRange(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
exports.randomRange = randomRange;
// [1,2,3] -> 1 or 2 or 3 as 33% probability
function choice(arr) {
    return arr[Math.ceil(Math.random() * 100 * (arr.length)) % arr.length];
}
exports.choice = choice;
function has(dir, path) {
    return fastfind(Object.keys(dir), path);
}
exports.has = has;
function get(dir, path) {
    let key = "";
    if ((key = this.has(dir, path)) === "") {
        return Promise.reject("file not find");
    }
    return Promise.resolve(dir[key]);
}
exports.get = get;
// 0 -> sakura
function scope(scopeId) {
    return scopeId === 0 ? "sakura"
        : scopeId === 1 ? "kero"
            : "char" + scopeId;
}
exports.scope = scope;
// sakura -> 0
// parse error -> -1
function unscope(charId) {
    return charId === "sakura" ? 0
        : charId === "kero" ? 1
            : Number((/^char(\d+)/.exec(charId) || ["", "-1"])[1]);
}
exports.unscope = unscope;
