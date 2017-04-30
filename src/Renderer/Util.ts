
// canvasの座標のアルファチャンネルが不透明ならtrue
export function isHit(cnv: HTMLCanvasElement, x: number, y: number ): boolean {
  if(!(x > 0 && y > 0)) return false;
  // x,yが0以下だと DOMException: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source height is 0.
  if(!(cnv.width > 0 || cnv.height > 0)) return false;
  const ctx = <CanvasRenderingContext2D>cnv.getContext("2d");
  const imgdata = ctx.getImageData(0, 0, x, y);
  const data = imgdata.data;
  return data[data.length - 1] !== 0;
}

// 1x1の canvas を作るだけ
export function createCanvas(width=1, height=1): HTMLCanvasElement {
  const cnv = document.createElement("canvas");
  cnv.width = width;
  cnv.height = height;
  return cnv;
}

// copy canvas as new object
// this copy technic is faster than getImageData full copy, but some pixels are bad copy.
// see also: http://stackoverflow.com/questions/4405336/how-to-copy-contents-of-one-canvas-to-another-canvas-locally
export function copy(cnv: HTMLCanvasElement|HTMLImageElement): HTMLCanvasElement {
  const _copy = document.createElement("canvas");
  const ctx = <CanvasRenderingContext2D>_copy.getContext("2d");
  _copy.width = cnv.width;
  _copy.height = cnv.height;
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(<HTMLCanvasElement>cnv, 0, 0); // type hack
  return _copy;
}




// tmpcnvにコピー
export function fastcopy(cnv: HTMLCanvasElement|HTMLImageElement, tmpctx: CanvasRenderingContext2D): void {
  tmpctx.canvas.width = cnv.width;
  tmpctx.canvas.height = cnv.height;
  tmpctx.globalCompositeOperation = "source-over";
  tmpctx.drawImage(<HTMLCanvasElement>cnv, 0, 0); // type hack
}

// ArrayBuffer -> HTMLImageElement
export function fetchImageFromArrayBuffer(buffer: ArrayBuffer, mimetype?:string): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(new Blob([buffer], {type: "image/png"}));
  return fetchImageFromURL(url).then((img)=>{
    URL.revokeObjectURL(url);
    return img;
  });
}

// URL -> HTMLImageElement
export function fetchImageFromURL(url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject)=>{
    const img = new Image();
    img.src = url;
    img.addEventListener("load", function() {
      resolve(img);
    });
    img.addEventListener("error", function(ev) {
      console.error("SurfaceUtil.fetchImageFromURL:", ev);
      reject(ev.error);
    });
  });
}


export function cvt(a: {[a:string]: ArrayBuffer}): {[a:string]: ()=> Promise<ArrayBuffer>} {
  return Object.keys(a).reduce((o,key)=> (o[key] = ()=> Promise.resolve(a[key]), o), {});
}



export function setPictureFrame(element: HTMLElement, description: string){
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


export function craetePictureFrame(description: string, target=document.body){
  const fieldset = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.appendChild(document.createTextNode(description));
  fieldset.style.display = 'inline-block';
  fieldset.style.backgroundColor = "#D2E0E6";
  fieldset.appendChild(legend);
  target.appendChild(fieldset);
  const add = (element: HTMLElement|string, txt="")=>{
      if(element instanceof HTMLElement && txt!==""){
        const frame = craetePictureFrame(txt, fieldset);
        frame.add(element);
      }else if(typeof element === "string"){
        const txtNode = document.createTextNode(element);
        const p = document.createElement("p");
        p.appendChild(txtNode);
        fieldset.appendChild(p);
      }else{
        fieldset.appendChild(element);
      }
  };
  return { add };
}

