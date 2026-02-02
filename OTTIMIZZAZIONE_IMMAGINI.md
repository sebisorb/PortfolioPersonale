# 📸 Guida all'Ottimizzazione delle Immagini per il Sito

## Perché ottimizzare?

Le immagini non ottimizzate causano:
- ⚠️ **Caricamento lento** del sito (scatti iniziali)
- 📱 **Consumo dati** eccessivo su mobile
- 🔍 **Peggiore SEO** (Google penalizza siti lenti)
- 😞 **Esperienza utente** negativa

---

## 🎯 Obiettivi di Ottimizzazione

### Dimensioni File
- **Lato lungo**: 1600-2000px (massimo)
- **Peso file**: 100-300 KB per immagine (ideale)
- **Formato**: JPG qualità 70-80% (o WebP se supportato)

### Formati Consigliati
- **JPG**: Per foto (food, ritratti, eventi)
- **PNG**: Solo per loghi/icone con trasparenza
- **WebP**: Formato moderno (più leggero, supporto crescente)

---

## 📐 Dimensioni per le Gallerie

### Food Photography (`food.html`)
- **Mobile**: Altezza visualizzata ~260px
- **Desktop**: Altezza visualizzata ~450px
- **Esportazione consigliata**: Lato lungo **1800px**, JPG qualità **75%**

### Altre Gallerie
- Stessa logica: esporta a **1800px** lato lungo, qualità **75%**

---

## 🛠️ Come Esportare (Lightroom / Photoshop)

### Lightroom Classic
1. Seleziona le foto → **File → Esporta**
2. **Dimensioni immagine**:
   - ✅ Spunta "Ridimensiona per adattare"
   - Seleziona "Lato lungo"
   - Imposta **1800 px**
3. **Impostazioni file**:
   - Formato: **JPEG**
   - Qualità: **75-80**
   - Spazio colore: **sRGB**
4. **Metadati**: Mantieni solo Copyright (rimuovi EXIF se non necessario)
5. Clicca **Esporta**

### Photoshop
1. **File → Esporta → Esporta come**
2. Formato: **JPG**
3. Qualità: **75-80**
4. **Immagine → Dimensione immagine**:
   - Se lato lungo > 1800px, ridimensiona a **1800px**
   - Mantieni proporzioni
5. Salva

### Online (alternativa)
- **Squoosh.app** (Google): Drag & drop, ridimensiona, comprimi
- **TinyPNG.com**: Supporta JPG e PNG

---

## ✅ Checklist Pre-Caricamento

Prima di caricare le immagini sul sito:

- [ ] Lato lungo ≤ 2000px
- [ ] Peso file < 300 KB
- [ ] Formato JPG (o WebP)
- [ ] Qualità 70-80%
- [ ] Spazio colore sRGB
- [ ] Nome file descrittivo (es: `live1.jpg`, non `IMG_1234.jpg`)

---

## 🚀 Risultati Attesi

Dopo l'ottimizzazione:
- ✅ Caricamento **2-3x più veloce**
- ✅ Nessun "scatto" iniziale
- ✅ Migliore esperienza mobile
- ✅ SEO migliorato
- ✅ Meno consumo dati

---

## 📝 Note Tecniche

### Attributi HTML già implementati:
- `loading="lazy"` - Carica immagini solo quando visibili
- `decoding="async"` - Decodifica asincrona (non blocca il rendering)

### CSS:
- Le immagini sono già responsive (`max-width: 100%`)
- Altezze fisse per evitare layout shift

---

## 🔄 Workflow Consigliato

1. **Scatta/Seleziona** le foto migliori
2. **Post-produzione** (Lightroom/Photoshop)
3. **Esporta ottimizzate** (1800px, JPG 75%)
4. **Rinomina** con nomi descrittivi
5. **Carica** nella cartella `img/foto/food/`
6. **Testa** il sito per verificare velocità

---

## 📊 Strumenti di Verifica

- **Google PageSpeed Insights**: https://pagespeed.web.dev/
- **GTmetrix**: https://gtmetrix.com/
- **Chrome DevTools**: Network tab per vedere tempi di caricamento

---

**Ultimo aggiornamento**: 2024
**Mantieni questa guida aggiornata** quando aggiungi nuove categorie di foto!
