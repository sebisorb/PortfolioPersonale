# Analisi carousel (Food / Personale)

## Struttura HTML
- `.gallery-carousel-container.personale-carousel-container` (flex column)
  - `.gallery-carousel-wrapper` (contiene carousel + frecce)
    - `.gallery-nav-prev` (nascosto < 1280px)
    - `.gallery-carousel.personale-carousel` (strip orizzontale)
      - `.gallery-photo` × N (slot con img)
    - `.gallery-nav-next`
  - `.personale-strip-viewport` (strip miniature)

## Problemi individuati

### 1. Blocco CSS orfano (bug)
**Righe 1815–1838**: il blocco "GALLERY GRID - DESKTOP" (.gallery-grid-container, .gallery-grid, .gallery-grid-item) è **indentato ma non dentro nessun `@media`**. Queste regole si applicano a **tutti i viewport** e sovrascrivono/duplicano la gallery grid. Andrebbero spostate dentro `@media (min-width: 1024px)` o rimosse se già duplicate nel blocco desktop.

### 2. Altezza wrapper sotto 1024px (centraggio verticale)
Il container è `flex-direction: column` con due figli: **wrapper** e **strip**. Il wrapper ha `height: 100%`; la strip ha `flex: 0 0 auto`. Con altezza container fissata (clamp), "100%" sul wrapper significa "tutta l’altezza del container", quindi wrapper + strip superano l’altezza del container e si crea overflow/ambiguïtà. Il browser può dare al wrapper un’altezza “a contenuto” e il carousel non riceve un’altezza definita → lo slot (blu) non si centra nel rosso.

**Soluzione**: dare al wrapper **flex: 1 1 0%** e **min-height: 0** (solo nel contesto `.personale-carousel-container` sotto 1024px) così prende lo **spazio rimanente** (container − strip). Così wrapper e carousel hanno altezza definita e `align-items: center` sul carousel centra gli slot.

### 3. Ridondanza scrollbar `.gallery-carousel`
Stesse regole scrollbar (webkit + track/thumb/hover/active/button) compaiono:
- in **base** (circa 1738–1778);
- di nuovo nel **desktop** `@media (min-width: 1024px)` (circa 2915–2952).

Si possono tenere solo in base; nel desktop eventuali override solo se servono.

### 4. Ripetizione selettori `html.personale-page / .food-page / .has-panel-menu`
Molte regole ripetono il trio di classi. Si può valutare una classe condivisa sul `<html>` (es. `.carousel-strip-page`) e un unico selettore per ridurre righe e manutenzione; oppure lasciare i tre selettori ma raggruppare meglio i blocchi.

### 5. Colori debug
Le righe 1809–1814 (verde/rosso/blu) sono temporanee: vanno rimosse in produzione.

### 6. Regole `.gallery-photo` duplicate
- Base: `.gallery-photo` (slot generico).
- Personale/Food: `html.personale-page .gallery-photo` (e food/has-panel) con border-radius, img height/object-fit, focus, tap-highlight.
- Desktop dentro @media 1024: di nuovo `.gallery-photo` e `html...personale-carousel-container .gallery-photo` con padding, max-width, transition.

Ordine e specificità sono ok, ma si può raggruppare per contesto (base / personale-food / desktop) per leggibilità.

### 7. Breakpoint e ordine
- Base mobile-first; poi `min-width: 600`, `768`, `1024`; override mobile/tablet con `max-width: 1023`, `1279`.
- Il blocco `max-width: 1023px` contiene sia regole carousel che menu mobile: meglio commentare o separare le sezioni per chiarezza.

## Catena altezze (come dovrebbe funzionare)
1. **Container**: `height: clamp(...)` (unica fonte).
2. **Wrapper**: come flex item in colonna, deve prendere lo spazio rimanente (`flex: 1 1 0%`, `min-height: 0`) sotto 1024px; su desktop può restare `height: 100%` se il layout è diverso (un solo “blocco” visivo).
3. **Carousel**: `height: 100%` del wrapper, `display: flex`, `align-items: center`.
4. **Slot (.gallery-photo)**: `height: 100%` del carousel; con `align-items: center` sul carousel lo slot è centrato; se lo slot ha dimensione intrinseca (es. immagine con aspect ratio), resta centrato nel rosso.

## Interventi consigliati (in ordine)
1. Correggere il blocco orfano GALLERY GRID (spostare in @media 1024 o rimuovere duplicato).
2. Sotto 1024px: wrapper con `flex: 1 1 0%` e `min-height: 0` nel contesto `.personale-carousel-container`; lasciare `align-items: center` sul carousel; eventualmente `align-self: center` sullo slot per sicurezza.
3. Rimuovere i colori debug.
4. Consolidare le regole scrollbar del carousel (tenere in base, rimuovere duplicato desktop se identico).
5. (Opzionale) Raggruppare/commentare le sezioni carousel e valutare classe condivisa per personale/food/panel.
