// components-loader.js
// Carica header e footer in modo efficiente e gestisce l'inizializzazione degli script

(function() {
    'use strict';

    // Funzione per caricare un componente HTML
    function loadComponent(url, targetId) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Errore nel caricamento di ${url}: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                const target = document.getElementById(targetId);
                if (target) {
                    target.innerHTML = html;
                }
            })
            .catch(error => {
                console.error('Errore caricamento componente:', error);
            });
    }

    // Funzione per inizializzare gli script che dipendono da header/footer
    function initializeScripts() {
        // Inizializza dropdown menu
        initDropdownMenu();
        
        // Inizializza mobile menu
        initMobileMenu();

        // Email link (copy to clipboard)
        const emailLink = document.getElementById('emailLink');
        if (emailLink) {
            emailLink.addEventListener('click', function(e) {
                e.preventDefault();
                const email = 'sebisorbll@gmail.com';
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(email)
                        .then(() => {
                            const originalText = this.textContent;
                            this.textContent = 'Email copiata!';
                            setTimeout(() => {
                                this.textContent = originalText;
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Errore nella copia:', err);
                            window.location.href = 'mailto:' + email;
                        });
                } else {
                    // Fallback per browser che non supportano clipboard API
                    window.location.href = 'mailto:' + email;
                }
            });
        }
    }
    
    // Inizializza dropdown menu (dal dropdown.js)
    function initDropdownMenu() {
        const dropdownToggles = document.querySelectorAll(".bottone-dropdown");
        if (dropdownToggles.length === 0) return;
        
        function isMobile() {
            return window.innerWidth < 1024;
        }
        
        dropdownToggles.forEach(dropdownToggle => {
            const dropdownMenu = dropdownToggle.querySelector(".bottone-dropdown-menu");
            if (!dropdownMenu) return;
            
            dropdownToggle.addEventListener("click", (e) => {
                if (e.target.closest("a")) return;
                if (!isMobile()) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                const isOpen = dropdownMenu.classList.contains("is-open");
                
                document.querySelectorAll(".bottone-dropdown-menu.is-open").forEach(menu => {
                    if (menu !== dropdownMenu) {
                        menu.classList.remove("is-open");
                    }
                });
                
                if (isOpen) {
                    dropdownMenu.classList.remove("is-open");
                } else {
                    dropdownMenu.classList.add("is-open");
                }
            });
            
            dropdownMenu.addEventListener("click", (e) => {
                if (e.target.tagName === "A" || e.target.closest("a")) {
                    setTimeout(() => {
                        dropdownMenu.classList.remove("is-open");
                    }, 100);
                }
            });
        });
        
        document.addEventListener("click", (e) => {
            if (!isMobile()) return;
            if (!e.target.closest(".bottone-dropdown")) {
                document.querySelectorAll(".bottone-dropdown-menu.is-open").forEach(menu => {
                    menu.classList.remove("is-open");
                });
            }
        });
        
        window.addEventListener("resize", () => {
            if (!isMobile()) {
                document.querySelectorAll(".bottone-dropdown-menu.is-open").forEach(menu => {
                    menu.classList.remove("is-open");
                });
            }
        });
    }
    
    // Inizializza mobile menu (dal mobile-menu.js)
    function initMobileMenu() {
        const panel = document.getElementById("mobileMenuPanel");
        if (!panel) return;

        const toggle = document.querySelector(".mobile-menu-toggle");
        const lavoriBtn = document.querySelector(".header-lavori");

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
            const firstLink = panel.querySelector(".mobile-menu-link");
            if (firstLink) {
                requestAnimationFrame(() => {
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
                const activeEl = document.activeElement;
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
            toggle.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleMenuFromMobile();
            });
        }

        if (lavoriBtn) {
            lavoriBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Toggle menu su entrambi mobile e desktop
                if (panel.classList.contains("is-open")) closeMenu();
                else openMenu();
            });
        }

        panel.querySelectorAll(".mobile-menu-link").forEach((link) => {
            link.addEventListener("click", () => {
                closeMenu(true);
            });
        });

        document.addEventListener("click", (e) => {
            if (!panel.classList.contains("is-open")) return;
            const inToggle = toggle && toggle.contains(e.target);
            const inLavori = lavoriBtn && lavoriBtn.contains(e.target);
            const inPanel = panel.contains(e.target);
            if (!inToggle && !inLavori && !inPanel) closeMenu(false);
        });
    }

    // Carica header e footer al caricamento della pagina
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Promise.all([
                loadComponent('header.html', 'header-placeholder'),
                loadComponent('footer.html', 'footer-placeholder')
            ]).then(() => {
                // Inizializza gli script dopo che header e footer sono caricati
                initializeScripts();
                
                // Notify page loader that components are loaded
                document.dispatchEvent(new CustomEvent('componentsLoaded'));
            });
        });
    } else {
        // DOM già caricato
        Promise.all([
            loadComponent('header.html', 'header-placeholder'),
            loadComponent('footer.html', 'footer-placeholder')
        ]).then(() => {
            initializeScripts();
            
            // Notify page loader that components are loaded
            document.dispatchEvent(new CustomEvent('componentsLoaded'));
        });
    }
})();
