// MENU PANEL MOBILE + DESKTOP
(function () {
    const panel = document.getElementById("mobileMenuPanel");
    if (!panel) return;

    const toggle = document.querySelector(".mobile-menu-toggle");
    const lavoriBtn = document.querySelector(".header-lavori");

    function isMobile() {
        return window.innerWidth < 1024;
    }

    function openMenu() {
        if (toggle) toggle.setAttribute("aria-expanded", "true");
        if (lavoriBtn) lavoriBtn.setAttribute("aria-expanded", "true");
        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");
        document.body.classList.add("mobile-menu-open");

        const firstLink = panel.querySelector(".mobile-menu-link");
        if (firstLink) firstLink.focus({ preventScroll: true });
    }

    function closeMenu(focusOpener = false) {
        if (toggle) toggle.setAttribute("aria-expanded", "false");
        if (lavoriBtn) lavoriBtn.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
        document.body.classList.remove("mobile-menu-open");

        if (focusOpener) {
            if (isMobile() && toggle) toggle.focus();
            else if (!isMobile() && lavoriBtn) lavoriBtn.focus();
        }
    }

    if (toggle) {
        toggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            panel.classList.contains("is-open") ? closeMenu() : openMenu();
        });
    }

    if (lavoriBtn) {
        lavoriBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            panel.classList.contains("is-open") ? closeMenu() : openMenu();
        });
    }

    panel.querySelectorAll(".mobile-menu-link").forEach(link => {
        link.addEventListener("click", () => closeMenu(true));
    });

    document.addEventListener("click", (e) => {
        if (!panel.classList.contains("is-open")) return;
        if (!toggle?.contains(e.target) && !lavoriBtn?.contains(e.target) && !panel.contains(e.target)) {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (!isMobile()) closeMenu();
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && panel.classList.contains("is-open")) closeMenu(true);
    });
})();