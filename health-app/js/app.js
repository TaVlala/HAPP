// HAPP — App Entry Point

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[HAPP] Initialising...');

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Render sidebar
  Sidebar.render();

  // Run encryption self-test
  EncryptionService.selfTest();

  // Initialise router (shows dashboard by default)
  Router.init();

  // Set dashboard date
  const dateEl = document.getElementById('dashboard-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  console.log('[HAPP] Ready');
});
