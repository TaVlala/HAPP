// HAPP — Router

const PAGES = ['dashboard', 'schedule', 'measurements', 'archive', 'food', 'supplements', 'settings'];

const Router = {
  currentPage: 'dashboard',

  init() {
    this.navigate('dashboard');
  },

  navigate(page) {
    if (!PAGES.includes(page)) return;
    this.currentPage = page;

    // Switch visible page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    // Update nav active states
    Sidebar.setActive(page);

    // Update page date on dashboard
    if (page === 'dashboard') {
      const dateEl = document.getElementById('dashboard-date');
      if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-GB', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
      }
    }

    // Init food module on first visit
    if (page === 'food') FoodModule.init();

    // Scroll to top
    document.querySelector('.main-content').scrollTop = 0;

    console.log('[Router] →', page);
  }
};
