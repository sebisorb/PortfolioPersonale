// menu-piatti.js
// Gestione cambio sezione menu senza ricaricare la pagina

document.addEventListener('DOMContentLoaded', function() {
      const activeClass = 'bg-white/80 border border-white text-black'; // personalizza qui le classi attive
      document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const cat = this.getAttribute('data-category');
          document.querySelectorAll('.menu-section').forEach(sec => {
            sec.style.display = (sec.getAttribute('data-category') === cat) ? '' : 'none';
          });
          // Rimuovi tutte le possibili classi attive da tutti i bottoni
          document.querySelectorAll('.category-btn').forEach(b => {
            b.classList.remove(
              'bg-white/40', 'bg-white/60', 'bg-white/80', 'bg-white',
              'border', 'border-white', 'text-black'
            );
          });
          // Aggiungi la classe attiva solo al bottone selezionato
          this.classList.add(...activeClass.split(' '));
        });
      });
});

// Quando selezioni una categoria
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('menu-intro').classList.add('hidden');
  });
});