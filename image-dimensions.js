// image-dimensions.js
// Imposta width/height alle immagini per evitare layout shift (CLS)

(function () {
    'use strict';

    const dims = {
        "img/foto/copertina.png": [1498, 842],
        "img/foto/food/live1.jpg": [2400, 1600],
        "img/foto/food/live2.jpg": [2400, 1600],
        "img/foto/food/live3.jpg": [2400, 1600],
        "img/foto/food/live4.jpg": [2400, 1600],
        "img/foto/food/live5.jpg": [1600, 2400],
        "img/foto/food/live6.jpg": [2400, 1600],
        "img/foto/food/live7.jpg": [1600, 2400],
        "img/foto/food/live8.jpg": [2400, 1600],
        "img/foto/food/live9.jpg": [2400, 1600],
        "img/foto/food/live10.jpg": [1600, 2400],
        "img/foto/food/live11.jpg": [2400, 1600],
        "img/foto/food/live12.jpg": [2400, 1600],
        "img/foto/food/live13.jpg": [2400, 1600],
        "img/foto/food/live14.jpg": [1600, 2400],
        "img/foto/food/live15.jpg": [2400, 1600],
        "img/foto/food/servizio1.jpg": [2400, 1600],
        "img/foto/food/servizio2.jpg": [2400, 1600],
        "img/foto/food/servizio3.jpg": [2400, 1600],
        "img/foto/food/servizio4.jpg": [2400, 1600],
        "img/foto/food/servizio5.jpg": [1600, 2400],
        "img/foto/food/servizio6.jpg": [2400, 1600],
        "img/foto/food/servizio7.jpg": [2400, 1600],
        "img/foto/food/servizio8.jpg": [2400, 1600],
        "img/foto/food/servizio9.jpg": [2400, 1600],
        "img/foto/food/servizio10.jpg": [2400, 1600],
        "img/foto/food/studio1.jpg": [2400, 1600],
        "img/foto/food/studio2.jpg": [2400, 1600],
        "img/foto/food/studio3.jpg": [2400, 1600],
        "img/foto/food/studio4.jpg": [2400, 1600],
        "img/foto/food/studio5.jpg": [2400, 1600],
        "img/foto/food/studio6.jpg": [2400, 1600],
        "img/foto/food/studio7.jpg": [2400, 1600],
        "img/foto/food/studio8.jpg": [2400, 1600],
        "img/foto/food/studio9.jpg": [2400, 1600],
        "img/foto/food/studio10.jpg": [2400, 1600],
        "img/foto/food/studio11.jpg": [2400, 1600],
        "img/foto/food/studio12.jpg": [2400, 1600],
        "img/foto/food/studio13.jpg": [2400, 1600],
        "img/foto/food/studio14.jpg": [2400, 1600],
        "img/foto/food/studio15.jpg": [2400, 1600],
        "img/foto/Personale/castellonave1.jpg": [2400, 1800],
        "img/foto/Personale/castellonave2.jpg": [2400, 1800],
        "img/foto/Personale/castellonave3.jpg": [2400, 1800],
        "img/foto/Personale/castellonave4.jpg": [2400, 1800],
        "img/foto/Personale/castellonave5.jpg": [2400, 1800],
        "img/foto/Personale/castellonave6.jpg": [2400, 1800],
        "img/foto/Personale/castellonave7.jpg": [2400, 1800],
        "img/foto/Personale/castellonave8.jpg": [2400, 1800],
        "img/foto/Personale/castellonave9.jpg": [2400, 1800],
        "img/foto/Personale/castellonave10.jpg": [2400, 1800],
        "img/foto/Personale/halloween1.jpg": [2400, 1800],
        "img/foto/Personale/halloween2.jpg": [2400, 1800],
        "img/foto/Personale/halloween3.jpg": [2400, 1800],
        "img/foto/Personale/halloween4.jpg": [2400, 1800],
        "img/foto/Personale/halloween5.jpg": [2400, 1800],
        "img/foto/Personale/halloween6.jpg": [2400, 1800],
        "img/foto/Personale/halloween7.jpg": [2400, 1800],
        "img/foto/Personale/halloween8.jpg": [2400, 1800],
        "img/foto/Personale/ir1.jpg": [2400, 1800],
        "img/foto/Personale/ir2.jpg": [2400, 1800],
        "img/foto/Personale/ir3.jpg": [2400, 1800],
        "img/foto/Personale/ir4.jpg": [2400, 1800],
        "img/foto/Personale/ir5.jpg": [2400, 1800],
        "img/foto/Personale/ir6.jpg": [2400, 1800],
        "img/foto/Personale/macerie1.jpg": [2400, 1800],
        "img/foto/Personale/macerie2.jpg": [2400, 1800],
        "img/foto/Personale/macerie3.jpg": [1800, 2400],
        "img/foto/Personale/macerie4.jpg": [1800, 2400],
        "img/foto/Personale/macerie5.jpg": [2400, 1800],
        "img/foto/Personale/macerie6.jpg": [2400, 1800],
        "img/foto/Personale/macerie7.jpg": [2400, 1800],
        "img/foto/Personale/macerie8.jpg": [2400, 1800],
        "img/foto/Personale/macerie9.jpg": [1800, 2400],
        "img/foto/Personale/macerie11.jpg": [1800, 2400],
        "img/foto/Street Photography/1.jpg": [2400, 1600],
        "img/foto/Street Photography/2.jpg": [2400, 1600],
        "img/foto/Street Photography/3.jpg": [2400, 1600],
        "img/foto/Street Photography/4.jpg": [2400, 1600],
        "img/foto/Street Photography/5.jpg": [2400, 1600],
        "img/foto/Street Photography/6.jpg": [2400, 1600],
        "img/foto/Street Photography/7.jpg": [2400, 1600],
        "img/foto/Street Photography/8.jpg": [2400, 1600],
        "img/foto/Street Photography/9.jpg": [2400, 1600],
        "img/foto/Street Photography/10.jpg": [2400, 1600],
        "img/foto/Street Photography/11.jpg": [2400, 1600],
        "img/foto/Street Photography/12.jpg": [2400, 1600],
        "img/foto/Street%20Photography/1.jpg": [2400, 1600],
        "img/loghi.png": [2480, 2354],
        "img/loghi/email (1).png": [512, 512],
        "img/loghi/footertsapp.png": [128, 128],
        "img/loghi/footertube.png": [128, 128],
        "img/loghi/instafooter.png": [128, 128],
        "img/loghi/instagram.png": [512, 512],
        "img/loghi/whatsapp.png": [512, 512],
        "img/loghi/youtube.png": [512, 512],
        "img/ph/sebisorbX.png": [355, 125],
        "img/ph/sorb.png": [731, 531]
    };

    function applyDimensions() {
        const images = document.querySelectorAll("img[src]");
        images.forEach((img) => {
            if (img.hasAttribute("width") && img.hasAttribute("height")) return;

            const src = img.getAttribute("src");
            const decoded = decodeURIComponent(src);
            const dimsForImg = dims[src] || dims[decoded];

            if (dimsForImg && dimsForImg.length === 2) {
                img.setAttribute("width", dimsForImg[0]);
                img.setAttribute("height", dimsForImg[1]);
            }
        });
        
        // Notify page loader that dimensions are applied
        document.dispatchEvent(new CustomEvent('dimensionsApplied'));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyDimensions);
    } else {
        applyDimensions();
    }
})();
