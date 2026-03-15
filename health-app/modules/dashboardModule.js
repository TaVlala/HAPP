// HAPP — Dashboard Module
// Loads and renders: stat cards, compliance metrics, weekly deltas, plan progress

const DashboardModule = {

  async init() {
    await this.render();
  },

  async render() {
    await this._renderStatCards();
    this._renderPlanDays();
  },

  // ── Stat Cards ─────────────────────────────────────────────────────────────

  async _renderStatCards() {
    const [bodyHistory, complianceData, profile] = await Promise.all([
      StorageService.getBodyHistory(),
      StorageService.getCompliance(),
      StorageService.getProfile(),
    ]);

    const latest   = bodyHistory && bodyHistory.length ? bodyHistory[bodyHistory.length - 1] : null;
    const prev7    = bodyHistory && bodyHistory.length > 1
      ? bodyHistory.slice(-8, -1)
      : [];
    const weekAgo  = prev7.length ? prev7[prev7.length - 1] : null;

    const weight      = latest ? latest.weight : null;
    const bodyFat     = latest ? latest.bodyFat : null;
    const weightDelta = (weight && weekAgo && weekAgo.weight) ? (weight - weekAgo.weight) : null;
    const fatDelta    = (bodyFat && weekAgo && weekAgo.bodyFat) ? (bodyFat - weekAgo.bodyFat) : null;

    // Compliance stats
    const todayKey   = ComplianceService.todayKey();
    const todayComp  = complianceData[todayKey] || { completed: [], total: 0, pct: 0 };
    const last7      = ComplianceService.last7Days().map(k => complianceData[k] || { completed: [], total: 0, pct: 0 });
    const weeklyAvg  = ComplianceService.calcWeeklyAverage(last7.map(d => ({ completed: d.completed ? d.completed.length : 0, total: d.total || 0 })));

    // Plan days
    const planStart  = profile ? profile.planStart : null;
    const planDays   = planStart ? Math.max(1, Math.floor((Date.now() - new Date(planStart)) / 86400000) + 1) : null;

    // Active supplement count
    const activeCount = typeof SupplementsModule !== 'undefined' ? SupplementsModule.getActiveCount() : 0;

    const cards1 = [
      {
        label: 'Current Weight',
        value: weight ? `${weight} kg` : '—',
        sub: weightDelta !== null ? `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} kg this week` : 'No data yet',
        subColor: weightDelta !== null ? (weightDelta <= 0 ? 'var(--accent2)' : 'var(--danger)') : 'var(--muted)',
        icon: '⚖️',
        accent: 'var(--accent)',
      },
      {
        label: 'Body Fat',
        value: bodyFat ? `${bodyFat}%` : '—',
        sub: fatDelta !== null ? `${fatDelta > 0 ? '+' : ''}${fatDelta.toFixed(1)}% this week` : 'No data yet',
        subColor: fatDelta !== null ? (fatDelta <= 0 ? 'var(--accent2)' : 'var(--danger)') : 'var(--muted)',
        icon: '📉',
        accent: 'var(--purple)',
      },
      {
        label: 'Compliance Today',
        value: `${todayComp.pct || 0}%`,
        sub: `${todayComp.completed ? todayComp.completed.length : 0} of ${todayComp.total || 0} supplements`,
        subColor: (todayComp.pct || 0) >= 80 ? 'var(--accent2)' : (todayComp.pct || 0) >= 50 ? 'var(--warn)' : 'var(--danger)',
        icon: '✅',
        accent: 'var(--accent2)',
      },
      {
        label: '7-Day Average',
        value: `${Math.round(weeklyAvg * 100)}%`,
        sub: 'Supplement compliance',
        subColor: weeklyAvg >= 0.8 ? 'var(--accent2)' : weeklyAvg >= 0.5 ? 'var(--warn)' : 'var(--danger)',
        icon: '📊',
        accent: 'var(--warn)',
      },
    ];

    const cards2 = [
      {
        label: 'Active Supplements',
        value: activeCount,
        sub: 'Currently tracking',
        subColor: 'var(--muted)',
        icon: '💊',
        accent: 'var(--rx)',
      },
      {
        label: 'Days on Plan',
        value: planDays ? `Day ${planDays}` : '—',
        sub: planStart ? `Started ${planStart}` : 'Set start date in Settings',
        subColor: 'var(--muted)',
        icon: '📅',
        accent: 'var(--accent)',
      },
      {
        label: 'Weight Trend',
        value: weightDelta !== null ? (weightDelta < 0 ? '↓ Down' : weightDelta > 0 ? '↑ Up' : '→ Stable') : '—',
        sub: weightDelta !== null ? `${Math.abs(weightDelta).toFixed(1)} kg vs last week` : 'Log weight to track',
        subColor: weightDelta !== null ? (weightDelta <= 0 ? 'var(--accent2)' : 'var(--danger)') : 'var(--muted)',
        icon: '📈',
        accent: 'var(--accent2)',
      },
      {
        label: 'Fat Trend',
        value: fatDelta !== null ? (fatDelta < 0 ? '↓ Down' : fatDelta > 0 ? '↑ Up' : '→ Stable') : '—',
        sub: fatDelta !== null ? `${Math.abs(fatDelta).toFixed(1)}% vs last week` : 'Log body fat to track',
        subColor: fatDelta !== null ? (fatDelta <= 0 ? 'var(--accent2)' : 'var(--danger)') : 'var(--muted)',
        icon: '🔥',
        accent: 'var(--purple)',
      },
    ];

    const grid1 = document.getElementById('stat-grid');
    const grid2 = document.getElementById('stat-grid-2');
    if (grid1) grid1.innerHTML = cards1.map(c => Cards.statCard(c)).join('');
    if (grid2) grid2.innerHTML = cards2.map(c => Cards.statCard(c)).join('');

    // Render weekly compliance bar chart (mini sparkline in compliance card)
    this._renderComplianceSparkline(last7);
  },

  _renderPlanDays() {
    // Nothing extra needed — handled in stat cards
  },

  _renderComplianceSparkline(last7) {
    // Simple inline bars rendered in the compliance section
    const container = document.getElementById('compliance-sparkline');
    if (!container) return;
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    container.innerHTML = last7.map((d, i) => {
      const pct = d.total > 0 ? Math.round((d.completed ? d.completed.length : 0) / d.total * 100) : 0;
      const color = pct >= 80 ? 'var(--accent2)' : pct >= 50 ? 'var(--warn)' : pct === 0 ? 'var(--surface3)' : 'var(--danger)';
      return `
        <div class="spark-bar-wrap">
          <div class="spark-bar" style="height:${Math.max(4, pct * 0.6)}px; background:${color}" title="${pct}%"></div>
          <div class="spark-label">${days[i] || ''}</div>
        </div>
      `;
    }).join('');
  },
};
