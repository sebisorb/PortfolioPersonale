# Analisi codice – Ottimizzazione, conflitti, ridondanze

**Data:** 2025-01-28  
**Scope:** Personale.html, stile.css, gallery.js, dropdown.js (e pagine gallery correlate).

---

## 1. Ridondanze CSS

### 1.1 User-select su header
- **Dove:** `stile.css` ~98-102 e ~165-170.
- **Problema:** `header, header * { user-select: none }` già copre tutti i figli; `header a { user-select: none }` è ridondante.
- **Azione:** Rimuovere il blocco `header a { user-select: none }` (righe 165-170).

### 1.2 Margini .profilo
- **Dove:** `stile.css` ~402-419.
- **Problema:** `.profilo` ha `margin: 20px auto 30px` e subito dopo `margin-left: auto; margin-right: auto` (stessi valori).
- **Azione:** Togliere `margin-left` e `margin-right` da `.profilo`.

### 1.3 Opacity su .personale-carousel-item
- **Dove:** `stile.css` ~1919-1921.
- **Problema:** `.personale-carousel-item.is-active .personale-photo-frame img { opacity: 1 }` e `.personale-carousel-item:not(.is-active) ... { opacity: 1 }` sono equivalenti (entrambi opacity 1).
- **Azione:** Sostituire con una sola regola: `.personale-carousel-item .personale-photo-frame img { opacity: 1 }` (opzionale, il layout verticale è inutilizzato su Personale attuale).

---

## 2. Codice “morto” sulla pagina Personale attuale

La **Personale.html** attuale usa solo:
- Caroselli orizzontali (`.gallery-carousel`) con strip sotto (`.gallery-carousel-strip`).
- Nessun hero, nessun `.personale-categoria`, nessun `.personale-carousel-vertical` / `.personale-carousel-wrap` / `.personale-strip` (strip verticale).

### 2.1 CSS inutilizzato su Personale attuale
- **html.personale-page .gallery-hero** (e .gallery-hero-title, .gallery-hero-description): la pagina non ha più hero in HTML; queste regole non si applicano a nessun elemento.
- **.personale-categoria**, **.personale-hero-snap**, **.personale-carousel-wrap**, **.personale-carousel-vertical**, **.personale-strip** (strip verticale), **.personale-carousel-item**, **.personale-photo-frame**: usati solo nel layout “verticale” del checkpoint, non nella Personale attuale.

**Nota:** Il CSS del layout verticale è ancora utile per il checkpoint e per un eventuale ritorno a quel layout; si può lasciare o rimuovere in blocco se si abbandona definitivamente quel design.

### 2.2 Regole hero Personale (sicure da rimuovere)
Le regole che iniziano con `html.personale-page .gallery-hero` e `html.personale-page .personale-categoria .gallery-hero` non hanno più elementi a cui applicarsi (nessun hero in Personale). Si possono rimuovere per snellire senza effetti sulla pagina attuale.

### 2.3 JavaScript “morto” su Personale attuale
- **personaleCarousels** (`.personale-carousel-vertical`): su Personale attuale la query restituisce 0 elementi; il forEach non fa nulla. Nessun bug, solo codice non usato.
- **personaleWraps** (`.personale-carousel-wrap`): idem, 0 elementi; listener wheel e IntersectionObserver non trovano nulla. Si può aggiungere un early exit `if (personaleWraps.length === 0) return` nel blocco wheel per evitare lavoro inutile quando non ci sono wrap.

---

## 3. Conflitti / specificità

### 3.1 User-select
- **body:** `a, input, textarea, button { user-select: text }`.
- **header:** `header a { user-select: none }` (ridondante con `header *`).
Nessun conflitto reale: i link in header restano non selezionabili. Rimuovendo `header a` non cambia comportamento.

### 3.2 .gallery-main
- Definito in base (~1021) e nel media desktop (~2627). Cascade corretto: il blocco desktop sovrascrive solo le proprietà ridichiarate. Nessun conflitto.

### 3.3 !important
- **stile.css:** 9 occorrenze (es. `.gallery-swipe-hint` desktop `display: none !important`, scrollbar, `.socialinfo a.email-copied`). Uso limitato e motivato (nascondere hint desktop, scrollbar, feedback email). Nessun conflitto segnalato.

---

## 4. Snellimento e buone pratiche

### 4.1 Breakpoint mobile
- **gallery.js:** `window.innerWidth < 769`.
- **dropdown.js:** `window.innerWidth < 769`.
Valore coerente (769). Non serve unificare in una variabile globale; i due file sono indipendenti.

### 4.2 Strip Personale (caricamento)
- Inizializzazione strip orizzontale già robusta: doppio rAF, load, setTimeout(80), ResizeObserver, scroll, resize. Nessuna modifica necessaria.

### 4.3 Prefetch immagini
- `runIdle` + prefetch prime 4 + on first touch 15: buona strategia. OK.

### 4.4 dropdown.js
- Contiene: dropdown menu, backlight (showBacklight), copia email. Personale non ha più `.backlight-wrapper` nel main; le altre pagine sì. `showBacklight()` resta necessario. Nessuna ridondanza da rimuovere.

---

## 5. Riepilogo interventi applicabili (sicuri)

| # | File       | Intervento | Stato |
|---|------------|------------|--------|
| 1 | stile.css  | Rimuovere blocco `header a { user-select: none }` (ridondante con `header *`) | ✅ Applicato |
| 2 | stile.css  | Rimuovere `margin-left: auto; margin-right: auto` da `.profilo` | ✅ Applicato |
| 3 | stile.css  | Rimuovere regole `html.personale-page .gallery-hero*` (nessun hero in Personale) | ✅ Applicato |
| 4 | stile.css  | Rimuovere regole `html.personale-page .personale-categoria .gallery-hero*` (3 regole margini) | ✅ Applicato |
| 5 | gallery.js| Early exit nel listener wheel Personale se `personaleWraps.length === 0` | ✅ Applicato |

**Non applicato (caratteri Unicode nelle stringhe):** rimozione blocco `html.personale-page .personale-categoria .backlight-wrapper::before` e commento orfano "distacco titolo↔foto". Si possono rimuovere a mano se necessario.

---

## 6. Non modificare (o solo con cautela)

- **Layout verticale Personale** (`.personale-carousel-vertical`, `.personale-carousel-wrap`, `.personale-strip`): usato nel checkpoint; rimuoverlo solo se si abbandona quel layout.
- **.gallery-swipe-hint**: ancora usato su food.html e product.html; tenere CSS e JS.
- **Variabile --personale-strip-w**: usata dalla strip orizzontale (desktop) e dal layout verticale; tenere.

---

## 7. Dimensioni e struttura file

- **stile.css:** ~3060 righe, un solo grande `@media (min-width: 769px)`. Struttura mobile-first chiara. Eventuale split in “gallery.css” / “personale.css” solo se si vuole modularizzare in seguito.
- **gallery.js:** ~1032 righe; logica caroselli, lightbox, Personale (strip orizzontale + codice verticale). Coerente.
- **dropdown.js:** ~161 righe; dropdown, backlight, email. OK.

---

## 8. Pass 29/01/2025 (qualità + snellimento)

### 8.1 gallery.js
- **getClosestPhotoIndex duplicato:** Una versione senza argomenti (usa `photos`/`carousel` in closure) dentro il `carousels.forEach` e una `getClosestPhotoIndex(carousel)` nel blocco navigazione. **Applicato:** rimossa la versione locale; ovunque si usa `getClosestPhotoIndex(carousel)` (stessa logica basata su `.gallery-photo`).
- **updateLightbox:** Il blocco `if (lightboxImg) { lightboxImg.classList.remove("zoomed"); }` era ridondante (si ritorna già se `!lightboxImg`). **Applicato:** rimosso l’`if`, lasciato solo `lightboxImg.classList.remove("zoomed")`.
- **Scrollbar Personale:** `document.addEventListener("load", scheduleUpdate, true)` ridondante con `window.addEventListener("load", updateThumb, { once: true })`. **Applicato:** rimosso il listener su `document` "load".

### 8.2 stile.css
- **Commento Lightbox:** Nel blocco `@media (min-width: 769px)` il commento diceva "Lightbox mobile" pur essendo regole desktop. **Applicato:** commento corretto in "Lightbox: frecce orizzontali sotto la foto (desktop; ...)".

### 8.3 mobile-menu.js (accessibilità)
- **Focus in apertura:** All’apertura del pannello il focus non andava al contenuto. **Applicato:** focus sul primo `.mobile-menu-link` con `requestAnimationFrame` e `preventScroll: true`.
- **Focus in chiusura:** Alla chiusura (link o Escape) il focus torna al pulsante che ha aperto (hamburger su mobile, LAVORI su desktop). **Applicato:** `closeMenu(true)` quando si chiude da link o Escape; `closeMenu(false)` quando si chiude da click fuori o resize; in `closeMenu(true)` si riporta il focus a toggle/lavoriBtn se il focus era nel pannello.

### 8.4 Riepilogo interventi (pass 29/01)
| # | File        | Intervento | Stato |
|---|-------------|------------|--------|
| 1 | gallery.js  | Unificare getClosestPhotoIndex (rimuovere duplicato) | ✅ |
| 2 | gallery.js  | Rimuovere check ridondante in updateLightbox | ✅ |
| 3 | gallery.js  | Rimuovere document "load" per scrollbar | ✅ |
| 4 | stile.css   | Correggere commento Lightbox (desktop) | ✅ |
| 5 | mobile-menu.js | Focus primo link all’apertura + focus opener in chiusura | ✅ |

Fine analisi.
