// HAPP — Sidebar UI
// Desktop sidebar navigation + renders itself into #sidebar

const Sidebar = {
  NAV_ITEMS: [
    { id: 'dashboard',    label: 'Dashboard',    icon: '⬛', color: '#4f9cf0' },
    { id: 'schedule',     label: 'Daily Schedule', icon: '💊', color: '#63d4a8' },
    { id: 'measurements', label: 'Measurements',  icon: '📊', color: '#a78bfa' },
    { id: 'archive',      label: 'Archive',       icon: '📁', color: '#f0a84f' },
    { id: 'supplements',  label: 'Supplements',   icon: '💊', color: '#63d4a8' },
    { id: 'settings',     label: 'Settings',      icon: '⚙️', color: '#7a8099' },
  ],

  render() {
    const el = document.getElementById('sidebar');
    if (!el) return;
    el.innerHTML = `
      <div class="sidebar-logo">
        <div class="logo-title">HAPP</div>
        <div class="logo-sub">Health Tracker</div>
      </div>
      <div class="sidebar-nav">
        ${this.NAV_ITEMS.map(item => `
          <div class="sidebar-item ${item.id === 'dashboard' ? 'active' : ''}"
               data-nav="${item.id}"
               onclick="Router.navigate('${item.id}')">
            <span class="sidebar-dot" style="background:${item.color}"></span>
            <span class="sidebar-label">${item.label}</span>
          </div>
        `).join('')}
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-footer-text">David's Health Plan</div>
        <div class="sidebar-footer-sub">March 2026</div>
      </div>
    `;
  },

  setActive(page) {
    document.querySelectorAll('.sidebar-item').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === page);
    });
    document.querySelectorAll('.mobile-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === page);
    });
  }
};
