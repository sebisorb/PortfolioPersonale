// demo-mobile-menu.js
// Gestione menu a panino per mobile
// Assicurati che l'icona abbia id="menu-toggle" e il menu abbia id="mobile-menu"



function initMobileMenu() {
  const menuButton = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuButton && mobileMenu) {
    // Rimuovi eventuali vecchi listener
    if (menuButton._mobileMenuHandler) {
      menuButton.removeEventListener('click', menuButton._mobileMenuHandler);
    }
    // Definisci il nuovo handler
    const handler = () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        mobileMenu.classList.remove('open');
        mobileMenu.classList.add('hidden');
      } else {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('open');
      }
    };
    menuButton.addEventListener('click', handler);
    menuButton._mobileMenuHandler = handler;
  }
}

// Se il menu è già presente nel DOM (inclusione statica)
if (document.getElementById('menu-toggle') && document.getElementById('mobile-menu')) {
  initMobileMenu();
}
