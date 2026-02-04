/**
 * Menu a pannello: attivo su tutte le pagine che hanno #mobileMenuPanel.
 * Mobile = hamburger + pannello; desktop = LAVORI apre lo stesso pannello (CONTATTI nel panel solo mobile).
 */
(function () {
    var hasPanel = document.getElementById("mobileMenuPanel");
    if (!hasPanel) return;

    const toggle = document.querySelector(".mobile-menu-toggle");
    const lavoriBtn = document.querySelector(".header-lavori");
    const panel = document.getElementById("mobileMenuPanel");
    if (!panel) return;

    function isMobile() {
        return window.innerWidth < 1024;
    }

    function openMenu() {
        if (toggle) {
            toggle.setAttribute("aria-expanded", "true");
            toggle.setAttribute("aria-label", "Chiudi menu");
        }
        if (lavoriBtn) {
            lavoriBtn.setAttribute("aria-expanded", "true");
            lavoriBtn.setAttribute("aria-label", "Chiudi menu Lavori");
        }
        panel.setAttribute("aria-hidden", "false");
        panel.classList.add("is-open");
        document.body.classList.add("mobile-menu-open");
        // Focus primo link per accessibilità (tastiera / screen reader)
        var firstLink = panel.querySelector(".mobile-menu-link");
        if (firstLink) {
            requestAnimationFrame(function () {
                firstLink.focus({ preventScroll: true });
            });
        }
    }

    function closeMenu(focusOpener) {
        if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Apri menu");
        }
        if (lavoriBtn) {
            lavoriBtn.setAttribute("aria-expanded", "false");
            lavoriBtn.setAttribute("aria-label", "Apri menu Lavori");
        }
        panel.setAttribute("aria-hidden", "true");
        panel.classList.remove("is-open");
        document.body.classList.remove("mobile-menu-open");
        if (focusOpener) {
            var activeEl = document.activeElement;
            if (panel.contains(activeEl)) {
                if (isMobile() && toggle) toggle.focus();
                else if (!isMobile() && lavoriBtn) lavoriBtn.focus();
            }
        }
    }

    function toggleMenuFromMobile() {
        if (!isMobile()) return;
        if (panel.classList.contains("is-open")) closeMenu();
        else openMenu();
    }

    function toggleMenuFromDesktop() {
        if (isMobile()) return;
        if (panel.classList.contains("is-open")) closeMenu();
        else openMenu();
    }

    if (toggle) {
        toggle.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenuFromMobile();
        });
    }

    if (lavoriBtn) {
        lavoriBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            // Toggle menù su entrambi mobile e desktop
            if (panel.classList.contains("is-open")) closeMenu();
            else openMenu();
        });
    }

    panel.querySelectorAll(".mobile-menu-link").forEach(function (link) {
        link.addEventListener("click", function () {
            closeMenu(true);
        });
    });

    document.addEventListener("click", function (e) {
        if (!panel.classList.contains("is-open")) return;
        var inToggle = toggle && toggle.contains(e.target);
        var inLavori = lavoriBtn && lavoriBtn.contains(e.target);
        var inPanel = panel.contains(e.target);
        if (!inToggle && !inLavori && !inPanel) closeMenu(false);
    });

    window.addEventListener("resize", function () {
        if (!isMobile()) closeMenu(false);
    });

    window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && panel.classList.contains("is-open")) closeMenu(true);
    });
})();
