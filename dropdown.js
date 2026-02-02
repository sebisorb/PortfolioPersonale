// DROPDOWN MENU + COPY EMAIL + BACKLIGHT
document.addEventListener("DOMContentLoaded", () => {
    const dropdownToggles = document.querySelectorAll(".bottone-dropdown");
    const emailAddress = "sebisorbll@gmail.com";

    function isMobile() {
        return window.innerWidth < 1024;
    }

    dropdownToggles.forEach(toggle => {
        const menu = toggle.querySelector(".bottone-dropdown-menu");
        if (!menu) return;

        toggle.addEventListener("click", e => {
            if (e.target.closest("a") || !isMobile()) return;
            e.preventDefault();
            e.stopPropagation();

            document.querySelectorAll(".bottone-dropdown-menu.is-open").forEach(m => {
                if (m !== menu) m.classList.remove("is-open");
            });

            menu.classList.toggle("is-open");
        });

        menu.addEventListener("click", e => {
            if (e.target.closest("a")) {
                setTimeout(() => menu.classList.remove("is-open"), 100);
            }
        });
    });

    document.addEventListener("click", e => {
        if (!isMobile() || e.target.closest(".bottone-dropdown")) return;
        document.querySelectorAll(".bottone-dropdown-menu.is-open").forEach(m => m.classList.remove("is-open"));
    });

    window.addEventListener("resize", () => {
        if (!isMobile()) {
            document.querySelectorAll(".bottone-dropdown-menu.is-open").forEach(m => m.classList.remove("is-open"));
        }
    });

    // Backlight ready
    function showBacklight() {
        document.querySelectorAll(".backlight-wrapper").forEach(w => w.classList.add("backlight-ready"));
    }
    if (document.readyState === "complete") showBacklight();
    else window.addEventListener("load", showBacklight);

    // Copy email (unificato per tutti i link)
    const copyEmail = (el, thenMailto = false) => {
        navigator.clipboard.writeText(emailAddress).then(() => {
            const feedback = el.querySelector(".socialinfo") || el;
            const orig = feedback.textContent || feedback.title;
            feedback.textContent = feedback.textContent ? "✓ Copiato!" : orig;
            feedback.style.color = "var(--primary-green)";
            setTimeout(() => {
                if (feedback.textContent) feedback.textContent = orig;
                else feedback.title = orig;
                feedback.style.color = "";
            }, 2000);
            if (thenMailto) window.location.href = `mailto:${emailAddress}`;
        }).catch(() => { if (thenMailto) window.location.href = `mailto:${emailAddress}`; });
    };

    document.querySelectorAll("#emailLink, #emailLinkIcon, #emailLinkBox").forEach(el => {
        el.addEventListener("click", e => {
            if (el.href?.startsWith("mailto:")) {
                e.preventDefault();
                copyEmail(el, el.id === "emailLinkBox");
            }
        });
    });
});