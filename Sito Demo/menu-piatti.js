document.addEventListener('DOMContentLoaded', function () {
  // --- Riferimenti DOM principali ---
  const menuIntro = document.getElementById('menu-intro');
  const menuCards = Array.from(document.querySelectorAll('.menu-card'));

  const mainCategoryButtons = Array.from(
    document.querySelectorAll('#main-categories .category-btn')
  );
  const subCategoryButtons = Array.from(
    document.querySelectorAll('#sub-categories .category-btn')
  );
  // Gestione sottocategorie bevande (bibite, vini, birra, cocktail)
  const subCategoryBevandeButtons = Array.from(
    document.querySelectorAll('#sub-categories-bevande .category-btn')
  );

  const scrollTopBtn = document.getElementById('scroll-top-btn');
  const togglePhotosBtn = document.getElementById('toggle-photos-btn');
  const favoritesPanelBtn = document.getElementById('favorites-panel-btn');

  // --- Stato interno ---
  let selectedMainCategory = null;      // es. "antipasti" | null
  let selectedSubCategory = null;       // es. "veg" | null
  let photosEnabled = false;            // camera toggle

  const FAVORITES_STORAGE_KEY = 'menuFavoritesV1';
  let favoriteIds = loadFavoritesFromStorage(); // Set di data-id

  // --- Inizializzazione ---

  // Applica stato preferiti dalle info in localStorage
  applyFavoritesToCards();

  // Applica filtri iniziali (stato neutro: solo menu-intro)
  applyFilters();

  // Applica stato foto iniziale (di default false)
  applyPhotoState();

  // --- Gestione categorie principali ---
  mainCategoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');

      if (selectedMainCategory === category) {
        selectedMainCategory = null;
      } else {
        selectedMainCategory = category;
      }

      // Mostra/nasconde le sottocategorie corrette
      const subCategories = document.getElementById('sub-categories');
      const subCategoriesBevande = document.getElementById('sub-categories-bevande');
      if (selectedMainCategory === 'bevande') {
        if (subCategories) subCategories.classList.add('hidden');
        if (subCategoriesBevande) subCategoriesBevande.classList.remove('hidden');
      } else {
        if (subCategories) subCategories.classList.remove('hidden');
        if (subCategoriesBevande) subCategoriesBevande.classList.add('hidden');
      }

      updateActiveState(mainCategoryButtons, selectedMainCategory);
      applyFilters();
    });
  });

   // Limita lo scroll della barra categorie su mobile (8px margine)
   (function limitCategoryScrollMobile() {
   const container = document.getElementById('main-categories');
   if (!container) return;
   // Solo su mobile
   if (window.innerWidth > 768) return;
   const buttons = container.querySelectorAll('button');
   if (!buttons.length) return;
   const margin = 16;
   container.addEventListener('scroll', function () {
    const scrollLeft = container.scrollLeft;
    const firstBtn = buttons[0];
    const lastBtn = buttons[buttons.length - 1];
    const firstBtnLeft = firstBtn.offsetLeft;
    const lastBtnRight = lastBtn.offsetLeft + lastBtn.offsetWidth;
    const maxScroll = lastBtnRight - container.clientWidth + margin;
    if (scrollLeft < firstBtnLeft - margin) {
      container.scrollLeft = firstBtnLeft - margin;
    }
    if (scrollLeft > maxScroll) {
      container.scrollLeft = maxScroll;
    }
   });
   })();

  // --- Gestione sotto-categorie ---
  function handleSubCategoryClick(btns) {
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const subCategory = btn.getAttribute('data-category');
        if (selectedSubCategory === subCategory) {
          selectedSubCategory = null;
        } else {
          selectedSubCategory = subCategory;
        }
        updateActiveState(btns, selectedSubCategory);
        applyFilters();
      });
    });
  }
  handleSubCategoryClick(subCategoryButtons);
  handleSubCategoryClick(subCategoryBevandeButtons);

  // --- Freccia su: scroll morbido in cima ---
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --- Camera: mostra/nascondi foto di tutte le card ---
  if (togglePhotosBtn) {
    togglePhotosBtn.addEventListener('click', () => {
      photosEnabled = !photosEnabled;
      togglePhotosBtn.classList.toggle('is-active', photosEnabled);
      togglePhotosBtn.setAttribute('aria-pressed', String(photosEnabled));
      applyPhotoState();
    });
  }

  // --- Cuore sticky: pannello preferiti ---
  if (favoritesPanelBtn) {
    favoritesPanelBtn.addEventListener('click', () => {
      const isOpen = document.body.classList.contains('favorites-panel-open');

      if (isOpen) {
        closeFavoritesPanel();
      } else {
        openFavoritesPanel();
      }
    });
  }

  // --- Like sui piatti (preferiti) ---
  // Delego su tutte le card per agganciare i click sui .like-btn
  menuCards.forEach((card) => {
    const likeBtn = card.querySelector('.like-btn');
    if (!likeBtn) return;

    likeBtn.addEventListener('click', () => {
      const cardId = getCardId(card);
      if (!cardId) return;

      const isNowFavorite = toggleFavorite(cardId);
      updateCardFavoriteState(card, isNowFavorite);
      saveFavoritesToStorage();

      // Se il pannello preferiti è aperto, rigenero la lista
      if (document.body.classList.contains('favorites-panel-open')) {
        rebuildFavoritesPanelContent();
      }
    });
  });

  // =========================
  // Funzioni di supporto
  // =========================

  function applyFilters() {
    const hasAnyFilter =
      Boolean(selectedMainCategory) || Boolean(selectedSubCategory);

    // Gestione visibilità menu-intro
    if (menuIntro) {
      menuIntro.style.display = hasAnyFilter ? 'none' : '';
    }

    if (!hasAnyFilter) {
      // Nessun filtro attivo → nessuna card visibile
      menuCards.forEach((card) => {
        card.classList.add('hidden');
      });
      return;
    }

    // Filtro per ogni card
    menuCards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category');
      const cardSubCategory = card.getAttribute('data-sub-category');

      let visible = true;

      if (selectedMainCategory) {
        visible = visible && cardCategory === selectedMainCategory;
      }

      if (selectedSubCategory) {
        visible = visible && cardSubCategory === selectedSubCategory;
      }

      if (visible) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  function updateActiveState(buttons, selectedValue) {
    buttons.forEach((btn) => {
      const value = btn.getAttribute('data-category');
      const isActive = value === selectedValue;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  function applyPhotoState() {
    const allCards = document.querySelectorAll('.menu-card');
    allCards.forEach((card) => {
      const img = card.querySelector('.menu-card-img');
      if (!img) return;
      if (photosEnabled) {
        img.classList.remove('hidden');
      } else {
        img.classList.add('hidden');
      }
    });
  }

  // --- Gestione preferiti in memoria/localStorage ---

  function getCardId(card) {
    return card.getAttribute('data-id');
  }

  function loadFavoritesFromStorage() {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return new Set();
      return new Set(arr);
    } catch (e) {
      return new Set();
    }
  }

  function saveFavoritesToStorage() {
    try {
      const arr = Array.from(favoriteIds);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      // niente: se localStorage fallisce non blocchiamo il sito
    }
  }

  function toggleFavorite(cardId) {
    if (favoriteIds.has(cardId)) {
      favoriteIds.delete(cardId);
      return false;
    } else {
      favoriteIds.add(cardId);
      return true;
    }
  }

  function applyFavoritesToCards() {
    menuCards.forEach((card) => {
      const cardId = getCardId(card);
      if (!cardId) return;
      const likeBtn = card.querySelector('.like-btn');
      if (!likeBtn) return;

      const isFav = favoriteIds.has(cardId);
      updateCardFavoriteState(card, isFav);
    });
  }

  function updateCardFavoriteState(card, isFavorite) {
    const likeBtn = card.querySelector('.like-btn');
    if (!likeBtn) return;

    card.classList.toggle('is-favorite', isFavorite);
    likeBtn.setAttribute('aria-pressed', String(isFavorite));

    // Se vuoi cambiare il cuore pieno/vuoto via classe, gestiscilo in CSS
    likeBtn.classList.toggle('is-active', isFavorite);
  }

  // --- Pannello Preferiti (overlay creato via JS) ---

  function openFavoritesPanel() {
    // Evito di creare doppi pannelli
    let panel = document.getElementById('favorites-panel');
    let backdrop = document.getElementById('favorites-panel-backdrop');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'favorites-panel-backdrop';
      backdrop.className =
        'fixed inset-0 z-40 bg-black/20 backdrop-blur-lg flex items-center justify-center px-4';
      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', (event) => {
        // Chiudi solo se clicchi fuori dal pannello
        if (event.target === backdrop) {
          closeFavoritesPanel();
        }
      });
    }

    if (!panel) {
      // Carica il template HTML del pannello preferiti
      fetch('favorites-panel.html')
        .then(response => response.text())
        .then(html => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          panel = tempDiv.firstElementChild;
          // Append il pannello dentro il backdrop per centrarlo con flex
          backdrop.appendChild(panel);

          // Aggiungi evento al bottone Chiudi
          const closeBtn = panel.querySelector('#favorites-close-btn');
          if (closeBtn) {
            closeBtn.addEventListener('click', () => {
              closeFavoritesPanel();
            });
          }

          // Popola la lista preferiti
          rebuildFavoritesPanelContent();
        });
      return; // esci, rebuildFavoritesPanelContent verrà chiamato dopo fetch
    }

    // Icona/stato visivo del bottone sticky
    favoritesPanelBtn.classList.add('is-active');
    favoritesPanelBtn.setAttribute('aria-pressed', 'true');

    document.body.classList.add('favorites-panel-open');

    rebuildFavoritesPanelContent();
  }

  function closeFavoritesPanel() {
    const panel = document.getElementById('favorites-panel');
    const backdrop = document.getElementById('favorites-panel-backdrop');

    if (panel) {
      panel.remove();
    }
    if (backdrop) {
      backdrop.remove();
    }

    if (favoritesPanelBtn) {
      favoritesPanelBtn.classList.remove('is-active');
      favoritesPanelBtn.setAttribute('aria-pressed', 'false');
    }

    document.body.classList.remove('favorites-panel-open');
  }

  function rebuildFavoritesPanelContent() {
    const panel = document.getElementById('favorites-panel');
    if (!panel) return;

    // Trova il contenitore lista e messaggio vuoto nel template
    const listContainer = panel.querySelector('#favorites-list');
    const emptyMsg = panel.querySelector('#favorites-empty-msg');
    if (!listContainer) return;

    // Svuota la lista (ma lascia il messaggio vuoto se serve)
    listContainer.innerHTML = '';

    const favArray = Array.from(favoriteIds);

    if (favArray.length === 0) {
      if (emptyMsg) {
        emptyMsg.style.display = '';
        listContainer.appendChild(emptyMsg);
      }
    } else {
      if (emptyMsg) emptyMsg.style.display = 'none';
      favArray.forEach((id) => {
        const originalCard = menuCards.find((card) => getCardId(card) === id);
        if (!originalCard) return;

        // Cloniamo la card per il pannello
        const clone = originalCard.cloneNode(true);
        clone.classList.add('favorite-card');
        clone.classList.remove('hidden');

        // Like nel pannello aggiorna stato globale
        const likeBtn = clone.querySelector('.like-btn');
        if (likeBtn) {
          likeBtn.addEventListener('click', () => {
            const isNowFavorite = toggleFavorite(id);
            saveFavoritesToStorage();
            if (originalCard) updateCardFavoriteState(originalCard, isNowFavorite);
            rebuildFavoritesPanelContent();
          });
        }

        // Rispetta lo stato della camera anche nel pannello
        const img = clone.querySelector('.menu-card-img');
        if (img) {
          if (photosEnabled) {
            img.classList.remove('hidden');
          } else {
            img.classList.add('hidden');
          }
        }

        listContainer.appendChild(clone);
      });
    }
  }
});

// --- Gestione overlay intro ---
document.addEventListener('DOMContentLoaded', () => {
  // Mostra solo la prima volta
 // if (localStorage.getItem('menuIntroShown') === 'true') return;

  const overlay = document.getElementById('intro-overlay');
  const btnClose = document.getElementById('intro-close');
  const btnSkip  = document.getElementById('intro-skip');

  const mainCategories = document.getElementById('main-categories');
  const subCategories  = document.getElementById('sub-categories');
  const bottomBar      = document.getElementById('bottom-actions-bar');


  // Le funzioni addHighlights e removeHighlights sono state rimosse per eliminare i contorni gialli.
  function addHighlights() {
    // Non fa nulla: contorni gialli rimossi
  }

  function removeHighlights() {
    // Non fa nulla: contorni gialli rimossi
  }

  function closeOverlay(save) {
    if (overlay) {
      overlay.classList.add('hidden');
    }
    const targets = [mainCategories, subCategories, bottomBar];
    
    // fade-out del contorno (opacity)
    targets.forEach(el => {
      if (!el) return;
      el.classList.add('opacity-0');
    });
    // dopo la transizione, rimuovi il ring e ripristina l'opacity
    setTimeout(() => {
      removeHighlights();
      targets.forEach(el => {
        if (!el) return;
        el.classList.remove('opacity-0');
      });
    }, 500);
    if (save) {
      localStorage.setItem('menuIntroShown', 'true');
    }
  }

  if (!overlay) return;

  // mostra overlay + highlight
  overlay.classList.remove('hidden');
  addHighlights();

  if (btnClose) btnClose.addEventListener('click', () => closeOverlay(true));
  if (btnSkip)  btnSkip.addEventListener('click', () => closeOverlay(true));
});