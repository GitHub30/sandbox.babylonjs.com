# sandbox.babylonjs.com (side panes hidden)

[Babylon.js Sandbox](https://sandbox.babylonjs.com) のミラーです。本家では、モデルの読み込みエラーや glTF Validator のエラーが起きると Inspector（左右のパネル）が自動で開きますが、このミラーでは開きません。

https://github30.github.io/sandbox.babylonjs.com/?asset=URL&kiosk=true

- URL パラメータは本家と同じです（`asset`, `kiosk`, `cameraPosition`, `autoRotate`, `skybox`, `environment`, `clearColor`, `toneMapping` …）。
- `inspector=true` を付けると、本家と同じようにエラー時に Inspector が自動で開きます。
- `animation=<名前 or 番号>` で最初に再生するアニメーションを指定できます（大文字小文字は無視、部分一致も可。`none` で全停止）。`animationSpeed=0.5` などで速度も変えられます（このミラー独自の拡張、`animation.js`）。
- フッターの「Display inspector」ボタンは本家と同じように使えます。
- `update.sh` で本家の最新版を取得してパッチを当て直します（GitHub Actions で毎週自動実行）。
