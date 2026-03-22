// HAPP — Supplements Module
// Daily schedule, supplement lifecycle management, compliance tracking

const SupplementsModule = {

  _states: {},   // { [id]: userState }
  _todayChecked: new Set(), // supplement IDs checked today

  // ── Initialisation ────────────────────────────────────────────────────────

  async init() {
    // Load user supplement states from storage
    this._states = await StorageService.getSupplementStates() || {};

    // First run: seed from SUPPLEMENT_SEED
    if (Object.keys(this._states).length === 0) {
      await this._seedInitialStates();
    }

    // Load today's checked supplements
    const todayComp = await StorageService.getTodayCompliance();
    this._todayChecked = new Set(todayComp.completed || []);

    // Check for any expired courses
    this._checkCourseExpiry();

    console.log('[Supplements] Initialised:', Object.keys(this._states).length, 'supplements');
  },

  async _seedInitialStates() {
    const today = new Date().toISOString().split('T')[0];
    SUPPLEMENT_SEED.forEach(s => {
      const isAutoActive = s.status === 'prescribed' || s.status === 'active';
      this._states[s.id] = {
        id: s.id,
        name: s.name,
        status: isAutoActive ? 'active' : 'not_started',
        startDate: isAutoActive ? today : null,
        endDate: null,
        courseWeeks: s.course_weeks || null,
        isCustom: false,
      };
    });
    await StorageService.saveSupplementStates(this._states);
    console.log('[Supplements] Seeded initial states');
  },

  // ── Daily Schedule Render ─────────────────────────────────────────────────

  async render() {
    const container = document.getElementById('schedule-content');
    if (!container) return;

    // Group supplements by time block
    const timeBlocks = this._buildTimeBlocks();

    let html = '';

    if (timeBlocks.length === 0) {
      html += '<div class="empty-state">No active supplements.<br>Use the section below to start tracking.</div>';
    } else {
      html += timeBlocks.map(block => this._renderTimeBlock(block)).join('');
    }

    // Paused supplements section
    const paused = Object.values(this._states).filter(s => s.status === 'paused');
    if (paused.length > 0) {
      html += `<div class="manage-section">
        <div class="manage-section-title">⏸ Paused (${paused.length})</div>
        ${paused.map(s => this._renderInactiveCard(s.id, 'paused')).join('')}
      </div>`;
    }

    // Not started supplements section
    const notStarted = Object.values(this._states).filter(s => s.status === 'not_started');
    if (notStarted.length > 0) {
      html += `<div class="manage-section">
        <div class="manage-section-title">○ Not Started (${notStarted.length})</div>
        ${notStarted.map(s => this._renderInactiveCard(s.id, 'not_started')).join('')}
      </div>`;
    }

    container.innerHTML = html;

    // Attach toggle listeners for active cards
    container.querySelectorAll('.supp-check-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleCheck(btn.dataset.slotKey);
      });
    });

    this._updateProgressBar();
  },

  _renderInactiveCard(id, status) {
    const state = this._states[id];
    const seed = SUPPLEMENT_SEED.find(s => s.id === id);
    const name = seed ? seed.name : (state ? state.name : id);
    const dose = seed ? seed.dose : (state ? state.dose : '');
    const daysOn = state && state.startDate ? this._calcDaysOn(state.startDate) : null;

    const actions = status === 'paused'
      ? `<button class="btn btn-primary btn-sm" onclick="SupplementsModule.resumeSupplement('${id}')">▶ Resume</button>
         <button class="btn btn-danger btn-sm" onclick="SupplementsModule.stopSupplement('${id}')">⏹ Stop</button>`
      : `<button class="btn btn-primary btn-sm" onclick="SupplementsModule.startSupplement('${id}')">▶ Start</button>`;

    return `
      <div class="supp-inactive-card">
        <div class="supp-inactive-left">
          <span class="supp-name">${name}</span>
          ${dose ? `<span style="font-size:12px;color:var(--muted);margin-left:8px">${dose}</span>` : ''}
          ${daysOn !== null ? `<span class="badge badge-muted" style="margin-left:6px">Day ${daysOn}</span>` : ''}
        </div>
        <div class="supp-inactive-actions">${actions}</div>
      </div>`;
  },

  _buildTimeBlocks() {
    const activeIds = this._getActiveIds();
    if (activeIds.length === 0) return [];

    // Build time blocks from DAILY_SCHEDULE, filtering to only active supplements
    // Also handle active supplements not in schedule (custom or off-schedule)
    const scheduledIds = new Set();
    const blocks = [];

    DAILY_SCHEDULE.forEach(slot => {
      const slotActive = slot.items.filter(id => activeIds.includes(id));
      if (slotActive.length > 0) {
        blocks.push({
          time: slot.time,
          time_sort: slot.time_sort,
          note: slot.note || null,
          items: slotActive
        });
        slotActive.forEach(id => scheduledIds.add(id));
      }
    });

    // Any active supplement not in the schedule goes into "Anytime" block
    const unscheduled = activeIds.filter(id => !scheduledIds.has(id));
    if (unscheduled.length > 0) {
      blocks.push({ time: 'Anytime', time_sort: 'anytime', note: null, items: unscheduled });
    }

    return blocks;
  },

  _renderTimeBlock(block) {
    return `
      <div class="time-block">
        <div class="time-header">
          <div class="time-pill">${block.time}</div>
          <div class="time-line"></div>
        </div>
        ${block.note ? `<div class="alert alert-info" style="margin-bottom:10px;font-size:12px">💡 ${block.note}</div>` : ''}
        ${block.items.map(id => this._renderSuppCard(id, block.time_sort)).join('')}
      </div>
    `;
  },

  _renderSuppCard(id, time_sort) {
    const slotKey  = id + ':' + (time_sort || 'anytime');
    const state    = this._states[id];
    const seed     = SUPPLEMENT_SEED.find(s => s.id === id);
    const isChecked = this._todayChecked.has(slotKey);
    const name = seed ? seed.name : (state ? state.name : id);
    const dose = seed ? seed.dose : (state ? state.dose : '');
    const timing = seed ? seed.timing_detail || seed.timing : (state ? state.timing : '');
    const impactLevel = seed ? seed.impact_level : null;

    // Days on supplement
    const daysOn = state && state.startDate ? this._calcDaysOn(state.startDate) : null;

    // Days remaining (if endDate set)
    const daysLeft = state && state.endDate ? this._calcDaysLeft(state.endDate) : null;

    // Course expiry warning
    const courseAlert = this._getCourseAlert(id, state);

    const impactBadge = impactLevel && impactLevel !== 'prescribed' && impactLevel !== 'hold'
      ? `<span class="badge badge-${impactLevel === 'critical' ? 'danger' : impactLevel === 'high' ? 'warn' : 'muted'}">${impactLevel}</span>` : '';
    const rxBadge = impactLevel === 'prescribed' ? '<span class="badge badge-rx">🔵 Prescribed</span>' : '';

    return `
      <div class="supp-card ${isChecked ? 'supp-done' : ''}" data-slot-key="${slotKey}">
        <div class="supp-card-header">
          <div class="supp-card-left">
            <span class="supp-name">${name}</span>
            ${rxBadge}${impactBadge}
            ${daysOn !== null ? `<span class="badge badge-muted">Day ${daysOn}</span>` : ''}
            ${daysLeft !== null ? `<span class="badge ${daysLeft <= 3 ? 'badge-danger' : 'badge-warn'}">⏱ ${daysLeft}d left</span>` : ''}
          </div>
          <button class="supp-check-btn ${isChecked ? 'checked' : ''}" data-slot-key="${slotKey}" title="${isChecked ? 'Mark undone' : 'Mark done'}">
            ${isChecked ? '✓' : ''}
          </button>
        </div>
        ${courseAlert ? `<div class="alert alert-warn" style="margin:8px 0 0;font-size:12px">⚠️ ${courseAlert}</div>` : ''}
        <div class="supp-card-details">
          ${dose ? `<div class="detail-cell"><div class="detail-label">Dose</div><div class="detail-val">${dose}</div></div>` : ''}
          ${timing ? `<div class="detail-cell"><div class="detail-label">Timing</div><div class="detail-val">${timing}</div></div>` : ''}
          ${seed && seed.food_pairing ? `<div class="detail-cell"><div class="detail-label">Food</div><div class="detail-val">${seed.food_pairing}</div></div>` : ''}
          ${seed && seed.why ? `<div class="detail-cell"><div class="detail-label">Why</div><div class="detail-val">${seed.why}</div></div>` : ''}
          ${seed && seed.notes ? `<div class="detail-cell detail-cell-full"><div class="detail-label">Note</div><div class="detail-val">${seed.notes}</div></div>` : ''}
        </div>
        <div class="supp-card-actions">
          <button class="btn btn-ghost btn-sm" onclick="SupplementsModule.pauseSupplement('${id}')">⏸ Pause</button>
          <button class="btn btn-ghost btn-sm" onclick="SupplementsModule.showEndDatePicker('${id}')">🗓 Set end date</button>
          <button class="btn btn-danger btn-sm" onclick="SupplementsModule.stopSupplement('${id}')">⏹ Stop</button>
        </div>
      </div>
    `;
  },

  // ── All Supplements View (Settings page supplement manager) ───────────────

  async renderAllSupplements(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Group by status category
    const groups = [
      { label: 'Active', key: 'active', color: 'var(--accent2)' },
      { label: 'Paused', key: 'paused', color: 'var(--warn)' },
      { label: 'Not Started', key: 'not_started', color: 'var(--muted)' },
      { label: 'Deferred', key: 'defer', color: 'var(--muted)' },
      { label: 'On Hold', key: 'hold', color: 'var(--danger)' },
    ];

    let html = '';

    for (const group of groups) {
      const inGroup = SUPPLEMENT_SEED.filter(s => {
        const state = this._states[s.id];
        if (group.key === 'active') return state && state.status === 'active';
        if (group.key === 'paused') return state && state.status === 'paused';
        if (group.key === 'not_started') return state && state.status === 'not_started' && s.status !== 'defer' && s.status !== 'hold';
        if (group.key === 'defer') return s.status === 'defer' && (!state || state.status === 'not_started');
        if (group.key === 'hold') return s.status === 'hold' && (!state || state.status === 'not_started');
        return false;
      });

      // Add custom supplements to active group
      const customSupps = group.key === 'active'
        ? Object.values(this._states).filter(s => s.isCustom && s.status === 'active')
        : [];

      if (inGroup.length === 0 && customSupps.length === 0) continue;

      html += `<div class="section-label" style="color:${group.color}">${group.label} (${inGroup.length + customSupps.length})</div>`;

      inGroup.forEach(seed => {
        const state = this._states[seed.id];
        html += this._renderManageCard(seed.id, seed, state);
      });

      customSupps.forEach(state => {
        html += this._renderManageCard(state.id, null, state);
      });
    }

    container.innerHTML = html || '<div class="empty-state">No supplements found.</div>';
  },

  _renderManageCard(id, seed, state) {
    const name = seed ? seed.name : (state ? state.name : id);
    const isActive = state && state.status === 'active';
    const isPaused = state && state.status === 'paused';
    const daysOn = state && state.startDate ? this._calcDaysOn(state.startDate) : null;
    const phaseLabel = seed ? seed.phase_label : null;

    return `
      <div class="supp-manage-card" id="manage-${id}">
        <div class="supp-manage-header">
          <div>
            <span class="supp-name">${name}</span>
            ${phaseLabel ? `<span class="badge badge-muted" style="margin-left:6px;font-size:10px">${phaseLabel}</span>` : ''}
            ${daysOn !== null ? `<span class="badge badge-active" style="margin-left:6px">Day ${daysOn}</span>` : ''}
          </div>
          <div class="supp-manage-actions">
            ${!isActive && !isPaused ? `<button class="btn btn-primary btn-sm" onclick="SupplementsModule.startSupplement('${id}')">▶ Start</button>` : ''}
            ${isActive ? `<button class="btn btn-ghost btn-sm" onclick="SupplementsModule.pauseSupplement('${id}')">⏸ Pause</button>` : ''}
            ${isPaused ? `<button class="btn btn-primary btn-sm" onclick="SupplementsModule.resumeSupplement('${id}')">▶ Resume</button>` : ''}
            ${(isActive || isPaused) ? `<button class="btn btn-danger btn-sm" onclick="SupplementsModule.stopSupplement('${id}')">⏹ Stop</button>` : ''}
          </div>
        </div>
        ${seed ? `<div style="font-size:12px;color:var(--muted);margin-top:6px">${seed.dose || ''} ${seed.timing ? '· ' + seed.timing : ''}</div>` : ''}
        ${seed && seed.why ? `<div style="font-size:12px;color:var(--muted);margin-top:4px;line-height:1.4">${seed.why}</div>` : ''}
      </div>
    `;
  },

  // ── Lifecycle Actions ─────────────────────────────────────────────────────

  async startSupplement(id) {
    const today = new Date().toISOString().split('T')[0];

    if (!this._states[id]) {
      // New state entry for seed supplement
      const seed = SUPPLEMENT_SEED.find(s => s.id === id);
      this._states[id] = {
        id, name: seed ? seed.name : id,
        status: 'active', startDate: today, endDate: null,
        courseWeeks: seed ? seed.course_weeks : null, isCustom: false
      };
    } else {
      this._states[id].status = 'active';
      this._states[id].startDate = today;
    }

    // If courseWeeks is set, auto-calculate suggested endDate
    if (this._states[id].courseWeeks && !this._states[id].endDate) {
      const end = new Date();
      end.setDate(end.getDate() + (this._states[id].courseWeeks * 7));
      this._states[id].endDate = end.toISOString().split('T')[0];
    }

    await StorageService.saveSupplementStates(this._states);
    await this.render();

    // Re-render manage view if open
    const manageEl = document.getElementById('manage-' + id);
    if (manageEl) await this.renderAllSupplements('all-supplements-container');

    console.log('[Supplements] Started:', id);
    this._showToast(`▶ Started: ${this._states[id].name}`);
  },

  async pauseSupplement(id) {
    if (!this._states[id]) return;
    this._states[id].status = 'paused';
    await StorageService.saveSupplementStates(this._states);
    await this.render();
    this._showToast(`⏸ Paused: ${this._states[id].name}`);
  },

  async resumeSupplement(id) {
    if (!this._states[id]) return;
    this._states[id].status = 'active';
    await StorageService.saveSupplementStates(this._states);
    await this.render();
    this._showToast(`▶ Resumed: ${this._states[id].name}`);
  },

  async stopSupplement(id) {
    if (!this._states[id]) return;
    const state = this._states[id];
    const seed = SUPPLEMENT_SEED.find(s => s.id === id);

    // Confirm
    const name = seed ? seed.name : state.name;
    if (!confirm(`Stop "${name}"? It will be moved to the Archive. You can restore it anytime.`)) return;

    // Archive the supplement
    await StorageService.addToArchive({
      id,
      name,
      status: 'stopped',
      startDate: state.startDate,
      stopDate: new Date().toISOString().split('T')[0],
      daysOn: state.startDate ? this._calcDaysOn(state.startDate) : 0,
      isCustom: state.isCustom || false,
    });

    // Remove all slot instances from today's checked
    for (const key of this._todayChecked) {
      if (key === id || key.startsWith(id + ':')) this._todayChecked.delete(key);
    }

    // Reset state to not_started so it appears in schedule for future use
    this._states[id].status = 'not_started';
    this._states[id].startDate = null;
    this._states[id].endDate = null;
    await StorageService.saveSupplementStates(this._states);
    await this.render();
    this._showToast(`📁 ${name} archived — available to restart anytime`);
  },

  async setEndDate(id, dateStr) {
    if (!this._states[id]) return;
    this._states[id].endDate = dateStr || null;
    await StorageService.saveSupplementStates(this._states);
    await this.render();
  },

  showEndDatePicker(id) {
    const state = this._states[id];
    if (!state) return;
    const seed = SUPPLEMENT_SEED.find(s => s.id === id);
    const name = seed ? seed.name : state.name;
    const current = state.endDate || '';
    const dateStr = prompt(`Set end date for "${name}" (YYYY-MM-DD).\nLeave blank to remove end date.\nCurrent: ${current || 'none'}`, current);
    if (dateStr === null) return; // cancelled
    this.setEndDate(id, dateStr.trim() || null);
  },

  async addCustomSupplement(data) {
    const id = 'custom-' + Date.now();
    const today = new Date().toISOString().split('T')[0];
    this._states[id] = {
      id,
      name: data.name,
      status: 'active',
      startDate: today,
      endDate: data.endDate || null,
      courseWeeks: null,
      isCustom: true,
      dose: data.dose || '',
      timing: data.timing || '',
      notes: data.notes || '',
    };
    await StorageService.saveSupplementStates(this._states);
    await this.render();
    this._showToast(`✅ Added: ${data.name}`);
    return id;
  },

  // ── Daily Check Toggle ────────────────────────────────────────────────────

  async toggleCheck(slotKey) {
    if (this._todayChecked.has(slotKey)) {
      this._todayChecked.delete(slotKey);
    } else {
      this._todayChecked.add(slotKey);
    }

    const checked = this._todayChecked.has(slotKey);

    // Update card UI — find by data-slot-key
    const card = document.querySelector(`.supp-card[data-slot-key="${slotKey}"]`);
    const btn  = document.querySelector(`.supp-check-btn[data-slot-key="${slotKey}"]`);
    if (card) card.classList.toggle('supp-done', checked);
    if (btn) {
      btn.classList.toggle('checked', checked);
      btn.textContent = checked ? '✓' : '';
    }

    // Save compliance — store slot keys; total is slot-instance count
    await StorageService.saveDayCompliance(
      ComplianceService.todayKey(),
      Array.from(this._todayChecked),
      this._countTotalSlotInstances()
    );

    this._updateProgressBar();
  },

  async resetDay() {
    if (!confirm('Reset all checks for today?')) return;
    this._todayChecked.clear();
    const activeIds = this._getActiveIds();
    await StorageService.saveDayCompliance(ComplianceService.todayKey(), [], activeIds.length);
    await this.render();
  },

  // ── Helpers ───────────────────────────────────────────────────────────────

  _getActiveIds() {
    return Object.values(this._states)
      .filter(s => s.status === 'active')
      .map(s => s.id);
  },

  _calcDaysOn(startDate) {
    const start = new Date(startDate);
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff) + 1;
  },

  _calcDaysLeft(endDate) {
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  },

  _checkCourseExpiry() {
    const today = new Date().toISOString().split('T')[0];
    Object.values(this._states).forEach(state => {
      if (state.status === 'active' && state.endDate && state.endDate <= today) {
        const seed = SUPPLEMENT_SEED.find(s => s.id === state.id);
        const name = seed ? seed.name : state.name;
        console.warn(`[Supplements] Course ended: ${name} (end: ${state.endDate})`);
      }
    });
  },

  _getCourseAlert(id, state) {
    if (!state || !state.endDate) return null;
    const daysLeft = this._calcDaysLeft(state.endDate);
    const seed = SUPPLEMENT_SEED.find(s => s.id === id);
    const name = seed ? seed.name : (state ? state.name : id);

    if (daysLeft < 0) return `Course for ${name} ended ${Math.abs(daysLeft)} day(s) ago. Consider stopping or extending.`;
    if (daysLeft === 0) return `Today is the last day of the ${name} course.`;
    if (daysLeft <= 3) return `${name} course ends in ${daysLeft} day(s).`;
    return null;
  },

  _countTotalSlotInstances() {
    const activeIds = new Set(this._getActiveIds());
    let count = 0;
    const scheduledIds = new Set();
    DAILY_SCHEDULE.forEach(slot => {
      slot.items.forEach(id => {
        if (activeIds.has(id)) { count++; scheduledIds.add(id); }
      });
    });
    // Unscheduled active supplements count as 1 each
    activeIds.forEach(id => { if (!scheduledIds.has(id)) count++; });
    return count;
  },

  _updateProgressBar() {
    const total = this._countTotalSlotInstances();
    const done  = this._todayChecked.size;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

    const fill  = document.getElementById('schedule-prog-fill');
    const label = document.getElementById('schedule-prog-label');
    if (fill)  fill.style.width = pct + '%';
    if (label) label.textContent = `${done} of ${total} done (${pct}%)`;
  },

  _showToast(msg) {
    let toast = document.getElementById('happ-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'happ-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('toast-show');
    setTimeout(() => toast.classList.remove('toast-show'), 2500);
  },

  // ── Public getters (used by DashboardModule) ───────────────────────────────

  getActiveCount() {
    return this._getActiveIds().length;
  },

  getTodayPct() {
    const total = this._countTotalSlotInstances();
    if (!total) return 0;
    return Math.round((this._todayChecked.size / total) * 100);
  },

  getStates() {
    return this._states;
  },
};
