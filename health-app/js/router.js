// HAPP — Router
// Handles page navigation between: dashboard, schedule, measurements, archive, settings

const PAGES = ['dashboard', 'schedule', 'measurements', 'archive', 'settings'];

const Router = {
  currentPage: 'dashboard',

  init() {
    this.navigate(this.currentPage);
  },

  navigate(page) {
    if (!PAGES.includes(page)) return;
    this.currentPage = page;

    // Hide all pages, show target
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    // Update nav active states
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === page);
    });

    console.log(`[Router] → ${page}`);
  }
};
