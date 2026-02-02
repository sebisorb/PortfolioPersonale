// GRANA SEQUENZA PELLICOLA
(function () {
    const config = {
        pathPrefix: "img/grain/grain_",
        extension: "png",
        frameCount: 24,
        fps: 12,
        opacity: 0.22
    };

    function pad(n, len) {
        return String(n).padStart(len, "0");
    }

    const frames = [];
    let loaded = 0;

    for (let i = 1; i <= config.frameCount; i++) {
        const src = `${config.pathPrefix}${pad(i, 2)}.${config.extension}`;
        const img = new Image();
        img.src = src;
        img.onload = img.onerror = () => {
            loaded++;
            if (loaded === config.frameCount) run(frames);
        };
        frames.push(src);
    }

    function run(urls) {
        if (!urls.length) return;

        const wrap = document.createElement("div");
        wrap.id = "grain-sequence-layer";
        wrap.className = "grain-sequence-layer";
        wrap.setAttribute("aria-hidden", "true");

        const overlay = document.createElement("div");
        overlay.className = "grain-sequence-overlay";
        overlay.style.opacity = config.opacity;

        wrap.appendChild(overlay);
        document.body.insertBefore(wrap, document.body.firstChild);

        let idx = 0;
        overlay.style.backgroundImage = `url(${urls[0]})`;

        setInterval(() => {
            idx = (idx + 1) % urls.length;
            overlay.style.backgroundImage = `url(${urls[idx]})`;
        }, 1000 / config.fps);
    }
})();