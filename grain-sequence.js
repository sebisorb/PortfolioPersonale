// ===============================
// GRANA DA SEQUENZA DI IMMAGINI
// Usa frame di grana pellicola vera in img/grain/ (grain_01.png, grain_02.png, …)
// ===============================
(function () {
    "use strict";

    var config = {
        pathPrefix: "img/grain/grain_",
        extension: "png",
        frameCount: 24,
        fps: 12,
        opacity: 0.22
    };

    function pad(n, len) {
        var s = String(n);
        while (s.length < len) s = "0" + s;
        return s;
    }

    function init() {
        var frameUrls = [];
        var done = 0;
        var total = config.frameCount;

        for (var i = 1; i <= total; i++) {
            var src = config.pathPrefix + pad(i, 2) + "." + config.extension;
            frameUrls.push(src);
            var img = new Image();
            img.onload = img.onerror = function () {
                done++;
                if (done === total) run(frameUrls);
            };
            img.src = src;
        }

        function run(urls) {
            if (!urls.length) return;

            var wrap = document.createElement("div");
            wrap.id = "grain-sequence-layer";
            wrap.className = "grain-sequence-layer";
            wrap.setAttribute("aria-hidden", "true");

            var overlay = document.createElement("div");
            overlay.className = "grain-sequence-overlay";

            wrap.appendChild(overlay);
            document.body.insertBefore(wrap, document.body.firstChild);

            var idx = 0;
            overlay.style.backgroundImage = "url(" + urls[0] + ")";
            overlay.style.opacity = String(config.opacity);

            var ms = 1000 / config.fps;
            setInterval(function () {
                idx = (idx + 1) % urls.length;
                overlay.style.backgroundImage = "url(" + urls[idx] + ")";
            }, ms);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
