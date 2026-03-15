// HAPP — Supplements Reference Module
// Complete catalog view: dose, best form, timing, why, notes, interactions
// Used for shopping reference and full supplement overview
// Read-only — for toggling see supplementsModule.js (Daily Schedule)

const SupplementsRefModule = {

  _activeStatusFilter: 'all',
  _activeImpactFilter: 'all',
  _searchQuery: '',

  init() {
    this._attachFilters();
    this.render();
  },

  render() {
    this._renderSummary();
    this._renderGrid();
  },

  _attachFilters() {
    // Status filter pills
    const statusPills = document.querySelectorAll('#filter-status .filter-pill');
    statusPills.forEach(pill => {
      pill.addEventListener('click', () => {
        statusPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this._activeStatusFilter = pill.dataset.filter;
        this._renderGrid();
        this._renderSummary();
      });
    });

    // Impact filter pills
    const impactPills = document.querySelectorAll('#filter-impact .filter-pill');
    impactPills.forEach(pill => {
      pill.addEventListener('click', () => {
        impactPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this._activeImpactFilter = pill.dataset.filter;
        this._renderGrid();
        this._renderSummary();
      });
    });

    // Search
    const searchInput = document.getElementById('ref-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this._searchQuery = e.target.value.toLowerCase().trim();
        this._renderGrid();
        this._renderSummary();
      });
    }
  },

  _getFiltered() {
    return SUPPLEMENT_SEED.filter(s => {
      // Status filter
      if (this._activeStatusFilter !== 'all') {
        if (this._activeStatusFilter === 'active') {
          // "active" means status is 'active' or 'prescribed' in seed
          if (s.status !== 'active' && s.status !== 'prescribed') return false;
        } else {
          if (s.status !== this._activeStatusFilter) return false;
        }
      }

      // Impact filter
      if (this._activeImpactFilter !== 'all') {
        if (s.impact_level !== this._activeImpactFilter) return false;
      }

      // Search
      if (this._searchQuery) {
        const haystack = [
          s.name, s.dose, s.timing, s.why, s.best_form,
          s.notes, s.phase_label, s.impact_level, s.duration
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(this._searchQuery)) return false;
      }

      return true;
    });
  },

  _renderSummary() {
    const container = document.getElementById('ref-summary');
    if (!container) return;

    const filtered  = this._getFiltered();
    const total     = SUPPLEMENT_SEED.length;
    const byLevel   = {
      prescribed: SUPPLEMENT_SEED.filter(s => s.impact_level === 'prescribed').length,
      critical:   SUPPLEMENT_SEED.filter(s => s.impact_level === 'critical').length,
      high:       SUPPLEMENT_SEED.filter(s => s.impact_level === 'high').length,
      moderate:   SUPPLEMENT_SEED.filter(s => s.impact_level === 'moderate').length,
      hold:       SUPPLEMENT_SEED.filter(s => s.status === 'hold').length,
    };

    container.innerHTML = `
      <div class="ref-summary-row">
        <div class="ref-summary-pill" style="background:rgba(96,165,250,0.12);border-color:rgba(96,165,250,0.3);color:var(--rx)">
          🔵 ${byLevel.prescribed} Prescribed
        </div>
        <div class="ref-summary-pill" style="background:rgba(240,95,95,0.1);border-color:rgba(240,95,95,0.3);color:var(--danger)">
          🔴 ${byLevel.critical} Critical
        </div>
        <div class="ref-summary-pill" style="background:rgba(240,168,79,0.1);border-color:rgba(240,168,79,0.3);color:var(--warn)">
          🟡 ${byLevel.high} High
        </div>
        <div class="ref-summary-pill" style="background:rgba(99,212,168,0.1);border-color:rgba(99,212,168,0.3);color:var(--accent2)">
          🟢 ${byLevel.moderate} Moderate
        </div>
        <div class="ref-summary-pill" style="background:rgba(240,95,95,0.08);border-color:rgba(240,95,95,0.2);color:var(--muted)">
          ⏸ ${byLevel.hold} On Hold
        </div>
        ${filtered.length !== total ? `<div class="ref-summary-pill" style="background:var(--surface3);border-color:var(--border2);color:var(--accent)">Showing ${filtered.length} of ${total}</div>` : ''}
      </div>
    `;
  },

  _renderGrid() {
    const container = document.getElementById('ref-grid');
    if (!container) return;

    const filtered = this._getFiltered();

    if (!filtered.length) {
      container.innerHTML = '<div class="empty-state">No supplements match your filters.</div>';
      return;
    }

    // Sort: prescribed first, then by impact_rank
    const sorted = [...filtered].sort((a, b) => {
      const order = { prescribed: 0, active: 1, add: 2, defer: 3, hold: 4 };
      const ao = order[a.status] ?? 5;
      const bo = order[b.status] ?? 5;
      if (ao !== bo) return ao - bo;
      return (a.impact_rank ?? 99) - (b.impact_rank ?? 99);
    });

    container.innerHTML = sorted.map(s => this._renderCard(s)).join('');
  },

  _renderCard(s) {
    // Status badge
    const statusBadge = {
      prescribed: '<span class="badge badge-rx">🔵 Prescribed</span>',
      active:     '<span class="badge badge-active">● Active</span>',
      add:        '<span class="badge badge-add">' + (s.phase_label || 'Add') + '</span>',
      defer:      '<span class="badge badge-defer">Deferred</span>',
      hold:       '<span class="badge badge-hold">⚠ On Hold</span>',
    }[s.status] || '';

    // Impact badge
    const impactColors = {
      critical: { bg: 'rgba(240,95,95,0.12)', border: 'rgba(240,95,95,0.3)', color: 'var(--danger)' },
      high:     { bg: 'rgba(240,168,79,0.12)', border: 'rgba(240,168,79,0.3)', color: 'var(--warn)' },
      moderate: { bg: 'rgba(99,212,168,0.12)', border: 'rgba(99,212,168,0.3)', color: 'var(--accent2)' },
      optional: { bg: 'var(--surface3)', border: 'var(--border)', color: 'var(--muted)' },
    };
    const ic = impactColors[s.impact_level];
    const impactBadge = ic
      ? `<span class="badge" style="background:${ic.bg};border:1px solid ${ic.border};color:${ic.color}">${s.impact_level}</span>`
      : '';

    // Rank badge
    const rankBadge = s.impact_rank
      ? `<span class="ref-rank">#${s.impact_rank}</span>`
      : '';

    // Build detail rows — only show fields that have data
    const details = [
      { label: 'Dose',        val: s.dose },
      { label: 'Best form',   val: s.best_form },
      { label: 'Timing',      val: s.timing },
      { label: 'With food',   val: s.food_pairing },
      { label: 'Duration',    val: s.duration },
      { label: 'Water',       val: s.water !== 'Normal' && s.water ? s.water : null },
    ].filter(d => d.val);

    // Why row (full width)
    const whyRow = s.why
      ? `<div class="ref-detail-why"><span class="detail-label">Why</span><div class="detail-val" style="margin-top:4px">${s.why}</div></div>`
      : '';

    // Notes / warnings (full width, highlighted)
    const notesRow = s.notes
      ? `<div class="ref-detail-notes"><span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--warn)">⚠ Note</span><div class="detail-val" style="margin-top:4px;color:var(--warn)">${s.notes}</div></div>`
      : '';

    // Phase recommendation
    const phaseRow = (s.phase && s.phase !== 'now' && s.phase !== 'hold' && s.phase !== 'defer')
      ? `<div class="ref-phase-row">💡 Recommended: <strong>${s.phase_label}</strong></div>`
      : '';

    return `
      <div class="ref-card ${s.status === 'hold' ? 'ref-card-hold' : ''} ${s.status === 'defer' ? 'ref-card-defer' : ''}">
        <div class="ref-card-header">
          <div class="ref-card-title-row">
            ${rankBadge}
            <span class="supp-name">${s.name}</span>
          </div>
          <div class="ref-card-badges">
            ${statusBadge}
            ${impactBadge}
          </div>
        </div>

        ${phaseRow}

        <div class="ref-detail-grid">
          ${details.map(d => `
            <div class="detail-cell">
              <div class="detail-label">${d.label}</div>
              <div class="detail-val">${d.val}</div>
            </div>
          `).join('')}
        </div>

        ${whyRow}
        ${notesRow}
      </div>
    `;
  },
};
