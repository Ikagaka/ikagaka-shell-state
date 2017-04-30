# ikagaka-shell-state

1スコープのサーフェスのレイヤーのステートマシンです

```ts
async function main (){
  const dir = await NarLoader.loadFromURL("/nar/mobilemaster.nar");
  const dic = await cvt(dir.getDirectory("shell/master").asArrayBuffer());
  const shell = await ShellLoader.load(dic); // https://github.com/Ikagaka/ikagaka-shell-loader
  const shellState = new ShellState(shell);
  const scopeId = 0;
  const surfaceId = 0;

  function render(scopeId: number, surfaceId: number, tree: SurfaceRenderingTree): Promise<void>{
    console.info(tree);
    // something canvas rendering
    return Promise.resolve();
  }

  const srfState = shellState.createSurfaceState(scopeId, surfaceId, render);
  
  await sleep(30 * 1000);

  srfState.destructor();
}
```

## API

```ts
export declare class ShellState {
    constructor(shell: Shell);
    destructor(): void;
    /**
      * サーフェスのステートマシンを構成して開始します。
      * 描画すべきタイミングで引数に渡した renderer 関数が呼ばれます。
      * tree: SurfaceRenderingTree は現在表示すべきレイヤ状態です。
      * renderer は 渡された引数を元に何らかの方法で何らかの対象に描画します。
      * renderer は 描画の終了を知らせる Promise を返してください。
      */
    createSurfaceState(scopeId: number, surfaceId: number, renderer: (scopeId: number, surfaceId: number, tree: SurfaceRenderingTree) => Promise<void>): SurfaceState;
    /** デバッグ用 collision 領域の表示 */
    showRegion(): void;
    hideRegion(): void;
    /** 着せ替えのオンオフ */
    bind(category: string, parts: string): void;
    bind(scopeId: number, bindgroupId: number): void;
    unbind(category: string, parts: string): void;
    unbind(scopeId: number, bindgroupId: number): void;
}

export declare class SurfaceState {
    /** アニメーションを停止しリソースを開放する */
    destructor(): void;
    /** レイヤを構成して描画関数を呼ぶ */
    render(): Promise<void>;
    /** アニメーション再生タイミングを開始・停止 */
    begin(animId: number): void;
    end(animId: number): void;
    /** 全てのアニメーション再生タイミングを停止 */
    endAll(): void;
    /** アニメーションを再生・停止 */
    play(animId: number): Promise<void>;
    stop(animId: number): void;
    /** アニメーションを一時停止・再開 */
    pause(animId: number): void;
    resume(animId: number): void;
    /** talk アニメーションを再生 */
    talk(): void;
    /** yen-e アニメーションを再生 */
    yenE(): Promise<void>;
}
```

## レンダラ設計の指針

レンダラは `\0` や `\1` 一体分のサーフェスのレンダリングをします。

`SurfaceRenderingTree` に含まれるのは element 合成済みのベースサーフェスの Id と、
`animation*.pattern` によって記述された、その前後に表示されるべきベースサーフェスの Id のツリー構造です。

ベースサーフェスの描画に関しては何も指示を与えません。Serikoがそういう仕様だからです。

以下は仮想的なレンダラ `Renderer` を使うための疑似コードです。

```ts
async function main (){
  const dir = await NarLoader.loadFromURL("/nar/mobilemaster.nar");
  const dic = await cvt(dir.getDirectory("shell/master").asArrayBuffer());
  const shell = await ShellLoader.load(dic); // https://github.com/Ikagaka/ikagaka-shell-loader
  const shellState = new ShellState(shell);

  // シェルディレクトリの静的な情報を元にデータを読み込み
  const renderer = new Renderer(shell);

  // 描画先の Canvas などを指定
  renderer.attach($("#some_canvas")[0]);

  // 必要ならばベースサーフェスのプリロードを行う
  await renderer.preload();

  function render(scopeId: number, surfaceId: number, tree: SurfaceRenderingTree): Promise<void>{
    // 描画すべきリソースが未ロードだった場合非同期で読み込むことができる
    return renderer.render(scope, surface, tree);
  }

  // サーフェスのステートマシンを開始する。必要に応じて render 関数が呼ばれるのでその都度描画する。
  const srfState = shellState.createSurfaceState(scopeId, surfaceId, render);
  
  
  await sleep(30 * 1000);

  srfState.destructor();
}
```

サーフェスを変更する前に `srfState.destructor()` を呼んでステートマシンを停止しておく必要があります。
それから `createSurfaceState` して新しいサーフェスのステートマシンを開始してください。



## develop

`src/Renderer` にレンダラの参考実装が用意してあります。
`playground.html` で試すことができます。

```
npm run init
npm run build
npm run test
npm run play
```
