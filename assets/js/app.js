// Register the service worker so the app can be installed & work offline.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

// Tiny interaction sugar: let the segmented control / month pills feel alive.
document.addEventListener('click', (e) => {
  const seg = e.target.closest('.segment button');
  if (seg) {
    seg.parentElement.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
    seg.classList.add('active');
  }

  const month = e.target.closest('.months .month');
  if (month) {
    month.parentElement.querySelectorAll('.month').forEach((m) => m.classList.remove('active'));
    month.classList.remove('dashed');
    month.classList.add('active');
  }
});
