# Da fare quando avrai il dominio

## Aggiornare gli URL (punto 2 – priorità alta)

Al momento gli **og:url** e **twitter:url** (e gli URL negli Schema.org) usano il placeholder:
`https://tuosito.github.io`

Quando avrai il **dominio reale** (es. `https://www.sebisorb.it`) o l’**URL GitHub Pages definitivo** (es. `https://tuousername.github.io/nome-repo`), sostituisci tutte le occorrenze nei file HTML.

### File da aggiornare e dove cercare

Cerca **`tuosito.github.io`** in:

- **index.html** → `og:url` (home, senza percorso)
- **Contatti.html** → `og:url`
- **Personale.html** → `og:url`
- **Video.html** → `og:url`
- **Profilo.html** → `og:url`
- **editoriali.html** → `og:url`
- **commissioni.html** → `og:url`
- **food.html** → `og:url` + `"url"` nello Schema.org JSON-LD
- **product.html** → `og:url` + `"url"` nello Schema.org JSON-LD

Sostituisci `https://tuosito.github.io` con il tuo URL base (es. `https://www.sebisorb.it`), mantenendo eventuali percorsi tipo `/Contatti.html`, `/product.html`, ecc.

---

*Promemoria creato il 27/01/2025 – aggiorna quando il sito è online.*
