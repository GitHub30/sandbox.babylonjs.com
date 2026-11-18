/* global BABYLON */
// ?animation=<名前 or 番号> で、最初に再生するアニメーショングループを指定する
//   例: ?animation=Spin / ?animation=2 / ?animation=none (すべて停止)
// ?animationSpeed=<倍率> で再生速度も指定できる (例: 0.5)
(function () {
    const params = new URLSearchParams(location.search);
    const wanted = params.get("animation");
    const speed = parseFloat(params.get("animationSpeed") || "");
    if (wanted === null && isNaN(speed)) {
        return;
    }

    const findGroup = (groups) => {
        if (wanted === null) {
            return groups.find((g) => g.isPlaying) || groups[0];
        }
        const lower = wanted.toLowerCase();
        return (
            groups.find((g) => g.name === wanted) ||
            groups.find((g) => g.name.toLowerCase() === lower) ||
            (/^\d+$/.test(wanted) ? groups[+wanted] : undefined) ||
            groups.find((g) => g.name.toLowerCase().includes(lower))
        );
    };

    const apply = (scene) => {
        const groups = scene.animationGroups;
        if (wanted !== null && wanted.toLowerCase() === "none") {
            groups.forEach((g) => g.stop());
            return;
        }
        const target = findGroup(groups);
        if (!target) {
            console.warn(`[animation] "${wanted}" が見つかりません。候補: ${groups.map((g, i) => `${i}:${g.name}`).join(", ")}`);
            return;
        }
        groups.forEach((g) => g !== target && g.stop());
        if (!isNaN(speed) && speed > 0) {
            target.speedRatio = speed;
        }
        target.play(true);
    };

    // シーンが作り直されても(別ファイルのドロップなど)最初の1回だけ適用する
    const done = new WeakSet();
    const firstSeen = new WeakMap();
    setInterval(() => {
        const store = (typeof BABYLON !== "undefined" && (BABYLON.EngineStore || BABYLON.Engine)) || null;
        const scene = store && store.LastCreatedScene;
        if (!scene || done.has(scene) || scene.animationGroups.length === 0) {
            return;
        }
        if (!firstSeen.has(scene)) {
            firstSeen.set(scene, performance.now());
        }
        // ローダーの自動再生が始まってから上書きする (始まらない形式でも 2 秒後には適用)
        const autoStarted = scene.animationGroups.some((g) => g.isPlaying);
        if (autoStarted || performance.now() - firstSeen.get(scene) > 2000) {
            done.add(scene);
            apply(scene);
        }
    }, 200);
})();
