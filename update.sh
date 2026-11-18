#!/usr/bin/env bash
# 本家 sandbox.babylonjs.com の配信ファイルを取得し、Inspector(左右パネル)の自動表示を無効化するパッチを当てる
set -euo pipefail
cd "$(dirname "$0")"
BASE=https://sandbox.babylonjs.com

curl -fsSL "$BASE/index.js" -o index.js
curl -fsSL "$BASE/babylon.sandbox.js" -o babylon.sandbox.js

ENTRY=$(grep -oE '\./assets/index-[A-Za-z0-9_-]+\.js' babylon.sandbox.js | head -1)
[ -n "$ENTRY" ] || { echo "entry chunk not found"; exit 1; }
rm -rf assets && mkdir assets
curl -fsSL "$BASE/${ENTRY#./}" -o "${ENTRY#./}"

# Service Worker は登録しない(古いキャッシュが残るのを防ぐ)
python3 - "${ENTRY#./}" <<'PY'
import re, sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()

# ?inspector=true のときだけ、従来どおりエラー時に自動で開く
GUARD = '(new URLSearchParams(location.search).get("inspector")==="true")&&'

# 1) 読み込みエラー時の自動表示
s, n1 = re.subn(r'(\w+)\.scene&&this\._globalState\.showDebugLayer\(\)',
                lambda m: f'{m.group(1)}.scene&&{GUARD}this._globalState.showDebugLayer()', s)
# 2) glTF Validator のエラー時の自動表示
s, n2 = re.subn(r'(\w+)\.issues\.numErrors>0&&this\.props\.globalState\.showDebugLayer\(\)',
                lambda m: f'{m.group(1)}.issues.numErrors>0&&{GUARD}this.props.globalState.showDebugLayer()', s)
if n1 != 1 or n2 != 1:
    sys.exit(f"patch failed: onError={n1} validator={n2}")
open(p, "w", encoding="utf-8").write(s)
print("patched", p)
PY

sed -i 's/navigator.serviceWorker.register("sw.js");/\/\/ service worker disabled/' index.js
echo "done: $ENTRY"
