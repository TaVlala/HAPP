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

  // Re-render modules on page navigation
  const origNavigate = Router.navigate.bind(Router);
  Router.navigate = async function(page) {
    origNavigate(page);
    if (page === 'dashboard') await DashboardModule.render();
    if (page === 'schedule') await SupplementsModule.render();
    if (page === 'settings') await SupplementsModule.renderAllSupplements('all-supplements-container');
  };

  // Set dashboard date
  const dateEl = document.getElementById('dashboard-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // Initialise supplements module
  await SupplementsModule.init();
  await SupplementsModule.render();

  // Initialise dashboard
  await DashboardModule.init();

  // Reset day button
  const resetBtn = document.getElementById('reset-day-btn');
  if (resetBtn) resetBtn.addEventListener('click', () => SupplementsModule.resetDay());

  // Render supplement manager in settings
  await SupplementsModule.renderAllSupplements('all-supplements-container');

  console.log('[HAPP] Ready');
});
