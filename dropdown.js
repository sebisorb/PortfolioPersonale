// ===============================
// DROPDOWN MENU - LAVORI
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    const dropdownToggles = document.querySelectorAll(".bottone-dropdown");
    
    if (dropdownToggles.length === 0) return;
    
    // Solo su mobile/tablet portrait (larghezza < 1024px)
    function isMobile() {
        return window.innerWidth < 1024;
    }
    
    // Inizializza ogni dropdown
    dropdownToggles.forEach(dropdownToggle => {
        const dropdownMenu = dropdownToggle.querySelector(".bottone-dropdown-menu");
        if (!dropdownMenu) return;
        
        // Toggle menu su click (mobile)
        dropdownToggle.addEventListener("click", (e) => {
            // Se il click è su un link dentro il menu, non fare nulla (lascia navigare)
            if (e.target.closest("a")) return;
            
            if (!isMobile()) return; // Su desktop usa hover
            
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = dropdownMenu.classList.contains("is-open");
            
            // Chiudi altri dropdown se aperti
            document.querySelectorAll(".bottone-dropdown-menu.is-open").forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.remove("is-open");
                }
            });
            
            // Toggle questo menu
            if (isOpen) {
                dropdownMenu.classList.remove("is-open");
            } else {
                dropdownMenu.classList.add("is-open");
            }
        });
        
        // Chiudi menu quando si naviga (mobile)
        dropdownMenu.addEventListener("click", (e) => {
            if (e.target.tagName === "A" || e.target.closest("a")) {
                // Piccolo delay per permettere la navigazione
                setTimeout(() => {
                    dropdownMenu.classList.remove("is-open");
                }, 100);
            }
        });
    });
    
    // Chiudi menu cliccando fuori (mobile)
    document.addEventListener("click", (e) => {
        if (!isMobile()) return;
        
        // Se il click è fuori da tutti i dropdown, chiudili
        if (!e.target.closest(".bottone-dropdown")) {
            document.querySelectorAll(".bottone-dropdown-menu.is-open").forEach(menu => {
                menu.classList.remove("is-open");
            });
        }
    });
    
    // Chiudi menu al resize se si passa a desktop
    window.addEventListener("resize", () => {
        if (!isMobile()) {
            document.querySelectorAll(".bottone-dropdown-menu.is-open").forEach(menu => {
                menu.classList.remove("is-open");
            });
        }
    });
});

// Barra backlight: appare solo dopo caricamento completo (box e layout pronti)
function showBacklight() {
    document.querySelectorAll(".backlight-wrapper").forEach((w) => w.classList.add("backlight-ready"));
}
if (document.readyState === "complete") {
    showBacklight();
} else {
    window.addEventListener("load", showBacklight);
}

// Copia email al click — footer (#emailLink, #emailLinkIcon). Box Contatti (#emailLinkBox): copia + apre client.
document.addEventListener("DOMContentLoaded", () => {
    const emailLink = document.getElementById("emailLink");
    const emailLinkIcon = document.getElementById("emailLinkIcon");
    const emailLinkBox = document.getElementById("emailLinkBox");
    const emailAddress = "sebisorbll@gmail.com";

    function copyEmailToClipboard(el, thenMailto) {
        const feedbackEl = el.querySelector(".socialinfo") || el;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(emailAddress).then(() => {
                const origText = feedbackEl.textContent || feedbackEl.title;
                const origColor = feedbackEl.style.color;
                if (feedbackEl.textContent) feedbackEl.textContent = "✓ Copiato!";
                else feedbackEl.title = "✓ Copiato!";
                feedbackEl.style.color = "var(--primary-green)";
                feedbackEl.classList.add("email-copied");
                setTimeout(() => {
                    if (feedbackEl.textContent) feedbackEl.textContent = origText;
                    else feedbackEl.title = origText;
                    feedbackEl.style.color = origColor;
                    feedbackEl.classList.remove("email-copied");
                }, 2000);
                if (thenMailto) window.location.href = "mailto:" + emailAddress;
            }).catch(() => { window.location.href = "mailto:" + emailAddress; });
        } else {
            window.location.href = "mailto:" + emailAddress;
        }
    }

    if (emailLink) {
        emailLink.addEventListener("click", (e) => {
            if (emailLink.href.startsWith("mailto:")) {
                e.preventDefault();
                copyEmailToClipboard(emailLink, false);
            }
        });
    }
    if (emailLinkIcon) {
        emailLinkIcon.addEventListener("click", (e) => {
            if (emailLinkIcon.href.startsWith("mailto:")) {
                e.preventDefault();
                copyEmailToClipboard(emailLinkIcon, false);
                if (emailLink) {
                    const t = emailLink.textContent;
                    emailLink.textContent = "✓ Copiato!";
                    emailLink.style.color = "var(--primary-green)";
                    setTimeout(() => { emailLink.textContent = t; emailLink.style.color = ""; }, 2000);
                }
            }
        });
    }
    if (emailLinkBox) {
        emailLinkBox.addEventListener("click", (e) => {
            if (emailLinkBox.getAttribute("href") && emailLinkBox.getAttribute("href").startsWith("mailto:")) {
                e.preventDefault();
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(emailAddress).then(() => {
                        emailLinkBox.classList.add("email-copied");
                        setTimeout(() => emailLinkBox.classList.remove("email-copied"), 2000);
                        window.location.href = "mailto:" + emailAddress;
                    }).catch(() => { window.location.href = "mailto:" + emailAddress; });
                } else {
                    window.location.href = "mailto:" + emailAddress;
                }
            }
        });
    }
});
