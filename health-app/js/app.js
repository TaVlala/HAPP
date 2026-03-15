// HAPP — App Entry Point
// Initialises all modules after DOM is ready

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[HAPP] App initialising...');

  // Register service worker (Phase 8)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.warn);
  }

  // Initialise router
  Router.init();

  console.log('[HAPP] App ready');
});
