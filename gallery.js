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

    // Gestione scroll orizzontale SOLO con Shift+rotella (non interferisce con lo scroll verticale)
    function enableWheelScroll(container) {
        container.addEventListener(
            "wheel",
            (e) => {
                if (!e.shiftKey) return;
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            },
            { passive: false }
        );
    }

    // Blocca scroll pagina quando cursore è sulla strip verticale (desktop)
    function preventPageScrollOnStrip() {
        if (isMobileDevice()) return;
        
        const strips = document.querySelectorAll(".gallery-carousel-strip");
        strips.forEach((strip) => {
            strip.addEventListener(
                "wheel",
                (e) => {
                    const atTop = strip.scrollTop === 0;
                    const atBottom = strip.scrollTop + strip.clientHeight >= strip.scrollHeight - 1;
                    
                    // Previeni scroll pagina solo se la strip può ancora scrollare
                    if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
                        e.stopPropagation();
                    }
                },
                { passive: true }
            );
        });
    }

    // ===============================
    // CALCOLA HEADER HEIGHT PER TUTTE LE PAGINE
    // ===============================
    const headerEl = document.querySelector("header");
    const applyHeaderHeightVar = () => {
        if (!headerEl) return;
        const h = headerEl.getBoundingClientRect().height;
        if (h && Number.isFinite(h) && h > 0) {
            document.documentElement.style.setProperty("--header-h", Math.round(h) + "px");
        }
    };
    
    // Calcola subito
    applyHeaderHeightVar();
    
    // Ricalcola se la finestra cambia (resize, orientamento)
    window.addEventListener("resize", applyHeaderHeightVar);

    // ===============================
    // PERSONALE — Header height come CSS var (per snap/scroll-margin/peek)
    // ===============================
    const isPersonalePage = document.documentElement.classList.contains("personale-page");
    const isPanelMenuPage = !!document.getElementById("mobileMenuPanel");
    if (isPanelMenuPage) {

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
    
    // Attiva blocco scroll pagina su strip
    preventPageScrollOnStrip();
    
    if (isStripPage) {
        initialViewportContainers = new Set();
        document.querySelectorAll(".carousel-strip-layout").forEach((container) => {
            const r = container.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) {
                initialViewportContainers.add(container);
                container.classList.add("carousel-animate-pending");
            }
        });
    }

    carousels.forEach((carousel) => {
        enableWheelScroll(carousel);
        setupCarouselPrefetch(carousel);
        const photos = carousel.querySelectorAll(".gallery-photo img");
        const isPersonale = document.documentElement.classList.contains("personale-page");
        const isFoodPage = document.documentElement.classList.contains("food-page");
        
        // Wait for page ready event before showing carousel
        const container = carousel.closest(".gallery-carousel-container");
        if (container) {
            const showCarousel = () => {
                if (container.classList.contains("loaded")) return;

                const waitForImages = (root, done) => {
                    const imgs = Array.from(root.querySelectorAll("img"));
                    if (imgs.length === 0) {
                        done();
                        return;
                    }

                    let remaining = 0;
                    const markDone = () => {
                        remaining -= 1;
                        if (remaining <= 0) done();
                    };

                    imgs.forEach((img) => {
                        if (img.complete && img.naturalWidth > 0) return;
                        remaining += 1;
                        img.addEventListener("load", markDone, { once: true });
                        img.addEventListener("error", markDone, { once: true });
                    });

                    if (remaining === 0) {
                        done();
                    } else {
                        setTimeout(done, 2500);
                    }
                };

                waitForImages(container, () => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            container.classList.add("loaded");
                        });
                    });
                });
            };
            
            // If page is already ready, show immediately
            if (document.documentElement.classList.contains('page-ready')) {
                showCarousel();
            } else {
                // Wait for pageReady event
                document.addEventListener('pageReady', showCarousel, { once: true });
            }
        }
        
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
            const strip = document.querySelector(`.gallery-carousel-strip[data-carousel="${carousel.id}"]`);
            const stripContainer = strip ? strip.closest(".carousel-strip-layout") : null;
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
                    btn.className = "gallery-strip-thumb";
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
                });

                /* Event delegation: un listener sulla strip per tutti i thumbnail */
                strip.addEventListener("click", (e) => {
                    const btn = e.target.closest(".gallery-strip-thumb");
                    if (!btn) return;
                    const index = parseInt(btn.dataset.index, 10);
                    if (isNaN(index) || index < 0 || index >= photoWraps.length) return;
                    const target = photoWraps[index];
                    if (!target) return;
                    /* Scroll carousel per centrare la foto corrispondente */
                    const scrollLeft = target.offsetLeft - (carousel.clientWidth - target.offsetWidth) / 2;
                    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
                    const clamped = Math.max(0, Math.min(scrollLeft, maxScroll));
                    carousel.scrollTo({ left: clamped, behavior: "smooth" });
                });

                strip._lastActiveIndex = -1;
                strip._lastStripWidth = -1;

                // Mostra la strip dopo che le miniature sono state generate
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        strip.classList.add("loaded");
                    });
                });

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
                    if (activeEl && stripWidth > 0) {
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
                    const stripContainerForRo = strip.closest(".carousel-strip-layout");
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
                        const runAnimation = () => {
                            stripContainer.classList.add("animate-initial");
                            requestAnimationFrame(() => {
                                stripContainer.classList.remove("carousel-animate-pending");
                            });
                            
                            /* Cleanup will-change dopo animazione (0.85s carousel + 0.3s delay + 0.45s thumb = ~1.6s). */
                            setTimeout(() => {
                                const wrapper = stripContainer.querySelector(".gallery-carousel-wrapper");
                                if (wrapper) wrapper.style.willChange = "auto";
                                thumbs.forEach((thumb) => {
                                    thumb.style.willChange = "auto";
                                });
                            }, 1800);
                        };

                        if (document.documentElement.classList.contains("page-ready")) {
                            runAnimation();
                        } else {
                            document.addEventListener("pageReady", runAnimation, { once: true });
                        }
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
        const ARROWS_BREAKPOINT = 1024;
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
            const stripCarousels = document.querySelectorAll(".carousel-strip-layout .gallery-carousel");
            
            const carouselsToCheck = Array.from(stripCarousels).filter((c) => {
                const container = c.closest(".carousel-strip-layout");
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
                    document.querySelectorAll(".carousel-strip-layout .gallery-carousel").forEach((c) => {
                        updateCarouselPaddingForCenter(c);
                    });
                });
            }
        }, { once: true });

        /* Resize: gestito da handler unificato più in basso */
        
        /* Resize handler unificato: gestisce header height, padding update e carousel reinit */
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                /* 1. Header height var update (se su pagina Personale) */
                if (isPanelMenuPage) {
                    applyHeaderHeightVar();
                }
                
                /* 2. Padding update per strip layout */
                const isStripLayoutPage = document.documentElement.classList.contains("personale-page") || document.documentElement.classList.contains("food-page") || document.documentElement.classList.contains("product-page");
                if (isStripLayoutPage) {
                    requestAnimationFrame(() => {
                        document.querySelectorAll(".carousel-strip-layout .gallery-carousel").forEach((c) => updateCarouselPaddingForCenter(c));
                    });
                }
                
                /* 3. Carousel reinit se cambio desktop/mobile */
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
});
