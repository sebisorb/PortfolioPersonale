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
        // Deselect se clicchi di nuovo la stessa
        selectedMainCategory = null;
      } else {
        selectedMainCategory = category;
      }

      updateActiveState(mainCategoryButtons, selectedMainCategory);
      applyFilters();
    });
  });

  // --- Gestione sotto-categorie ---
  subCategoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const subCategory = btn.getAttribute('data-category');

      if (selectedSubCategory === subCategory) {
        selectedSubCategory = null;
      } else {
        selectedSubCategory = subCategory;
      }

      updateActiveState(subCategoryButtons, selectedSubCategory);
      applyFilters();
    });
  });

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
    menuCards.forEach((card) => {
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
        'fixed inset-0 z-40 bg-black/50'; // personalizza le classi come vuoi
      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', () => {
        closeFavoritesPanel();
      });
    }

    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'favorites-panel';
      panel.className =
        // puoi cambiare le classi / layout come preferisci
        'fixed inset-x-4 bottom-4 top-20 z-50 overflow-y-auto rounded-2xl bg-white/90 backdrop-blur p-4 shadow-xl';
      document.body.appendChild(panel);
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

    // Svuota contenuto
    panel.innerHTML = '';

    // Header semplice con titolo + pulsante chiusura
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between mb-4';

    const title = document.createElement('h2');
    title.textContent = 'Piatti preferiti';
    title.className = 'text-xl font-semibold';
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className =
      'px-3 py-1 rounded-full bg-black/10 hover:bg-black/20 transition-colors';
    closeBtn.textContent = 'Chiudi';
    closeBtn.addEventListener('click', () => {
      closeFavoritesPanel();
    });

    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Contenitore card preferite
    const listContainer = document.createElement('div');
    listContainer.className = 'flex flex-col gap-4';

    const favArray = Array.from(favoriteIds);

    if (favArray.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.textContent = 'Nessun piatto preferito selezionato.';
      emptyMsg.className = 'text-sm text-gray-600';
      listContainer.appendChild(emptyMsg);
    } else {
      favArray.forEach((id) => {
        const originalCard = menuCards.find(
          (card) => getCardId(card) === id
        );
        if (!originalCard) return;

        // Cloniamo la card per il pannello
        const clone = originalCard.cloneNode(true);
        clone.classList.add('favorite-card');

        // Importante: il like dentro il pannello deve togliere il preferito "globale"
        const likeBtn = clone.querySelector('.like-btn');
        if (likeBtn) {
          likeBtn.addEventListener('click', () => {
            // Aggiorna stato globale
            const isNowFavorite = toggleFavorite(id);
            saveFavoritesToStorage();

            // Aggiorna card originale
            if (originalCard) {
              updateCardFavoriteState(originalCard, isNowFavorite);
            }

            // Ricarica contenuto pannello
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

    panel.appendChild(listContainer);
  }
});