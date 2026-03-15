// HAPP — Measurements Module
// Weight + body fat logging, history table, weekly delta calculation

const MeasurementsModule = {

  _history: [],

  async init() {
    this._history = await StorageService.getBodyHistory() || [];
    await this.render();
    this._attachListeners();
  },

  async render() {
    this._renderHistory();
    Charts.renderWeightChart(this._history);
    Charts.renderFatChart(this._history);
  },

  _attachListeners() {
    const saveBtn = document.getElementById('save-measure-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveEntry());
    }
  },

  async saveEntry() {
    const weightEl  = document.getElementById('input-weight');
    const fatEl     = document.getElementById('input-bodyfat');
    const weight    = parseFloat(weightEl ? weightEl.value : '');
    const bodyFat   = parseFloat(fatEl ? fatEl.value : '');

    if (isNaN(weight) && isNaN(bodyFat)) {
      this._showMsg('Please enter at least one value (weight or body fat).', 'warn');
      return;
    }

    const entry = {
      weight:  isNaN(weight)  ? null : weight,
      bodyFat: isNaN(bodyFat) ? null : bodyFat,
    };

    const saveBtn = document.getElementById('save-measure-btn');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving...'; }

    this._history = await StorageService.addBodyEntry(entry);

    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Entry'; }

    // Clear inputs
    if (weightEl) weightEl.value = '';
    if (fatEl)    fatEl.value    = '';

    await this.render();

    // Refresh dashboard too
    if (typeof DashboardModule !== 'undefined') await DashboardModule.render();

    this._showMsg('✅ Entry saved!', 'ok');
  },

  _renderHistory() {
    const container = document.getElementById('measurements-history');
    if (!container) return;

    if (!this._history.length) {
      container.innerHTML = '<div class="empty-state">No entries yet.<br>Log your first measurement above.</div>';
      return;
    }

    // Show newest first
    const rows = [...this._history].reverse();

    const deltaRows = rows.map((entry, i) => {
      const prev = rows[i + 1] || null;
      const wDelta = (entry.weight && prev && prev.weight)
        ? (entry.weight - prev.weight).toFixed(1) : null;
      const fDelta = (entry.bodyFat && prev && prev.bodyFat)
        ? (entry.bodyFat - prev.bodyFat).toFixed(1) : null;

      const wDeltaHtml = wDelta !== null
        ? `<span style="color:${parseFloat(wDelta) <= 0 ? 'var(--accent2)' : 'var(--danger)'};font-size:11px"> (${parseFloat(wDelta) > 0 ? '+' : ''}${wDelta})</span>` : '';
      const fDeltaHtml = fDelta !== null
        ? `<span style="color:${parseFloat(fDelta) <= 0 ? 'var(--accent2)' : 'var(--danger)'};font-size:11px"> (${parseFloat(fDelta) > 0 ? '+' : ''}${fDelta}%)</span>` : '';

      const dateStr = entry.date || new Date(entry.timestamp).toLocaleDateString('en-GB');
      const timeStr = entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';

      return `
        <tr>
          <td>${dateStr} <span style="color:var(--muted);font-size:11px">${timeStr}</span></td>
          <td>${entry.weight != null ? entry.weight + ' kg' : '—'}${wDeltaHtml}</td>
          <td>${entry.bodyFat != null ? entry.bodyFat + '%' : '—'}${fDeltaHtml}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="MeasurementsModule.deleteEntry(${entry.timestamp})">✕</button>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight</th>
              <th>Body Fat</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${deltaRows.join('')}</tbody>
        </table>
      </div>
    `;
  },

  async deleteEntry(timestamp) {
    if (!confirm('Delete this entry?')) return;
    this._history = await StorageService.deleteBodyEntry(timestamp);
    await this.render();
    if (typeof DashboardModule !== 'undefined') await DashboardModule.render();
  },

  _showMsg(text, type) {
    let el = document.getElementById('measure-msg');
    if (!el) {
      el = document.createElement('p');
      el.id = 'measure-msg';
      el.style.cssText = 'font-size:13px;margin-top:10px;transition:opacity 0.3s';
      const form = document.querySelector('.measure-form-card');
      if (!form) return; // guard: form not in DOM yet
      form.appendChild(el);
    }
    el.textContent = text;
    el.style.color = type === 'ok' ? 'var(--accent2)' : 'var(--warn)';
    el.style.opacity = '1';
    setTimeout(() => { if (el) el.style.opacity = '0'; }, 3000);
  },

  getHistory() { return this._history; },
};
