// menu-piatti.js
// Genera le card del menu da MENU_DATA (menu-data.js)
// e gestisce filtri, preferiti, foto, animazioni e overlay dettaglio piatto.

document.addEventListener('DOMContentLoaded', function () {

  // ── 1. RENDER CARD DA DATI ───────────────────────────────────

  const gridContainer = document.getElementById('menu-grid');

  /**
   * Crea il DOM di una singola card a partire da un oggetto piatto.
   * @param {Object} piatto — elemento di MENU_DATA
   * @returns {HTMLElement}
   */
  function createCardElement(piatto) {
    const card = document.createElement('div');
    card.className =
      'menu-card group relative bg-white/20 p-4 m-2 max-w-lg w-full mx-auto ' +
      'rounded-xl shadow-sm overflow-hidden cursor-pointer';
    card.setAttribute('data-id', piatto.id);
    card.setAttribute('data-category', piatto.category);
    card.setAttribute('data-sub-category', piatto.subCategory);

    card.innerHTML = `
      <img
        src="${piatto.img}"
        alt="${piatto.imgAlt}"
        class="menu-card-img w-full h-40 object-cover rounded-t-xl hidden"
      />
      <div class="flex justify-between items-center">
        <span class="font-semibold text-lg">${piatto.name}</span>
        <div class="flex items-center">
          <span class="font-bold text-clifford text-base">${piatto.price}</span>
          <button
            class="like-btn p-2 rounded-full hover:bg-white/40 transition"
            title="Aggiungi ai preferiti"
            aria-pressed="false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733
                   -.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25
                   c0 7.22 9 12 9 12s9-4.78 9-12Z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    return card;
  }

  // Popola il grid con tutte le card
  if (gridContainer && typeof MENU_DATA !== 'undefined') {
    MENU_DATA.forEach(function (piatto) {
      gridContainer.appendChild(createCardElement(piatto));
    });
  }


  // ── 2. RIFERIMENTI DOM ───────────────────────────────────────

  const menuIntro    = document.getElementById('menu-intro');
  const menuCards    = Array.from(document.querySelectorAll('.menu-card'));

  const mainCategoryButtons = Array.from(
    document.querySelectorAll('#main-categories .category-btn')
  );
  const subCategoryButtons = Array.from(
    document.querySelectorAll('#sub-categories .category-btn')
  );
  const subCategoryBevandeButtons = Array.from(
    document.querySelectorAll('#sub-categories-bevande .category-btn')
  );

  const scrollTopBtn      = document.getElementById('scroll-top-btn');
  const togglePhotosBtn   = document.getElementById('toggle-photos-btn');
  const favoritesPanelBtn = document.getElementById('favorites-panel-btn');


  // ── 3. STATO INTERNO ─────────────────────────────────────────

  let selectedMainCategory = null;
  let selectedSubCategory  = null;
  let photosEnabled        = false;

  const FAVORITES_STORAGE_KEY = 'menuFavoritesV1';
  let favoriteIds = loadFavoritesFromStorage();


  // ── 4. INIZIALIZZAZIONE ──────────────────────────────────────

  applyFavoritesToCards();
  applyFilters();
  applyPhotoState();


  // ── 5. CATEGORIE PRINCIPALI ──────────────────────────────────

  mainCategoryButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const category = btn.getAttribute('data-category');
      selectedMainCategory = selectedMainCategory === category ? null : category;

      const subCategories        = document.getElementById('sub-categories');
      const subCategoriesBevande = document.getElementById('sub-categories-bevande');

      if (selectedMainCategory === 'bevande') {
        if (subCategories)        subCategories.classList.add('hidden');
        if (subCategoriesBevande) subCategoriesBevande.classList.remove('hidden');
      } else {
        if (subCategories)        subCategories.classList.remove('hidden');
        if (subCategoriesBevande) subCategoriesBevande.classList.add('hidden');
      }

      updateActiveState(mainCategoryButtons, selectedMainCategory);
      applyFilters();
    });
  });

  // Limita scroll barra categorie su mobile
  (function limitCategoryScrollMobile() {
    const container = document.getElementById('main-categories');
    if (!container || window.innerWidth > 768) return;
    const buttons = container.querySelectorAll('button');
    if (!buttons.length) return;
    const margin = 16;
    container.addEventListener('scroll', function () {
      const firstBtn  = buttons[0];
      const lastBtn   = buttons[buttons.length - 1];
      const maxScroll = lastBtn.offsetLeft + lastBtn.offsetWidth - container.clientWidth + margin;
      if (container.scrollLeft < firstBtn.offsetLeft - margin) container.scrollLeft = firstBtn.offsetLeft - margin;
      if (container.scrollLeft > maxScroll) container.scrollLeft = maxScroll;
    });
  })();


  // ── 6. SOTTO-CATEGORIE ───────────────────────────────────────

  function handleSubCategoryClick(btns) {
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const subCategory = btn.getAttribute('data-category');
        selectedSubCategory = selectedSubCategory === subCategory ? null : subCategory;
        updateActiveState(btns, selectedSubCategory);
        applyFilters();
      });
    });
  }
  handleSubCategoryClick(subCategoryButtons);
  handleSubCategoryClick(subCategoryBevandeButtons);


  // ── 7. BOTTONI BARRA STICKY ──────────────────────────────────

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (togglePhotosBtn) {
    togglePhotosBtn.addEventListener('click', function () {
      photosEnabled = !photosEnabled;
      togglePhotosBtn.classList.toggle('is-active', photosEnabled);
      togglePhotosBtn.setAttribute('aria-pressed', String(photosEnabled));
      applyPhotoState();
    });
  }

  if (favoritesPanelBtn) {
    favoritesPanelBtn.addEventListener('click', function () {
      if (document.body.classList.contains('favorites-panel-open')) {
        closeFavoritesPanel();
      } else {
        openFavoritesPanel();
      }
    });
  }


  // ── 8. CLICK CARD → OVERLAY DETTAGLIO ───────────────────────

  /**
   * Apre l'overlay con tutti i dettagli del piatto.
   * Il click sul like-btn è gestito separatamente e non propaga.
   */
  function openDishOverlay(piatto) {
    // Rimuovi overlay precedente se esiste
    const existing = document.getElementById('dish-overlay');
    if (existing) existing.remove();

    const isFav = favoriteIds.has(piatto.id);

    // Costruisci lista ingredienti
    const ingredientsList = piatto.ingredients && piatto.ingredients.length
      ? piatto.ingredients.map(function (i) { return '<li>' + i + '</li>'; }).join('')
      : '<li>Non disponibile</li>';

    // Costruisci lista allergeni
    const allergensContent = piatto.allergens && piatto.allergens.length
      ? piatto.allergens.join(', ')
      : 'Nessun allergene dichiarato';

    const overlay = document.createElement('div');
    overlay.id = 'dish-overlay';
    overlay.className = 'dish-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', piatto.name);

    overlay.innerHTML = `
      <div class="dish-overlay-backdrop"></div>
      <div class="dish-overlay-panel">

        <!-- Foto -->
        <div class="dish-overlay-img-wrap">
          <img src="${piatto.img}" alt="${piatto.imgAlt}" class="dish-overlay-img" />
        </div>

        <!-- Contenuto -->
        <div class="dish-overlay-body">

          <!-- Header: nome + prezzo + chiudi -->
          <div class="dish-overlay-header">
            <div>
              <h2 class="dish-overlay-name">${piatto.name}</h2>
              <span class="dish-overlay-price">${piatto.price}</span>
            </div>
            <div class="dish-overlay-header-actions">
              <!-- Like nell'overlay -->
              <button
                class="like-btn dish-overlay-like ${isFav ? 'is-active' : ''}"
                data-id="${piatto.id}"
                title="Aggiungi ai preferiti"
                aria-pressed="${isFav}"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="${isFav ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733
                       -.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25
                       c0 7.22 9 12 9 12s9-4.78 9-12Z"/>
                </svg>
              </button>
              <!-- Chiudi -->
              <button class="dish-overlay-close" aria-label="Chiudi">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Descrizione -->
          <p class="dish-overlay-description">${piatto.description || ''}</p>

          <!-- Ingredienti -->
          <div class="dish-overlay-section">
            <h3 class="dish-overlay-section-title">Ingredienti</h3>
            <ul class="dish-overlay-ingredients">${ingredientsList}</ul>
          </div>

          <!-- Allergeni -->
          <div class="dish-overlay-section">
            <h3 class="dish-overlay-section-title">Allergeni</h3>
            <p class="dish-overlay-allergens">${allergensContent}</p>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Anima apertura (micro-delay per trigger CSS transition)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('is-open');
      });
    });

    // Chiudi cliccando backdrop
    overlay.querySelector('.dish-overlay-backdrop').addEventListener('click', closeDishOverlay);

    // Chiudi con bottone ✕
    overlay.querySelector('.dish-overlay-close').addEventListener('click', closeDishOverlay);

    // Chiudi con Escape
    document.addEventListener('keydown', onOverlayEscape);

    // Like nell'overlay
    const overlayLikeBtn = overlay.querySelector('.dish-overlay-like');
    if (overlayLikeBtn) {
      overlayLikeBtn.addEventListener('click', function () {
        const isNowFav = toggleFavorite(piatto.id);
        saveFavoritesToStorage();

        // Aggiorna icona nell'overlay
        overlayLikeBtn.classList.toggle('is-active', isNowFav);
        overlayLikeBtn.setAttribute('aria-pressed', String(isNowFav));
        const svgPath = overlayLikeBtn.querySelector('svg');
        if (svgPath) svgPath.setAttribute('fill', isNowFav ? 'currentColor' : 'none');

        // Aggiorna card nel grid
        const originalCard = menuCards.find(function (c) { return getCardId(c) === piatto.id; });
        if (originalCard) updateCardFavoriteState(originalCard, isNowFav);

        // Aggiorna pannello preferiti se aperto
        if (document.body.classList.contains('favorites-panel-open')) {
          rebuildFavoritesPanelContent();
        }
      });
    }
  }

  function closeDishOverlay() {
    const overlay = document.getElementById('dish-overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.removeEventListener('keydown', onOverlayEscape);
    overlay.addEventListener('transitionend', function () {
      overlay.remove();
    }, { once: true });
  }

  function onOverlayEscape(e) {
    if (e.key === 'Escape') closeDishOverlay();
  }

  // Attacca click su ogni card
  function attachCardClickListener(card) {
    card.addEventListener('click', function (e) {
      // Non aprire l'overlay se si clicca sul like-btn
      if (e.target.closest('.like-btn')) return;

      const cardId = getCardId(card);
      if (!cardId || typeof MENU_DATA === 'undefined') return;

      const piatto = MENU_DATA.find(function (p) { return p.id === cardId; });
      if (piatto) openDishOverlay(piatto);
    });
  }

  menuCards.forEach(function (card) {
    attachLikeListener(card);
    attachCardClickListener(card);
  });


  // ── 9. LIKE SUI PIATTI ───────────────────────────────────────

  function attachLikeListener(card) {
    const likeBtn = card.querySelector('.like-btn');
    if (!likeBtn) return;
    likeBtn.addEventListener('click', function () {
      const cardId = getCardId(card);
      if (!cardId) return;
      const isNowFavorite = toggleFavorite(cardId);
      updateCardFavoriteState(card, isNowFavorite);
      saveFavoritesToStorage();
      if (document.body.classList.contains('favorites-panel-open')) {
        rebuildFavoritesPanelContent();
      }
    });
  }


  // ── 10. FILTRI E VISIBILITÀ CARD (con fade) ──────────────────

  function fadeInCard(card, index) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(8px)';
    card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    const delay = Math.min(index * 30, 120);
    setTimeout(function () {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, delay);
  }

  function applyFilters() {
    const hasAnyFilter = Boolean(selectedMainCategory) || Boolean(selectedSubCategory);

    if (menuIntro) menuIntro.style.display = hasAnyFilter ? 'none' : '';

    if (!hasAnyFilter) {
      menuCards.forEach(function (card) {
        card.classList.add('hidden');
        card.style.opacity = '';
        card.style.transform = '';
        card.style.transition = '';
      });
      return;
    }

    let visibleIndex = 0;
    menuCards.forEach(function (card) {
      const cardCategory    = card.getAttribute('data-category');
      const cardSubCategory = card.getAttribute('data-sub-category');

      let visible = true;
      if (selectedMainCategory) visible = visible && cardCategory    === selectedMainCategory;
      if (selectedSubCategory)  visible = visible && cardSubCategory === selectedSubCategory;

      if (visible) {
        card.classList.remove('hidden');
        fadeInCard(card, visibleIndex);
        visibleIndex++;
      } else {
        card.classList.add('hidden');
        card.style.opacity   = '';
        card.style.transform = '';
        card.style.transition = '';
      }
    });
  }


  // ── 11. STATO ATTIVO BOTTONI ─────────────────────────────────

  function updateActiveState(buttons, selectedValue) {
    buttons.forEach(function (btn) {
      const isActive = btn.getAttribute('data-category') === selectedValue;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }


  // ── 12. FOTO ─────────────────────────────────────────────────

  function applyPhotoState() {
    document.querySelectorAll('.menu-card').forEach(function (card) {
      const img = card.querySelector('.menu-card-img');
      if (!img) return;
      img.classList.toggle('hidden', !photosEnabled);
    });
  }


  // ── 13. PREFERITI ────────────────────────────────────────────

  function getCardId(card) {
    return card.getAttribute('data-id');
  }

  function loadFavoritesFromStorage() {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? new Set(arr) : new Set();
    } catch (e) { return new Set(); }
  }

  function saveFavoritesToStorage() {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favoriteIds)));
    } catch (e) {}
  }

  function toggleFavorite(cardId) {
    if (favoriteIds.has(cardId)) { favoriteIds.delete(cardId); return false; }
    favoriteIds.add(cardId);
    return true;
  }

  function applyFavoritesToCards() {
    menuCards.forEach(function (card) {
      const cardId = getCardId(card);
      if (!cardId) return;
      updateCardFavoriteState(card, favoriteIds.has(cardId));
    });
  }

  function updateCardFavoriteState(card, isFavorite) {
    const likeBtn = card.querySelector('.like-btn');
    if (!likeBtn) return;
    card.classList.toggle('is-favorite', isFavorite);
    likeBtn.classList.toggle('is-active', isFavorite);
    likeBtn.setAttribute('aria-pressed', String(isFavorite));
  }


  // ── 14. PANNELLO PREFERITI ───────────────────────────────────

  function openFavoritesPanel() {
    let backdrop = document.getElementById('favorites-panel-backdrop');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'favorites-panel-backdrop';
      backdrop.className =
        'fixed inset-0 z-40 bg-black/20 backdrop-blur-lg flex items-center justify-center px-4';
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', function (event) {
        if (event.target === backdrop) closeFavoritesPanel();
      });
    }

    let panel = document.getElementById('favorites-panel');

    if (!panel) {
      fetch('favorites-panel.html')
        .then(function (r) { return r.text(); })
        .then(function (html) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          panel = tempDiv.firstElementChild;
          backdrop.appendChild(panel);

          const closeBtn = panel.querySelector('#favorites-close-btn');
          if (closeBtn) closeBtn.addEventListener('click', closeFavoritesPanel);

          document.body.classList.add('favorites-panel-open');
          if (favoritesPanelBtn) {
            favoritesPanelBtn.classList.add('is-active');
            favoritesPanelBtn.setAttribute('aria-pressed', 'true');
          }
          rebuildFavoritesPanelContent();
        });
      return;
    }

    document.body.classList.add('favorites-panel-open');
    if (favoritesPanelBtn) {
      favoritesPanelBtn.classList.add('is-active');
      favoritesPanelBtn.setAttribute('aria-pressed', 'true');
    }
    rebuildFavoritesPanelContent();
  }

  function closeFavoritesPanel() {
    const panel    = document.getElementById('favorites-panel');
    const backdrop = document.getElementById('favorites-panel-backdrop');
    if (panel)    panel.remove();
    if (backdrop) backdrop.remove();
    document.body.classList.remove('favorites-panel-open');
    if (favoritesPanelBtn) {
      favoritesPanelBtn.classList.remove('is-active');
      favoritesPanelBtn.setAttribute('aria-pressed', 'false');
    }
  }

  function rebuildFavoritesPanelContent() {
    const panel = document.getElementById('favorites-panel');
    if (!panel) return;

    const listContainer = panel.querySelector('#favorites-list');
    const emptyMsg      = panel.querySelector('#favorites-empty-msg');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const favArray = Array.from(favoriteIds);

    if (favArray.length === 0) {
      if (emptyMsg) { emptyMsg.style.display = ''; listContainer.appendChild(emptyMsg); }
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    favArray.forEach(function (id) {
      const piatto = (typeof MENU_DATA !== 'undefined')
        ? MENU_DATA.find(function (p) { return p.id === id; })
        : null;
      if (!piatto) return;

      const clone = createCardElement(piatto);
      clone.classList.add('favorite-card');
      updateCardFavoriteState(clone, true);

      const img = clone.querySelector('.menu-card-img');
      if (img) img.classList.toggle('hidden', !photosEnabled);

      // Click sulla card nel pannello apre l'overlay dettaglio
      attachCardClickListener(clone);

      const likeBtn = clone.querySelector('.like-btn');
      if (likeBtn) {
        likeBtn.addEventListener('click', function () {
          const isNowFavorite = toggleFavorite(id);
          saveFavoritesToStorage();
          const originalCard = menuCards.find(function (c) { return getCardId(c) === id; });
          if (originalCard) updateCardFavoriteState(originalCard, isNowFavorite);
          rebuildFavoritesPanelContent();
        });
      }

      listContainer.appendChild(clone);
    });
  }

});


// ── OVERLAY INTRO ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  const overlay  = document.getElementById('intro-overlay');
  const btnClose = document.getElementById('intro-close');
  const btnSkip  = document.getElementById('intro-skip');

  function closeOverlay(save) {
    if (!overlay) return;
    overlay.classList.remove('visible');
    overlay.classList.add('hidden');
    document.body.classList.remove('intro-overlay-open');
    if (save) localStorage.setItem('menuIntroShown', 'true');
  }

  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.classList.add('visible');
  document.body.classList.add('intro-overlay-open');

  if (btnClose) btnClose.addEventListener('click', function () { closeOverlay(true); });
  if (btnSkip)  btnSkip.addEventListener('click',  function () { closeOverlay(true); });
});