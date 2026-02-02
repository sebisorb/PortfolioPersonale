# Performance – font e sfondo

Indicazioni per ottimizzare caricamento e LCP **senza modificare i file binari**. Puoi applicarle quando vorrai dare una passata alle performance.

## Font (Google Fonts)

- **Situazione attuale:** nei vari HTML c’è già `display=swap` nell’URL dei font (Oswald, Montserrat). Il parametro `display=swap` fa mostrare il testo con font di fallback finché i font non sono caricati, riducendo il rischio di testo invisibile (FOIT).

- **Possibili miglioramenti (opzionali):**
  - **Subsetting:** nell’URL Google Fonts puoi restringere a `&text=...` o usare subset (es. `latin,latin-ext`) se non servi tutti i caratteri.
  - **Self‑hosting:** scaricare i file woff2 e servirli dal tuo sito riduce richieste a domini esterni e migliora il controllo sulla cache. In quel caso imposta `font-display: swap` nelle `@font-face`.
  - **Preload:** se il font è critico per il titolo/hero, in `<head>` puoi aggiungere ad es.  
    `<link rel="preload" href="url-del-font.woff2" as="font" type="font/woff2" crossorigin>`  
    (solo se hai deciso di usare font self‑hosted).

## Sfondo (img/ph/sfondowide.png)

- **Dove viene usato:**  
  `stile.css` – `body::before` (circa riga 94) e eventuali media query desktop (es. ~riga 1697). È lo sfondo principale del sito.

- **Senza toccare il file binario ora**, quando vorrai ottimizzare:
  1. **Peso:** comprimere/converted in strumenti esterni (TinyPNG, Squoosh, ecc.) e sostituire il file mantenendo lo stesso nome/path, così non serve cambiare il CSS.
  2. **Formato moderno:** creare una versione WebP (e opzionalmente AVIF) di `sfondowide.png`, poi in CSS usare `@supports` o più `background-image` con `url('img/ph/sfondowide.webp')` e fallback `url('img/ph/sfondowide.png')`. Oppure usare `<picture>`/immagini responsive solo se decidi di gestire lo sfondo via HTML.
  3. **Dimensioni:** se l’immagine è molto grande rispetto alla massima larghezza usata in layout, ridimensionarla (es. max 1920px di larghezza) prima di sostituirla riduce il tempo di download.

Queste note sono solo promemoria; nessun file binario è stato modificato.

---

*Promemoria creato il 27/01/2025.*
