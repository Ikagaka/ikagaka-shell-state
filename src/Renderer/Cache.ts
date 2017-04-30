import * as Util from "./Util";

export type Path = string;

/**
 * CacheCanvas は ディレクトリアクセスをフックし
 * 比較的重い処理である surface*.png の色抜き処理をキャッシングする
 */
export class CanvasCache {
  directory: Map<Path, ()=>Promise<ArrayBuffer>>;
  cache: Map<Path, HTMLCanvasElement>; // 色抜きキャッシュ
  constructor(dir: {[path: string]: ()=>Promise<ArrayBuffer>; }){
    this.directory = new Map();
    for(let path in dir){
      this.directory.set(path, dir[path]);
    }
    this.cache = new Map();
  }
  hasFile(path: string): boolean {
    return this.directory.has(path);
  }
  hasCache(path: string): boolean {
    return this.cache.has(path);
  }
  getFile(path: string): Promise<ArrayBuffer|null> {
    const file = this.directory.get(path);
    if(file != null){ return file(); }
    else{             return Promise.resolve(null); }
  }
  getCache(path: string): HTMLCanvasElement | null {
    const cache = this.cache.get(path);
    if(cache != null){ return cache; }
    else{              return null;  }
  }
  async getCanvas(path: string, asis=false, retry=true): Promise<HTMLCanvasElement> {
    const cache = this.getCache(path);
    if(asis && cache != null){
      // 色抜き後のキャッシュがあった
      return cache;
    }
    const file = await this.getFile(path);
    if(file == null){
      // そもそもpngファイルがなかった
      if(retry === false){
        // 二度目はない
        return Promise.reject(new Error("not found"));
      }
      // 我々は心優しいので寛大にも拡張子つけ忘れに対応してあげる
      if(!this.hasFile(path+".png")){
        // それでもやっぱりpngファイルがなかった
        console.warn("CanvasCache#getCanvas: not found, ", path);
        return Promise.reject(new Error("not found"));
      }
      // なんとpngファイルがあった
      console.warn("CanvasCache#getCanvas: ", "element file " + path + " need '.png' extension");
      // 拡張子つけてリトライ
      return this.getCanvas(path+".png", asis, false/* 二度目はない */);
    }
    const img = await Util.fetchImageFromArrayBuffer(file);
    const png = Util.copy(img);
    if(asis){
      // 色抜き前でいい(色抜きが重いので色抜き前で良いならABからBlobしてIMGしてCNVしてしまう)
      return Promise.resolve(png);
    }
    const pna_name = changeFileExtension(path, "pna");
    let cnv: HTMLCanvasElement;
    try{
      const pna = await this.getCanvas(
        pna_name,
        true, // pna読み出しなのでasis適用しない
        false, // リトライしない
      );
      // pnaあったので色抜き
      cnv = await png_pna(png, pna);
    }catch(err){
      // pnaとかなかったのでそのまま色抜き
      cnv = await chromakey(png);
    }
    this.cache.set(path, cnv);
    return cnv;
  }
  clear(){
    this.cache.clear();
  }
}



function changeFileExtension(filename: string, without_dot_new_extention:string):string{
  return filename.replace(/\.[^\.]+$/i, "") + "." + without_dot_new_extention;
}

function chromakey(png: HTMLCanvasElement|HTMLImageElement):HTMLCanvasElement{
  const cnvA = Util.copy(png);
  const ctxA = <CanvasRenderingContext2D>cnvA.getContext("2d");
  const imgdata = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
  chromakey_snipet(<Uint8ClampedArray><any>imgdata.data);
  ctxA.putImageData(imgdata, 0, 0);
  return cnvA;
}

function png_pna(png: HTMLCanvasElement|HTMLImageElement, pna: HTMLCanvasElement|HTMLImageElement) {
  const cnvA = png instanceof HTMLCanvasElement ? png : Util.copy(png);
  const ctxA = <CanvasRenderingContext2D>cnvA.getContext("2d");
  const imgdataA = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
  const dataA = imgdataA.data;
  const cnvB = pna instanceof HTMLCanvasElement ? pna : Util.copy(pna);
  const ctxB = <CanvasRenderingContext2D>cnvB.getContext("2d")
  const imgdataB = ctxB.getImageData(0, 0, cnvB.width, cnvB.height);
  const dataB = imgdataB.data;
  for(let y=0; y<cnvB.height; y++){
    for(let x=0; x<cnvB.width; x++){
      const iA = x*4 + y*cnvA.width*4; // baseのxy座標とインデックス
      const iB = x*4 + y*cnvB.width*4; // pnaのxy座標とインデックス
      dataA[iA+3] = dataB[iB]; // pnaのRの値をpngのalphaチャネルへ代入
    }
  }
  ctxA.putImageData(imgdataA, 0, 0);
  return cnvA;
}



function chromakey_snipet(data: Uint8ClampedArray): void { // side effect
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


