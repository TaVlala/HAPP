// HAPP — Card Components

const Cards = {

  statCard({ label, value, sub, subColor, icon, accent }) {
    return `
      <div class="stat-card">
        <div class="stat-card-top">
          <span class="stat-icon" style="background:${accent}22; color:${accent}">${icon}</span>
          <span class="stat-label">${label}</span>
        </div>
        <div class="stat-value">${value}</div>
        <div class="stat-sub" style="color:${subColor || 'var(--muted)'}">${sub}</div>
      </div>
    `;
  },
};
