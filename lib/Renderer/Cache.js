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
const Util = require("./Util");
/**
 * CacheCanvas は ディレクトリアクセスをフックし
 * 比較的重い処理である surface*.png の色抜き処理をキャッシングする
 */
class CanvasCache {
    constructor(dir) {
        this.directory = new Map();
        for (let path in dir) {
            this.directory.set(path, dir[path]);
        }
        this.cache = new Map();
    }
    hasFile(path) {
        return this.directory.has(path);
    }
    hasCache(path) {
        return this.cache.has(path);
    }
    getFile(path) {
        const file = this.directory.get(path);
        if (file != null) {
            return file();
        }
        else {
            return Promise.resolve(null);
        }
    }
    getCache(path) {
        const cache = this.cache.get(path);
        if (cache != null) {
            return cache;
        }
        else {
            return null;
        }
    }
    getCanvas(path, asis = false, retry = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = this.getCache(path);
            if (asis && cache != null) {
                // 色抜き後のキャッシュがあった
                return cache;
            }
            const file = yield this.getFile(path);
            if (file == null) {
                // そもそもpngファイルがなかった
                if (retry === false) {
                    // 二度目はない
                    return Promise.reject(new Error("not found"));
                }
                // 我々は心優しいので寛大にも拡張子つけ忘れに対応してあげる
                if (!this.hasFile(path + ".png")) {
                    // それでもやっぱりpngファイルがなかった
                    console.warn("CanvasCache#getCanvas: not found, ", path);
                    return Promise.reject(new Error("not found"));
                }
                // なんとpngファイルがあった
                console.warn("CanvasCache#getCanvas: ", "element file " + path + " need '.png' extension");
                // 拡張子つけてリトライ
                return this.getCanvas(path + ".png", asis, false /* 二度目はない */);
            }
            const img = yield Util.fetchImageFromArrayBuffer(file);
            const png = Util.copy(img);
            if (asis) {
                // 色抜き前でいい(色抜きが重いので色抜き前で良いならABからBlobしてIMGしてCNVしてしまう)
                return Promise.resolve(png);
            }
            const pna_name = changeFileExtension(path, "pna");
            let cnv;
            try {
                const pna = yield this.getCanvas(pna_name, true, // pna読み出しなのでasis適用しない
                false);
                // pnaあったので色抜き
                cnv = yield png_pna(png, pna);
            }
            catch (err) {
                // pnaとかなかったのでそのまま色抜き
                cnv = yield chromakey(png);
            }
            this.cache.set(path, cnv);
            return cnv;
        });
    }
    clear() {
        this.cache.clear();
    }
}
exports.CanvasCache = CanvasCache;
function changeFileExtension(filename, without_dot_new_extention) {
    return filename.replace(/\.[^\.]+$/i, "") + "." + without_dot_new_extention;
}
function chromakey(png) {
    const cnvA = Util.copy(png);
    const ctxA = cnvA.getContext("2d");
    const imgdata = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
    chromakey_snipet(imgdata.data);
    ctxA.putImageData(imgdata, 0, 0);
    return cnvA;
}
function png_pna(png, pna) {
    const cnvA = png instanceof HTMLCanvasElement ? png : Util.copy(png);
    const ctxA = cnvA.getContext("2d");
    const imgdataA = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
    const dataA = imgdataA.data;
    const cnvB = pna instanceof HTMLCanvasElement ? pna : Util.copy(pna);
    const ctxB = cnvB.getContext("2d");
    const imgdataB = ctxB.getImageData(0, 0, cnvB.width, cnvB.height);
    const dataB = imgdataB.data;
    for (let y = 0; y < cnvB.height; y++) {
        for (let x = 0; x < cnvB.width; x++) {
            const iA = x * 4 + y * cnvA.width * 4; // baseのxy座標とインデックス
            const iB = x * 4 + y * cnvB.width * 4; // pnaのxy座標とインデックス
            dataA[iA + 3] = dataB[iB]; // pnaのRの値をpngのalphaチャネルへ代入
        }
    }
    ctxA.putImageData(imgdataA, 0, 0);
    return cnvA;
}
function chromakey_snipet(data) {
    const r = data[0], g = data[1], b = data[2], a = data[3];
    let i = 0;
    if (a !== 0) {
        while (i < data.length) {
            if (r === data[i] && g === data[i + 1] && b === data[i + 2]) {
                data[i + 3] = 0;
            }
            i += 4;
        }
    }
}
