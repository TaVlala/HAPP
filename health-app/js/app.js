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

  // Sync encryption key across all devices via Firestore
  await EncryptionService.loadOrCreateKey();

  // Initialise router (shows dashboard by default)
  Router.init();

  // Re-render modules on page navigation
  const origNavigate = Router.navigate.bind(Router);
  Router.navigate = async function(page) {
    origNavigate(page);
    try {
      if (page === 'dashboard')    await DashboardModule.render();
      if (page === 'schedule')     await SupplementsModule.render();
      if (page === 'measurements') await MeasurementsModule.render();
      if (page === 'archive')      await ArchiveModule.render();
      if (page === 'supplements') await SupplementsRefModule.init();
      if (page === 'settings')     await SupplementsModule.renderAllSupplements('all-supplements-container');
    } catch(e) {
      console.error('[Router] Render error on', page, e);
    }
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

  // Initialise measurements module
  await MeasurementsModule.init();

  // Initialise archive module
  await ArchiveModule.init();

  // Initialise supplements reference page
  SupplementsRefModule.init();

  // Reset day button
  const resetBtn = document.getElementById('reset-day-btn');
  if (resetBtn) resetBtn.addEventListener('click', () => SupplementsModule.resetDay());

  // Render supplement manager in settings
  await SupplementsModule.renderAllSupplements('all-supplements-container');

  // Add custom supplement handler
  const addSuppBtn = document.getElementById('add-supp-btn');
  if (addSuppBtn) {
    addSuppBtn.addEventListener('click', async () => {
      const name   = document.getElementById('add-supp-name')?.value?.trim();
      const dose   = document.getElementById('add-supp-dose')?.value?.trim();
      const timing = document.getElementById('add-supp-timing')?.value?.trim();
      const notes  = document.getElementById('add-supp-notes')?.value?.trim();

      if (!name) { alert('Please enter a supplement name.'); return; }

      await SupplementsModule.addCustomSupplement({ name, dose, timing, notes });

      // Clear fields
      ['add-supp-name','add-supp-dose','add-supp-timing','add-supp-notes']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

      // Re-render manage list
      await SupplementsModule.renderAllSupplements('all-supplements-container');
    });
  }

  // Save settings handler
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      const planStart = document.getElementById('setting-plan-start')?.value;
      const name      = document.getElementById('setting-name')?.value?.trim();
      const profile   = await StorageService.getProfile() || {};
      if (planStart) profile.planStart = planStart;
      if (name)      profile.name      = name;
      await StorageService.saveProfile(profile);
      await DashboardModule.render();
      SupplementsModule._showToast('✅ Settings saved');
    });
  }

  // Encryption key handler
  const saveEncKeyBtn = document.getElementById('save-enc-key-btn');
  if (saveEncKeyBtn) {
    saveEncKeyBtn.addEventListener('click', async () => {
      const keyInput = document.getElementById('setting-enc-key');
      const newKey   = keyInput?.value?.trim();
      if (!newKey || newKey.length < 8) {
        alert('Key must be at least 8 characters.');
        return;
      }
      if (!confirm('Changing the encryption key will re-encrypt all local data. Continue?')) return;
      try {
        await EncryptionService.reEncryptAll(newKey);
        if (keyInput) keyInput.value = '';
        SupplementsModule._showToast('🔐 Encryption key updated');
      } catch (e) {
        alert('Error updating key: ' + e.message);
      }
    });
  }

  // Load saved settings into fields
  const profile = await StorageService.getProfile();
  if (profile) {
    const ps = document.getElementById('setting-plan-start');
    const sn = document.getElementById('setting-name');
    if (ps && profile.planStart) ps.value = profile.planStart;
    if (sn && profile.name)      sn.value = profile.name;
  }

  // Handle deep links (?page=schedule etc)
  const urlParams = new URLSearchParams(window.location.search);
  const deepPage  = urlParams.get('page');
  if (deepPage && ['dashboard','schedule','measurements','archive','food','supplements','settings'].includes(deepPage)) {
    Router.navigate(deepPage);
  }

  // PWA install prompt
  let _deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _deferredInstallPrompt = e;
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.style.display = 'flex';
  });

  const pwaInstallBtn  = document.getElementById('pwa-install');
  const pwaDismissBtn  = document.getElementById('pwa-dismiss');
  const pwaBanner      = document.getElementById('pwa-install-banner');

  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
      if (!_deferredInstallPrompt) return;
      _deferredInstallPrompt.prompt();
      const { outcome } = await _deferredInstallPrompt.userChoice;
      console.log('[PWA] Install outcome:', outcome);
      _deferredInstallPrompt = null;
      if (pwaBanner) pwaBanner.style.display = 'none';
    });
  }

  if (pwaDismissBtn) {
    pwaDismissBtn.addEventListener('click', () => {
      if (pwaBanner) pwaBanner.style.display = 'none';
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed!');
    if (pwaBanner) pwaBanner.style.display = 'none';
  });

  console.log('[HAPP] Ready');
});
