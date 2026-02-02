// ===============================
// GALLERY — CAROSELLO (no lightbox)
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    // Trova tutti i caroselli
    const carousels = document.querySelectorAll(".gallery-carousel");
    const hasGalleryUI = carousels.length > 0;

    // Verifica se è mobile (funzione per verificare dinamicamente)
    function isMobileDevice() {
        return window.innerWidth < 1024;
    }

    // ===============================
    // PERSONALE — Header height come CSS var (per snap/scroll-margin/peek)
    // ===============================
    const isPersonalePage = document.documentElement.classList.contains("personale-page");
    const isPanelMenuPage = !!document.getElementById("mobileMenuPanel");
    if (isPanelMenuPage) {
        const headerEl = document.querySelector("header");
        const applyHeaderHeightVar = () => {
            if (!headerEl) return;
            const h = headerEl.getBoundingClientRect().height;
            if (h && Number.isFinite(h)) {
                document.documentElement.style.setProperty("--header-h", Math.round(h) + "px");
            }
        };
        applyHeaderHeightVar();
        let headerResizeT;
        window.addEventListener(
            "resize",
            () => {
                clearTimeout(headerResizeT);
                headerResizeT = setTimeout(applyHeaderHeightVar, 150);
            },
            { passive: true }
        );

        // Scrollbar overlay custom (stile pill) — solo desktop (su mobile può risultare invasiva)
        if (!isMobileDevice()) {
            const scrollbarEl = document.createElement("div");
            scrollbarEl.className = "personale-scrollbar";
            scrollbarEl.setAttribute("aria-hidden", "true");
            const thumbEl = document.createElement("div");
            thumbEl.className = "personale-scrollbar-thumb";
            scrollbarEl.appendChild(thumbEl);
            document.body.appendChild(scrollbarEl);

            const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
            const getMaxScroll = () =>
                Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

            // Scrollbar: sincronizzata con scroll nativo
            const getScrollY = () => window.scrollY;
            const setScrollY = (y) => window.scrollTo(0, y);

            function updateThumb() {
                const maxScroll = getMaxScroll();
                if (maxScroll <= 1) {
                    scrollbarEl.style.display = "none";
                    return;
                }
                scrollbarEl.style.display = "";
                const trackH = scrollbarEl.getBoundingClientRect().height;
                const ratio = window.innerHeight / (document.documentElement.scrollHeight || 1);
                const thumbH = clamp(Math.round(trackH * ratio), 40, Math.max(40, trackH));
                const scrollY = getScrollY();
                const y = (scrollY / maxScroll) * (trackH - thumbH);
                thumbEl.style.height = thumbH + "px";
                thumbEl.style.top = Math.round(y) + "px";
            }

            let raf = 0;
            const scheduleUpdate = () => {
                if (raf) return;
                raf = requestAnimationFrame(() => {
                    raf = 0;
                    updateThumb();
                });
            };
            window.addEventListener("scroll", scheduleUpdate, { passive: true });
            window.addEventListener("resize", scheduleUpdate, { passive: true });
            updateThumb();
            requestAnimationFrame(updateThumb);
            window.addEventListener("load", updateThumb, { once: true });

            // Drag thumb
            let dragging = false;
            let dragOffsetY = 0;
            thumbEl.addEventListener("pointerdown", (e) => {
                dragging = true;
                thumbEl.setPointerCapture(e.pointerId);
                const thumbRect = thumbEl.getBoundingClientRect();
                dragOffsetY = e.clientY - thumbRect.top;
                e.preventDefault();
            });
            thumbEl.addEventListener("pointermove", (e) => {
                if (!dragging) return;
                const trackRect = scrollbarEl.getBoundingClientRect();
                const thumbH = thumbEl.getBoundingClientRect().height;
                const maxScroll = getMaxScroll();
                const trackMax = Math.max(1, trackRect.height - thumbH);
                const y = clamp(e.clientY - trackRect.top - dragOffsetY, 0, trackMax);
                const targetScroll = (y / trackMax) * maxScroll;
                setScrollY(targetScroll);
            });
            const endDrag = () => {
                dragging = false;
            };
            thumbEl.addEventListener("pointerup", endDrag);
            thumbEl.addEventListener("pointercancel", endDrag);
        }

    }

    // ===============================
    // PREFETCH IMMAGINI (per caroselli orizzontali + loading="lazy")
    // Su mobile, i browser spesso caricano le immagini "lazy" solo dopo swipe (offscreen in orizzontale).
    // Prefetch leggero: prime N subito, resto on-idle / al primo touch.
    // ===============================
    function runIdle(cb, timeout = 1200) {
        if ("requestIdleCallback" in window) {
            window.requestIdleCallback(cb, { timeout });
        } else {
            setTimeout(cb, 150);
        }
    }

    function prefetchImages(imgEls, limit) {
        const imgs = Array.from(imgEls).slice(0, limit);
        imgs.forEach((img) => {
            const src = img.currentSrc || img.getAttribute("src");
            if (!src) return;
            const pre = new Image();
            pre.decoding = "async";
            pre.src = src;
        });
    }

    function setupCarouselPrefetch(carousel) {
        const imgs = carousel.querySelectorAll("img");
        runIdle(() => prefetchImages(imgs, 4));

        // Al primo tocco/swipe, prefetch più aggressivo (una sola volta: touch e pointer possono fire entrambi)
        let prefetchDone = false;
        const onFirstInteraction = () => {
            if (prefetchDone) return;
            prefetchDone = true;
            runIdle(() => prefetchImages(imgs, 15));
        };
        carousel.addEventListener("touchstart", onFirstInteraction, { passive: true, once: true });
        carousel.addEventListener("pointerdown", onFirstInteraction, { passive: true, once: true });
    }

    const isStripPage = isPersonalePage || document.documentElement.classList.contains("food-page") || document.documentElement.classList.contains("product-page");
    let initialViewportContainers = null;
    const layoutReadyCallbacks = []; /* Callback da eseguire quando layout (padding/margin) è pronto */
    let layoutIsReady = false;
    let allowPaddingUpdates = !isStripPage; /* Strip pages: blocca padding finché immagini non sono pronte. */
    
    if (isStripPage) {
        initialViewportContainers = new Set();
        document.querySelectorAll(".personale-carousel-container").forEach((container) => {
            const r = container.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) {
                initialViewportContainers.add(container);
                container.classList.add("personale-animate-pending");
            }
        });
    }

    carousels.forEach((carousel) => {
        setupCarouselPrefetch(carousel);
        const photos = carousel.querySelectorAll(".gallery-photo img");
        const isPersonale = document.documentElement.classList.contains("personale-page");
        const isFoodPage = document.documentElement.classList.contains("food-page");
        
        let initialScrollLeft = carousel.scrollLeft;
        let hasScrolled = false;
        let lastPhotoIndex = 0;
        
        // ===============================
        // HAPTIC FEEDBACK (più robusto)
        // - iOS Safari: niente vibrate => non possiamo farlo funzionare lì.
        // - alcuni browser “ignorano” vibrate durante scroll continuo: usiamo scroll-stop / touchend.
        // ===============================
        function tryVibrate(ms = 10) {
            if (!navigator.vibrate) return;
            try { navigator.vibrate(ms); } catch (_) {}
        }

        let hapticScrollStopTimer = null;
        carousel.addEventListener("scroll", () => {
            const currentScrollLeft = carousel.scrollLeft;
            const scrollDelta = Math.abs(currentScrollLeft - initialScrollLeft);
            
            // Haptic “scroll-stop”: vibra quando lo scroll si ferma e la foto “centrata” cambia
            if (isMobileDevice()) {
                clearTimeout(hapticScrollStopTimer);
                hapticScrollStopTimer = setTimeout(() => {
                    const idx = getClosestPhotoIndex(carousel);
                    if (idx !== -1 && idx !== lastPhotoIndex) {
                        lastPhotoIndex = idx;
                        tryVibrate(10);
                    }
                }, 90);
            }
            
            // Solo se lo scroll è significativo (più di 50px) - uno swipe reale
            if (scrollDelta > 50 && !hasScrolled) {
                hasScrolled = true;
            }
        }, { passive: true });

        // Fallback su gesture (più affidabile come “user activation”)
        carousel.addEventListener("touchend", () => {
            if (!isMobileDevice()) return;
            const idx = getClosestPhotoIndex(carousel);
            if (idx !== -1 && idx !== lastPhotoIndex) {
                lastPhotoIndex = idx;
                tryVibrate(10);
            }
        }, { passive: true });

        photos.forEach((img) => {
            // Nessun lightbox: evita rettangolo blu al tap/click
            img.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Personale / Food / Product: strip (miniature) — init solo quando il container è in viewport (IntersectionObserver). Stesse regole animazione per tutti i caroselli.
        if (isStripPage && carousel.id) {
            const strip = document.querySelector(`.personale-carousel-strip[data-carousel="${carousel.id}"]`);
            const stripContainer = strip ? strip.closest(".personale-carousel-container") : null;
            if (!strip || !stripContainer || strip.dataset.init === "1") return;

            const buildStrip = () => {
                if (strip.dataset.init === "1") return;
                strip.dataset.init = "1";
                strip.innerHTML = "";
                const photoWraps = Array.from(carousel.querySelectorAll(".gallery-photo"));
                const thumbs = [];

                photoWraps.forEach((wrap, i) => {
                    const imgEl = wrap.querySelector("img");
                    const src = imgEl ? (imgEl.getAttribute("src") || imgEl.currentSrc || "") : "";
                    if (!src) return;
                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "personale-strip-thumb";
                    btn.dataset.index = String(i);
                    btn.setAttribute("aria-label", "Vai all'immagine " + (i + 1));
                    const tImg = document.createElement("img");
                    tImg.alt = "";
                    tImg.decoding = "async";
                    /* Eager: su mobile lazy lascia 1–2 miniature vuote fino allo swipe */
                    tImg.loading = "eager";
                    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
                        tImg.src = imgEl.currentSrc || src;
                    } else {
                        tImg.src = src;
                    }
                    btn.appendChild(tImg);
                    strip.appendChild(btn);
                    thumbs.push(btn);

                    btn.addEventListener("click", () => {
                        const target = photoWraps[i];
                        if (!target) return;
                        /* Scroll carousel per centrare la foto corrispondente */
                        const scrollLeft = target.offsetLeft - (carousel.clientWidth - target.offsetWidth) / 2;
                        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
                        const clamped = Math.max(0, Math.min(scrollLeft, maxScroll));
                        carousel.scrollTo({ left: clamped, behavior: "smooth" });
                    });
                });

                strip._lastActiveIndex = -1;
                strip._lastStripWidth = -1;

                const setActiveThumb = (idx) => {
                    if (!thumbs.length) return;
                    /* Larghezza visibile: strip (scroll container) o viewport genitore */
                    const viewport = strip.parentElement;
                    const stripWidth = strip.clientWidth || (viewport && viewport.clientWidth) || 0;
                    if (strip._lastActiveIndex === idx && strip._lastStripWidth === stripWidth) return;
                    strip._lastActiveIndex = idx;
                    strip._lastStripWidth = stripWidth;

                    thumbs.forEach((t, i) => {
                        t.classList.toggle("active", i === idx);
                    });

                    /* Su desktop tutte le thumb sono visibili: non centrare la thumb attiva con scroll */
                    const activeEl = thumbs[idx];
                    if (isMobileDevice() && activeEl && stripWidth > 0) {
                        const stripRect = strip.getBoundingClientRect();
                        const thumbRect = activeEl.getBoundingClientRect();
                        const stripCenter = stripRect.left + stripRect.width / 2;
                        const thumbCenter = thumbRect.left + thumbRect.width / 2;
                        const delta = thumbCenter - stripCenter;
                        const newScrollLeft = strip.scrollLeft + delta;
                        const maxScroll = Math.max(0, strip.scrollWidth - stripWidth);
                        const clamped = Math.max(0, Math.min(newScrollLeft, maxScroll));
                        strip.scrollTo({ left: clamped, behavior: "smooth" });
                    }
                };

                // aggiorna active thumb quando cambia la foto “centrata” (al più una volta per frame)
                const updateFromCarousel = () => {
                    const idx = getClosestPhotoIndex(carousel);
                    if (idx !== -1) setActiveThumb(idx);
                };
                let updateFromCarouselRaf = 0;
                const scheduleUpdateFromCarousel = () => {
                    if (updateFromCarouselRaf) return;
                    updateFromCarouselRaf = requestAnimationFrame(() => {
                        updateFromCarouselRaf = 0;
                        updateFromCarousel();
                    });
                };
                scheduleUpdateFromCarousel();
                setTimeout(updateFromCarousel, 350);
                if (typeof ResizeObserver !== "undefined") {
                    const ro = new ResizeObserver(scheduleUpdateFromCarousel);
                    ro.observe(strip);
                    const stripContainerForRo = strip.closest(".personale-carousel-container");
                    if (stripContainerForRo && stripContainerForRo !== strip) ro.observe(stripContainerForRo);
                }
                carousel.addEventListener("scroll", scheduleUpdateFromCarousel, { passive: true });
                window.addEventListener("resize", scheduleUpdateFromCarousel, { passive: true });

                if (initialViewportContainers && initialViewportContainers.has(stripContainer)) {
                    thumbs.forEach((btn, i) => {
                        btn.style.setProperty("--thumb-delay", `${1 + i * 0.2}s`);
                    });
                    const isDesktop = window.innerWidth >= 1024;
                    if (!isDesktop) {
                        const initialIdx = getClosestPhotoIndex(carousel);
                        const visibleCount = Math.min(5, thumbs.length);
                        const half = Math.floor(visibleCount / 2);
                        let start = initialIdx >= 0 ? initialIdx - half : 0;
                        if (start < 0) start = 0;
                        if (start > thumbs.length - visibleCount) start = Math.max(0, thumbs.length - visibleCount);
                        const end = start + visibleCount - 1;
                        thumbs.forEach((btn, i) => {
                            if (i < start || i > end) btn.classList.add("no-entrance-animation");
                        });
                    }
                    
                    /* Attendi che il layout (padding/margin) sia pronto prima di far partire l'animazione. */
                    const startAnimation = () => {
                        stripContainer.classList.add("animate-initial");
                        requestAnimationFrame(() => {
                            stripContainer.classList.remove("personale-animate-pending");
                        });
                        
                        /* Cleanup will-change dopo animazione (1.25s carousel + ritardo massimo thumb ~1s + 0.55s thumb = ~3s). */
                        setTimeout(() => {
                            const wrapper = stripContainer.querySelector(".gallery-carousel-wrapper");
                            if (wrapper) wrapper.style.willChange = "auto";
                            thumbs.forEach((thumb) => {
                                thumb.style.willChange = "auto";
                            });
                        }, 3200);
                    };
                    
                    if (layoutIsReady) {
                        startAnimation();
                    } else {
                        layoutReadyCallbacks.push(startAnimation);
                    }
                }
            };

            const io = new IntersectionObserver(
                (entries) => {
                    const e = entries[0];
                    if (e && e.isIntersecting) {
                        buildStrip();
                        io.disconnect();
                    }
                },
                { root: null, rootMargin: "100px 0px", threshold: 0 }
            );
            io.observe(stripContainer);
        }
    });

    // ===============================
    // NAVIGAZIONE CAROSELLO CON FRECCE (DESKTOP)
    // ===============================
    if (carousels.length > 0) {
        function getClosestPhotoIndex(carousel) {
            const photos = carousel.querySelectorAll(".gallery-photo");
            if (!photos.length) return -1;
            const carouselRect = carousel.getBoundingClientRect();
            const center = carouselRect.left + carouselRect.width / 2;
            let closest = -1;
            let minDist = Infinity;
            photos.forEach((el, i) => {
                const r = el.getBoundingClientRect();
                const photoCenter = r.left + r.width / 2;
                const d = Math.abs(photoCenter - center);
                if (d < minDist) {
                    minDist = d;
                    closest = i;
                }
            });
            return closest;
        }

        function scrollToCenterPhoto(carousel, index) {
            const photos = carousel.querySelectorAll(".gallery-photo");
            if (index < 0 || index >= photos.length) return;
            const photo = photos[index];
            const scrollLeft = photo.offsetLeft - (carousel.clientWidth - photo.offsetWidth) / 2;
            const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
            const clamped = Math.max(0, Math.min(scrollLeft, maxScroll));
            carousel.scrollTo({ left: clamped, behavior: "smooth" });
        }

        /** Personale / Food / Product: centra prima e ultima foto. Desktop = padding sul carousel; mobile = margin su primo/ultimo .gallery-photo (i box restano aderenti all'immagine). */
        function updateCarouselPaddingForCenter(carousel) {
            const isStripLayout = document.documentElement.classList.contains("personale-page") || document.documentElement.classList.contains("food-page") || document.documentElement.classList.contains("product-page");
            if (!isStripLayout) {
                carousel.style.paddingLeft = "";
                carousel.style.paddingRight = "";
                carousel.querySelectorAll(".gallery-photo").forEach((el) => {
                    el.style.marginLeft = "";
                    el.style.marginRight = "";
                });
                return;
            }
            
            /* LOCK: non applicare padding/margin finché il sistema di attesa immagini non dà il via libera. */
            if (!allowPaddingUpdates) {
                return;
            }
            const photos = carousel.querySelectorAll(".gallery-photo");
            if (photos.length < 2) return;
            const first = photos[0];
            const last = photos[photos.length - 1];
            const cw = carousel.clientWidth;
            if (cw <= 0) return; /* carousel non ancora misurato (layout non pronto) */
            const pl = Math.max(0, (cw - first.offsetWidth) / 2);
            const pr = Math.max(0, (cw - last.offsetWidth) / 2);
            const isDesktop = window.innerWidth >= 1024;

            if (isDesktop) {
                carousel.style.paddingLeft = pl + "px";
                carousel.style.paddingRight = pr + "px";
                first.style.marginLeft = "";
                last.style.marginRight = "";
            } else {
                carousel.style.paddingLeft = "";
                carousel.style.paddingRight = "";
                first.style.marginLeft = pl + "px";
                last.style.marginRight = pr + "px";
            }
        }

        function initCarouselNavigation(carouselId) {
            const carousel = document.getElementById(carouselId);
            if (!carousel) return;

            // Evita listener duplicati (init viene chiamata anche su resize)
            if (carousel.dataset.navInitialized === "true") return;
            carousel.dataset.navInitialized = "true";
            
            const prevBtn = document.querySelector(`.gallery-nav-prev[data-carousel="${carouselId}"]`);
            const nextBtn = document.querySelector(`.gallery-nav-next[data-carousel="${carouselId}"]`);
            
            if (!prevBtn || !nextBtn) return;
            
            // Mostra/nascondi frecce: in base alla foto centrata (così si può centrare prima e ultima)
            function updateArrows() {
                const photos = carousel.querySelectorAll(".gallery-photo");
                if (photos.length <= 1) {
                    prevBtn.style.display = "none";
                    nextBtn.style.display = "none";
                    return;
                }
                const idx = getClosestPhotoIndex(carousel);
                prevBtn.style.display = idx <= 0 ? "none" : "flex";
                nextBtn.style.display = idx >= photos.length - 1 ? "none" : "flex";
            }
            
            // Frecce: centra la foto successiva/precedente nel carousel
            nextBtn.addEventListener('click', () => {
                const idx = getClosestPhotoIndex(carousel);
                scrollToCenterPhoto(carousel, idx + 1);
            });
            
            prevBtn.addEventListener('click', () => {
                const idx = getClosestPhotoIndex(carousel);
                scrollToCenterPhoto(carousel, idx - 1);
            });
            
            carousel.addEventListener('scroll', updateArrows, { passive: true });

            /* Centramento prima/ultima foto: gestito dal sistema centrale di layout (attesa immagini + load/resize). */
            /* Inizializza scroll e frecce senza toccare padding (evita layout shift prima che immagini siano pronte). */
            requestAnimationFrame(() => {
                carousel.scrollLeft = 0;
                updateArrows();
            });
        }
        
        function resetCarouselsScroll() {
            const allCarousels = document.querySelectorAll('.gallery-carousel');
            allCarousels.forEach(carousel => { carousel.scrollLeft = 0; });
        }
        
        /* Frecce carosello solo da 1280px (nascoste su tablet portrait) */
        const ARROWS_BREAKPOINT = 1280;
        function initAllCarousels() {
            if (window.innerWidth >= ARROWS_BREAKPOINT) {
                const navPrevButtons = document.querySelectorAll('.gallery-nav-prev[data-carousel]');
                const carouselIds = [...new Set(Array.from(navPrevButtons).map((btn) => btn.dataset.carousel).filter(Boolean))];
                carouselIds.forEach((id) => initCarouselNavigation(id));
            }
        }
        
        const initialIsDesktop = window.innerWidth >= ARROWS_BREAKPOINT;
        let lastIsDesktop = initialIsDesktop;

        resetCarouselsScroll();
        initAllCarousels();

        /* Opzione A: attendi immagini → applica padding/margin → triggera animazioni. */
        const hasStripLayoutNow = document.documentElement.classList.contains("personale-page") || document.documentElement.classList.contains("food-page") || document.documentElement.classList.contains("product-page");
        if (hasStripLayoutNow) {
            const stripCarousels = document.querySelectorAll(".personale-carousel-container .gallery-carousel");
            
            const carouselsToCheck = Array.from(stripCarousels).filter((c) => {
                const container = c.closest(".personale-carousel-container");
                return initialViewportContainers && initialViewportContainers.has(container);
            });
            
            const markLayoutReady = () => {
                /* Sblocca padding, applica padding/margin, triggera animazioni. */
                if (layoutIsReady) return; /* Previeni doppia esecuzione (race tra checkAllLoaded e timeout). */
                
                layoutIsReady = true;
                allowPaddingUpdates = true;
                
                requestAnimationFrame(() => {
                    stripCarousels.forEach((c) => updateCarouselPaddingForCenter(c));
                    
                    /* Triggera tutte le animazioni in attesa (dopo che padding è applicato). */
                    requestAnimationFrame(() => {
                        layoutReadyCallbacks.forEach((cb) => cb());
                        layoutReadyCallbacks.length = 0;
                    });
                });
            };
            
            if (carouselsToCheck.length === 0) {
                markLayoutReady();
            } else {
                const imagesToWait = [];
                carouselsToCheck.forEach((carousel) => {
                    const photos = carousel.querySelectorAll(".gallery-photo");
                    if (photos.length >= 1) {
                        const firstImg = photos[0].querySelector("img");
                        const lastImg = photos[photos.length - 1].querySelector("img");
                        if (firstImg) imagesToWait.push(firstImg);
                        if (lastImg && lastImg !== firstImg) imagesToWait.push(lastImg);
                    }
                });
                
                if (imagesToWait.length === 0) {
                    markLayoutReady();
                } else {
                    let loadedCount = 0;
                    const totalToWait = imagesToWait.length;
                    const checkAllLoaded = () => {
                        loadedCount++;
                        if (loadedCount >= totalToWait) {
                            markLayoutReady();
                        }
                    };
                    
                    imagesToWait.forEach((img) => {
                        if (img.complete && img.naturalWidth > 0) {
                            checkAllLoaded();
                        } else {
                            img.addEventListener("load", checkAllLoaded, { once: true });
                            img.addEventListener("error", checkAllLoaded, { once: true });
                        }
                    });
                    
                    /* Timeout sicurezza: 2.5s. */
                    setTimeout(markLayoutReady, 2500);
                }
            }
        }

        window.addEventListener('load', () => {
            resetCarouselsScroll();
            const hasStripLayout = document.documentElement.classList.contains("personale-page") || document.documentElement.classList.contains("food-page") || document.documentElement.classList.contains("product-page");
            if (hasStripLayout) {
                /* Al load: ricalcola padding/margin (immagini definitive) e assicurati che animazione sia attiva. */
                requestAnimationFrame(() => {
                    document.querySelectorAll(".personale-carousel-container .gallery-carousel").forEach((c) => {
                        updateCarouselPaddingForCenter(c);
                    });
                });
            }
        }, { once: true });

        /* Resize: aggiorna padding centramento per tutti i carousel strip (desktop e mobile). */
        (function () {
            const isStripLayoutPage = () => document.documentElement.classList.contains("personale-page") || document.documentElement.classList.contains("food-page") || document.documentElement.classList.contains("product-page");
            let paddingResizeT;
            window.addEventListener("resize", () => {
                if (!isStripLayoutPage()) return;
                clearTimeout(paddingResizeT);
                paddingResizeT = setTimeout(() => {
                    requestAnimationFrame(() => {
                        document.querySelectorAll(".personale-carousel-container .gallery-carousel").forEach((c) => updateCarouselPaddingForCenter(c));
                    });
                }, 280);
            });
        })();
        
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const nowIsDesktop = window.innerWidth >= ARROWS_BREAKPOINT;
                if (nowIsDesktop !== lastIsDesktop) {
                    lastIsDesktop = nowIsDesktop;
                    resetCarouselsScroll();
                    initAllCarousels();
                }
            }, 250);
        });
    }

    // ===============================
    // PERSONALE — Un carosello verticale per categoria + strip miniature (senza scrollbar)
    // ===============================
    // Scroll nativo pagina + strip sticky: stato attivo gestito con IntersectionObserver
    const personaleStateByWrap = new WeakMap();
    const personaleWraps = document.querySelectorAll(".personale-carousel-wrap");
    if (personaleWraps.length > 0) {
    personaleWraps.forEach((wrap) => {
        const carousel = wrap.querySelector(".personale-carousel-vertical");
        const stripEl = wrap.querySelector(".personale-strip");
        if (!carousel || !stripEl) return;

        // Evita doppie inizializzazioni (es. script incluso due volte / navigazione dinamica)
        if (wrap.dataset.personaleInit === "1") return;
        wrap.dataset.personaleInit = "1";
        stripEl.innerHTML = "";

        const items = Array.from(carousel.querySelectorAll(".personale-carousel-item"));
        if (!items.length) return;

        // Wrap immagini in un frame per centratura stabile (portrait/landscape)
        const srcs = items.map((item) => {
            const img = item.querySelector("img");
            if (!img) return "";
            const src = img.getAttribute("src") || img.currentSrc || "";
            // Evita double-wrapping
            if (!img.parentElement || !img.parentElement.classList.contains("personale-photo-frame")) {
                const frame = document.createElement("div");
                frame.className = "personale-photo-frame";
                img.parentElement && img.parentElement.insertBefore(frame, img);
                frame.appendChild(img);
            }
            return src;
        });

        items.forEach((item, index) => {
            const src = srcs[index];
            if (!src) return;
            const imgEl = item.querySelector("img");
            const alt = imgEl ? (imgEl.getAttribute("alt") || "") : "";
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "personale-strip-thumb";
            btn.dataset.index = String(index);
            btn.setAttribute("aria-label", "Vai all'immagine " + (index + 1) + (alt ? ": " + alt : ""));
            const thumbImg = document.createElement("img");
            thumbImg.src = src;
            thumbImg.alt = "";
            thumbImg.loading = "lazy";
            thumbImg.decoding = "async";
            btn.appendChild(thumbImg);
            stripEl.appendChild(btn);

            btn.addEventListener("click", () => {
                item.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });

        let activeIndex = -1;
        const thumbs = stripEl.querySelectorAll(".personale-strip-thumb");

        function setStates(idx) {
            items.forEach((it) => it.classList.remove("is-active"));
            if (idx >= 0 && idx < items.length) items[idx].classList.add("is-active");
        }

        // Stato iniziale
        activeIndex = 0;
        wrap.dataset.personaleActiveIndex = "0";
        personaleStateByWrap.set(wrap, { items, activeIndex: 0 });
        thumbs.forEach((t, i) => t.classList.toggle("active", i === 0));
        setStates(0);

        // Observer: attivo quando una foto entra nella “zona lettura” (centro-alto viewport)
        const observerOptions = isMobileDevice()
            ? { root: null, rootMargin: "-40% 0px -40% 0px", threshold: 0 }
            : { root: null, rootMargin: "-15% 0px -70% 0px", threshold: 0 };
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const idx = items.indexOf(entry.target);
                    if (idx === -1 || idx === activeIndex) return;
                    activeIndex = idx;
                    wrap.dataset.personaleActiveIndex = String(idx);
                    const state = personaleStateByWrap.get(wrap);
                    if (state) state.activeIndex = idx;
                    thumbs.forEach((t, i) => t.classList.toggle("active", i === idx));
                    setStates(idx);
                });
            },
            observerOptions
        );
        items.forEach((el) => observer.observe(el));
    });

    // PERSONALE — Scroll “a step” tipo carosello (solo desktop)
    if (isPersonalePage) {
        let wheelAcc = 0;
        let lastWrap = null;
        let lockUntil = 0;
        const WHEEL_THRESHOLD_PX = 48; // sensibilità: più alto = meno “scatti”
        const LOCK_MS = 520; // evita salti multipli su trackpad/inertia

        const toPixels = (e) => {
            // deltaMode: 0=pixel, 1=line, 2=page
            if (e.deltaMode === 1) return e.deltaY * 16;
            if (e.deltaMode === 2) return e.deltaY * window.innerHeight;
            return e.deltaY;
        };

        window.addEventListener(
            "wheel",
            (e) => {
                if (isMobileDevice()) return;
                if (e.ctrlKey || e.metaKey) return; // pinch-zoom / gesture

                const targetEl = e.target instanceof Element ? e.target : null;
                if (!targetEl) return;
                const wrap = targetEl.closest(".personale-carousel-wrap");
                if (!wrap) return; // fuori dalle serie: scroll normale pagina
                if (wrap !== lastWrap) {
                    lastWrap = wrap;
                    wheelAcc = 0;
                }

                const state = personaleStateByWrap.get(wrap);
                const items = state?.items;
                if (!items || items.length < 2) return;

                const now = performance.now();
                if (now < lockUntil) {
                    e.preventDefault();
                    return;
                }

                const dy = toPixels(e);
                // Se siamo ai bordi e l'utente vuole uscire dalla serie (verso sopra/sotto),
                // lasciamo lo scroll nativo della pagina (così arrivi alla prossima sezione).
                const idxNow = state?.activeIndex ?? (parseInt(wrap.dataset.personaleActiveIndex || "0", 10) || 0);
                if ((idxNow <= 0 && dy < 0) || (idxNow >= items.length - 1 && dy > 0)) {
                    wheelAcc = 0;
                    return;
                }
                wheelAcc += dy;

                if (Math.abs(wheelAcc) < WHEEL_THRESHOLD_PX) {
                    // Blocca lo scroll “libero” mentre accumuliamo gesto
                    e.preventDefault();
                    return;
                }

                const dir = wheelAcc > 0 ? 1 : -1;
                wheelAcc = 0;

                const idx = state?.activeIndex ?? (parseInt(wrap.dataset.personaleActiveIndex || "0", 10) || 0);
                const next = Math.max(0, Math.min(items.length - 1, idx + dir));
                if (next === idx) {
                    // ai bordi: lasciamo lo scroll pagina (non “incolliamo” l'utente)
                    return;
                }

                lockUntil = now + LOCK_MS;
                e.preventDefault();
                items[next].scrollIntoView({ behavior: "smooth", block: "start" });
            },
            { passive: false }
        );
    }
    }

    // Nota: su Personale lo scroll è nativo della pagina.

});