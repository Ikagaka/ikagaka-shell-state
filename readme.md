# ikagaka-shell-state

1スコープのサーフェスのレイヤーのステートマシンです

```ts
async function main (){
  const dir = await NarLoader.loadFromURL("/nar/mobilemaster.nar");
  const dic = await cvt(dir.getDirectory("shell/master").asArrayBuffer());
  const shell = await load(dic);
  console.log(shell);
  const shellState = new ShellState(shell);
  const scopeId = 0;
  const surfaceId = 0;
  const renderer = (tree)=>{
    console.info(tree);
    // something canvas rendering
    return Promise.resolve();
  }
  const srfState = shellState.createSurfaceState(scopeId, surfaceId, renderer);
  
  await sleep(30 * 1000);

  srfState.destructor();
});
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
    /** アニメーション再生タイミングを開始する */
    begin(animId: number): void;
    /** アニメーション再生タイミングを停止する */
    end(animId: number): void;
    /** 全てのアニメーション再生タイミングを停止する */
    endAll(): void;
    /** アニメーションを再生 */
    play(animId: number): Promise<void>;
    /** アニメーションを停止 */
    stop(animId: number): void;
    /** アニメーションを一時停止 */
    pause(animId: number): void;
    /** アニメーションを再開 */
    resume(animId: number): void;
    /** talk アニメーションを再生 */
    talk(): void;
    /** yen-e アニメーションを再生 */
    yenE(): Promise<void>;
}
```

## develop

`src/Renderer` にレンダラの参考実装が用意してあります。
`playground.html` で試すことができます。

```
npm run init
npm run build
npm run test
npm run play
```
