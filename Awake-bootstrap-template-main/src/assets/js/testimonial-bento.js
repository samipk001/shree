// Simple vanilla carousel for the testimonial MagicBento area
document.addEventListener('DOMContentLoaded', function () {
  const slides = Array.from(document.querySelectorAll('#testimonial-bento .tb-slide'));
  if (!slides.length) return;
  let idx = 0;
  const show = i => {
    slides.forEach((s, j) => s.classList.toggle('active', j === i));
  };

  document.getElementById('tb-prev')?.addEventListener('click', () => {
    idx = (idx - 1 + slides.length) % slides.length;
    show(idx);
  });
  document.getElementById('tb-next')?.addEventListener('click', () => {
    idx = (idx + 1) % slides.length;
    show(idx);
  });

  // Auto-advance
  setInterval(() => {
    idx = (idx + 1) % slides.length;
    show(idx);
  }, 4500);
});
