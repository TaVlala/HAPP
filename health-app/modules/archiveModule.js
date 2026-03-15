// HAPP — Archive Module
// Displays all stopped/completed supplements
// Nothing is permanently deleted — everything archived with stop date
// Restore returns a supplement to Active with a fresh start date

const ArchiveModule = {

  _archive: [],

  async init() {
    this._archive = await StorageService.getArchive() || [];
    await this.render();
  },

  async render() {
    const container = document.getElementById('archive-content');
    if (!container) return;

    this._archive = await StorageService.getArchive() || [];

    if (!this._archive.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div style="font-size:32px;margin-bottom:12px">📁</div>
          <div>No archived supplements yet.</div>
          <div style="font-size:12px;margin-top:8px;color:var(--muted)">When you stop a supplement it will appear here.<br>You can restore it at any time.</div>
        </div>`;
      return;
    }

    // Sort by archivedAt descending (most recent first)
    const sorted = [...this._archive].sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));

    container.innerHTML = `
      <div class="archive-list">
        ${sorted.map(item => this._renderArchiveCard(item)).join('')}
      </div>
    `;
  },

  _renderArchiveCard(item) {
    const seed = typeof SUPPLEMENT_SEED !== 'undefined'
      ? SUPPLEMENT_SEED.find(s => s.id === item.id)
      : null;

    const name       = item.name || (seed ? seed.name : item.id);
    const stopDate   = item.stopDate  || (item.archivedAt ? new Date(item.archivedAt).toISOString().split('T')[0] : '—');
    const startDate  = item.startDate || '—';
    const daysOn     = item.daysOn    != null ? item.daysOn : (startDate !== '—' && stopDate !== '—' ? this._calcDays(startDate, stopDate) : '—');
    const archivedAt = item.archivedAt ? new Date(item.archivedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const isCustom   = item.isCustom  || false;

    // Get seed metadata for display
    const dose   = seed ? seed.dose   : (item.dose   || '');
    const why    = seed ? seed.why    : '';
    const phase  = seed ? seed.phase_label : '';

    return `
      <div class="archive-card" id="archive-card-${item.id}">
        <div class="archive-card-header">
          <div class="archive-card-left">
            <span class="supp-name">${name}</span>
            ${isCustom ? '<span class="badge badge-muted">Custom</span>' : ''}
            ${phase    ? `<span class="badge badge-muted" style="font-size:9px">${phase}</span>` : ''}
          </div>
          <div class="archive-card-actions">
            <button class="btn btn-primary btn-sm" onclick="ArchiveModule.restore('${item.id}')">
              ↩ Restore
            </button>
            <button class="btn btn-danger btn-sm" onclick="ArchiveModule.permanentDelete('${item.id}', '${name.replace(/'/g, "\\'")}')">
              🗑 Delete
            </button>
          </div>
        </div>

        <div class="archive-meta">
          <div class="archive-meta-item">
            <span class="detail-label">Started</span>
            <span class="detail-val">${startDate}</span>
          </div>
          <div class="archive-meta-item">
            <span class="detail-label">Stopped</span>
            <span class="detail-val">${stopDate}</span>
          </div>
          <div class="archive-meta-item">
            <span class="detail-label">Days taken</span>
            <span class="detail-val">${daysOn}</span>
          </div>
          <div class="archive-meta-item">
            <span class="detail-label">Archived</span>
            <span class="detail-val">${archivedAt}</span>
          </div>
        </div>

        ${dose ? `<div style="font-size:12px;color:var(--muted);margin-top:8px">📦 ${dose}</div>` : ''}
        ${why  ? `<div style="font-size:12px;color:var(--muted);margin-top:4px;line-height:1.4">${why}</div>` : ''}
      </div>
    `;
  },

  async restore(id) {
    const item = this._archive.find(a => a.id === id);
    if (!item) return;

    const name = item.name || id;
    if (!confirm(`Restore "${name}"? It will be set to Active with today as the new start date.`)) return;

    // Remove from archive
    await StorageService.removeFromArchive(id);

    // Restart the supplement via SupplementsModule
    if (typeof SupplementsModule !== 'undefined') {
      await SupplementsModule.startSupplement(id);
    }

    // Re-render archive
    await this.render();

    // Show toast
    this._showToast(`↩ Restored: ${name}`);
  },

  async permanentDelete(id, name) {
    if (!confirm(`Permanently delete "${name}"?\n\nThis cannot be undone. The supplement record will be gone forever.`)) return;

    await StorageService.removeFromArchive(id);
    await this.render();
    this._showToast(`🗑 Deleted: ${name}`);
  },

  _calcDays(startDate, stopDate) {
    try {
      const start = new Date(startDate);
      const stop  = new Date(stopDate);
      const diff  = Math.floor((stop - start) / (1000 * 60 * 60 * 24));
      return Math.max(0, diff) + 1;
    } catch { return '—'; }
  },

  _showToast(msg) {
    if (typeof SupplementsModule !== 'undefined') {
      SupplementsModule._showToast(msg);
    }
  },

  getArchivedCount() {
    return this._archive.length;
  },
};
