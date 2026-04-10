// menu-data.js
// =============================================
// MODIFICA QUI per aggiungere, rimuovere o
// cambiare i piatti del menu.
//
// Struttura di ogni piatto:
// {
//   id:          string   — identificativo unico (usato per i preferiti)
//   name:        string   — nome del piatto
//   price:       string   — prezzo (es. "€12")
//   category:    string   — categoria principale: "antipasti" | "primi" | "secondi" | "dolci" | "bevande"
//   subCategory: string   — sotto-categoria:
//                           per antipasti/primi/secondi/dolci: "veg" | "carne" | "pollo" | "pesce"
//                           per bevande: "bibite" | "birra" | "vini" | "cocktail"
//   img:         string   — percorso immagine (es. "img/foto/food/studio1.webp")
//   imgAlt:      string   — testo alternativo immagine (accessibilità)
//   description: string   — breve descrizione del piatto (visibile nell'overlay)
//   ingredients: string[] — lista ingredienti
//   allergens:   string[] — allergeni tra: "Glutine" | "Lattosio" | "Uova" | "Pesce"
//                           | "Frutta a guscio" | "Sedano" | "Soia" | "Senape"
//                           Lascia [] se nessun allergene.
// }
// =============================================

const MENU_DATA = [

  // ── ANTIPASTI (SFIZIO) ────────────────────────────────────────
  {
    id: "bruschetta-pomodoro",
    name: "Bruschette al Pomodoro",
    price: "€12",
    category: "antipasti",
    subCategory: "veg",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Bruschette al Pomodoro",
    description: "Pane casereccio tostato, condito con pomodori freschi, basilico e un filo d'olio extravergine d'oliva.",
    ingredients: ["Pane casereccio", "Pomodori freschi", "Basilico", "Olio EVO", "Aglio", "Sale"],
    allergens: ["Glutine"],
  },
  {
    id: "tagliere-salumi",
    name: "Tagliere di Salumi",
    price: "€20",
    category: "antipasti",
    subCategory: "carne",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Tagliere di Salumi",
    description: "Selezione di salumi artigianali italiani con pane tostato e mostarda.",
    ingredients: ["Prosciutto crudo", "Salame Milano", "Mortadella", "Coppa", "Pane tostato", "Mostarda"],
    allergens: ["Glutine", "Senape"],
  },
  {
    id: "olive-ascolana",
    name: "Olive all'Ascolana",
    price: "€6",
    category: "antipasti",
    subCategory: "veg",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Olive all'Ascolana",
    description: "Olive verdi farcite con un ripieno saporito, impanate e fritte fino alla perfezione.",
    ingredients: ["Olive verdi", "Carne macinata", "Uova", "Pangrattato", "Parmigiano", "Noce moscata", "Olio per friggere"],
    allergens: ["Glutine", "Uova", "Lattosio"],
  },
  {
    id: "polpettine-pollo",
    name: "Polpettine di Pollo",
    price: "€12",
    category: "antipasti",
    subCategory: "pollo",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Polpettine di Pollo",
    description: "Morbide polpettine di pollo alle erbe aromatiche, servite con salsa allo yogurt.",
    ingredients: ["Petto di pollo", "Erbe aromatiche", "Aglio", "Pangrattato", "Uova", "Yogurt greco", "Limone"],
    allergens: ["Glutine", "Uova", "Lattosio"],
  },
  {
    id: "alici-marinate",
    name: "Alici Marinate",
    price: "€20",
    category: "antipasti",
    subCategory: "pesce",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Alici Marinate",
    description: "Alici fresche marinate in limone e olio EVO, con prezzemolo e peperoncino.",
    ingredients: ["Alici fresche", "Limone", "Olio EVO", "Prezzemolo", "Peperoncino", "Aglio"],
    allergens: ["Pesce"],
  },

  // ── PIZZA (PRIMI) ─────────────────────────────────────────────
  {
    id: "spaghetti-alla-carbonara",
    name: "Spaghetti alla Carbonara",
    price: "€12",
    category: "primi",
    subCategory: "carne",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Spaghetti alla Carbonara",
    description: "La ricetta romana per eccellenza: spaghetti con guanciale croccante, uova, pecorino e pepe nero.",
    ingredients: ["Spaghetti", "Guanciale", "Uova", "Pecorino Romano", "Pepe nero"],
    allergens: ["Glutine", "Uova", "Lattosio"],
  },
  {
    id: "risotto-ai-funghi-porcini",
    name: "Risotto ai Funghi Porcini",
    price: "€20",
    category: "primi",
    subCategory: "veg",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Risotto ai Funghi Porcini",
    description: "Risotto mantecato con funghi porcini freschi, vino bianco e parmigiano.",
    ingredients: ["Riso Carnaroli", "Funghi porcini", "Cipolla", "Vino bianco", "Burro", "Parmigiano", "Brodo vegetale"],
    allergens: ["Lattosio"],
  },
  {
    id: "lasagna-bolognese",
    name: "Lasagna alla Bolognese",
    price: "€20",
    category: "primi",
    subCategory: "carne",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Lasagna alla Bolognese",
    description: "Lasagna tradizionale con ragù di carne, besciamella e parmigiano gratinato.",
    ingredients: ["Sfoglie di pasta", "Ragù di manzo e maiale", "Besciamella", "Parmigiano", "Pomodoro", "Cipolla", "Carota", "Sedano"],
    allergens: ["Glutine", "Lattosio", "Uova", "Sedano"],
  },
  {
    id: "pasta-al-pollo",
    name: "Pasta al Pollo",
    price: "€12",
    category: "primi",
    subCategory: "pollo",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Pasta al Pollo",
    description: "Pasta con bocconcini di pollo, pomodorini, olive e basilico fresco.",
    ingredients: ["Pasta", "Petto di pollo", "Pomodorini", "Olive", "Basilico", "Olio EVO", "Aglio"],
    allergens: ["Glutine"],
  },
  {
    id: "linguine-allo-scoglio",
    name: "Linguine allo Scoglio",
    price: "€22",
    category: "primi",
    subCategory: "pesce",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Linguine allo Scoglio",
    description: "Linguine con frutti di mare misti: vongole, cozze, gamberi e calamari in salsa di pomodoro fresco.",
    ingredients: ["Linguine", "Vongole", "Cozze", "Gamberi", "Calamari", "Pomodoro fresco", "Aglio", "Prezzemolo", "Vino bianco"],
    allergens: ["Glutine", "Pesce"],
  },

  // ── BURGER (SECONDI) ──────────────────────────────────────────
  {
    id: "bistecca-alla-fiorentina",
    name: "Bistecca alla Fiorentina",
    price: "€22",
    category: "secondi",
    subCategory: "carne",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Bistecca alla Fiorentina",
    description: "Bistecca di manzo chianina alla brace, servita con rosmarino e olio EVO. Peso circa 600g.",
    ingredients: ["Manzo Chianina", "Rosmarino", "Olio EVO", "Sale grosso", "Pepe nero"],
    allergens: [],
  },
  {
    id: "pollo-al-limone",
    name: "Pollo al Limone",
    price: "€16",
    category: "secondi",
    subCategory: "pollo",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Pollo al Limone",
    description: "Petto di pollo in salsa al limone e timo fresco, con contorno di patate arrosto.",
    ingredients: ["Petto di pollo", "Limone", "Timo", "Aglio", "Olio EVO", "Patate", "Rosmarino"],
    allergens: [],
  },
  {
    id: "branzino-al-forno",
    name: "Branzino al Forno",
    price: "€24",
    category: "secondi",
    subCategory: "pesce",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Branzino al Forno",
    description: "Branzino intero al forno con olive, capperi, pomodorini e patate.",
    ingredients: ["Branzino", "Olive", "Capperi", "Pomodorini", "Patate", "Olio EVO", "Prezzemolo", "Limone"],
    allergens: ["Pesce"],
  },
  {
    id: "parmigiana-di-melanzane",
    name: "Parmigiana di Melanzane",
    price: "€12",
    category: "secondi",
    subCategory: "veg",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Parmigiana di Melanzane",
    description: "Melanzane fritte a strati con salsa di pomodoro, fior di latte e basilico, gratinate al forno.",
    ingredients: ["Melanzane", "Fior di latte", "Salsa di pomodoro", "Parmigiano", "Basilico", "Olio per friggere"],
    allergens: ["Lattosio"],
  },

  // ── DOLCI ─────────────────────────────────────────────────────
  {
    id: "tiramisu",
    name: "Tiramisù",
    price: "€12",
    category: "dolci",
    subCategory: "veg",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Tiramisù",
    description: "Il classico tiramisù della tradizione: savoiardi al caffè, crema al mascarpone e cacao amaro.",
    ingredients: ["Savoiardi", "Mascarpone", "Uova", "Zucchero", "Caffè espresso", "Cacao amaro"],
    allergens: ["Glutine", "Uova", "Lattosio"],
  },
  {
    id: "panna-cotta",
    name: "Panna Cotta",
    price: "€12",
    category: "dolci",
    subCategory: "veg",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Panna Cotta",
    description: "Panna cotta alla vaniglia con coulis di frutti di bosco freschi.",
    ingredients: ["Panna fresca", "Zucchero", "Vaniglia", "Gelatina", "Frutti di bosco"],
    allergens: ["Lattosio"],
  },
  {
    id: "crostata-di-frutta",
    name: "Crostata di Frutta",
    price: "€12",
    category: "dolci",
    subCategory: "veg",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Crostata di Frutta",
    description: "Frolla burrosa con crema pasticcera e frutta fresca di stagione.",
    ingredients: ["Pasta frolla", "Crema pasticcera", "Frutta fresca di stagione", "Gelatina neutra"],
    allergens: ["Glutine", "Uova", "Lattosio"],
  },

  // ── BEVANDE ───────────────────────────────────────────────────
  {
    id: "acqua-naturale",
    name: "Acqua Naturale",
    price: "€6",
    category: "bevande",
    subCategory: "bibite",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Acqua Naturale",
    description: "Acqua minerale naturale in bottiglia da 1L.",
    ingredients: ["Acqua minerale naturale"],
    allergens: [],
  },
  {
    id: "vino-rosso",
    name: "Vino Rosso",
    price: "€12",
    category: "bevande",
    subCategory: "vini",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Vino Rosso",
    description: "Selezione di vino rosso della casa, servito al calice o a bottiglia.",
    ingredients: ["Uva rossa", "Solfiti"],
    allergens: [],
  },
  {
    id: "birra-artigianale",
    name: "Birra Artigianale",
    price: "€6",
    category: "bevande",
    subCategory: "birra",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Birra Artigianale",
    description: "Birra artigianale locale, produzione limitata. Chiedi al cameriere la selezione del giorno.",
    ingredients: ["Malto d'orzo", "Luppolo", "Lievito", "Acqua"],
    allergens: ["Glutine"],
  },
  {
    id: "cocktail",
    name: "Cocktail",
    price: "€8",
    category: "bevande",
    subCategory: "cocktail",
    img: "img/foto/food/studio1.webp",
    imgAlt: "Cocktail",
    description: "Selezione di cocktail classici e della casa. Chiedi al barman le proposte del giorno.",
    ingredients: ["Varia in base alla scelta"],
    allergens: [],
  },

];