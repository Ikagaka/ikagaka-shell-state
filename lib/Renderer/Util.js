"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// canvasの座標のアルファチャンネルが不透明ならtrue
function isHit(cnv, x, y) {
    if (!(x > 0 && y > 0))
        return false;
    // x,yが0以下だと DOMException: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source height is 0.
    if (!(cnv.width > 0 || cnv.height > 0))
        return false;
    const ctx = cnv.getContext("2d");
    const imgdata = ctx.getImageData(0, 0, x, y);
    const data = imgdata.data;
    return data[data.length - 1] !== 0;
}
exports.isHit = isHit;
// 1x1の canvas を作るだけ
function createCanvas(width = 1, height = 1) {
    const cnv = document.createElement("canvas");
    cnv.width = width;
    cnv.height = height;
    return cnv;
}
exports.createCanvas = createCanvas;
// copy canvas as new object
// this copy technic is faster than getImageData full copy, but some pixels are bad copy.
// see also: http://stackoverflow.com/questions/4405336/how-to-copy-contents-of-one-canvas-to-another-canvas-locally
function copy(cnv) {
    const _copy = document.createElement("canvas");
    const ctx = _copy.getContext("2d");
    _copy.width = cnv.width;
    _copy.height = cnv.height;
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(cnv, 0, 0); // type hack
    return _copy;
}
exports.copy = copy;
// tmpcnvにコピー
function fastcopy(cnv, tmpctx) {
    tmpctx.canvas.width = cnv.width;
    tmpctx.canvas.height = cnv.height;
    tmpctx.globalCompositeOperation = "source-over";
    tmpctx.drawImage(cnv, 0, 0); // type hack
}
exports.fastcopy = fastcopy;
// ArrayBuffer -> HTMLImageElement
function fetchImageFromArrayBuffer(buffer, mimetype) {
    const url = URL.createObjectURL(new Blob([buffer], { type: "image/png" }));
    return fetchImageFromURL(url).then((img) => {
        URL.revokeObjectURL(url);
        return img;
    });
}
exports.fetchImageFromArrayBuffer = fetchImageFromArrayBuffer;
// URL -> HTMLImageElement
function fetchImageFromURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.addEventListener("load", function () {
            resolve(img);
        });
        img.addEventListener("error", function (ev) {
            console.error("SurfaceUtil.fetchImageFromURL:", ev);
            reject(ev.error);
        });
    });
}
exports.fetchImageFromURL = fetchImageFromURL;
function cvt(a) {
    return Object.keys(a).reduce((o, key) => (o[key] = () => Promise.resolve(a[key]), o), {});
}
exports.cvt = cvt;
function setPictureFrame(element, description) {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.appendChild(document.createTextNode(description));
    fieldset.appendChild(legend);
    fieldset.appendChild(element);
    fieldset.style.display = 'inline-block';
    fieldset.style.backgroundColor = "#D2E0E6";
    document.body.appendChild(fieldset);
    return;
}
exports.setPictureFrame = setPictureFrame;
function craetePictureFrame(description, target = document.body) {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.appendChild(document.createTextNode(description));
    fieldset.style.display = 'inline-block';
    fieldset.style.backgroundColor = "#D2E0E6";
    fieldset.appendChild(legend);
    target.appendChild(fieldset);
    const add = (element, txt = "") => {
        if (element instanceof HTMLElement && txt !== "") {
            const frame = craetePictureFrame(txt, fieldset);
            frame.add(element);
        }
        else if (typeof element === "string") {
            const txtNode = document.createTextNode(element);
            const p = document.createElement("p");
            p.appendChild(txtNode);
            fieldset.appendChild(p);
        }
        else {
            fieldset.appendChild(element);
        }
    };
    return { add };
}
exports.craetePictureFrame = craetePictureFrame;
