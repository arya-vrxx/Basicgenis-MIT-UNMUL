document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('panic-toggle-btn');
  toggle?.setAttribute('aria-expanded', 'true');
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
