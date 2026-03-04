// menu-cards.js
// Gestione interattiva delle card menu

document.addEventListener('DOMContentLoaded', function () {
  // Espandi/riduci dettagli al click sulla card
  document.querySelectorAll('.menu-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      // Evita conflitto con bottone immagine
      if (e.target.classList.contains('toggle-img-btn')) return;
      const details = card.querySelector('.details');
      if (details) details.classList.toggle('hidden');
    });
  });

  // Mostra/nascondi immagine al click sul bottone
  document.querySelectorAll('.toggle-img-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const img = btn.closest('.menu-card').querySelector('img');
      if (img) img.classList.toggle('hidden');
    });
  });
});
