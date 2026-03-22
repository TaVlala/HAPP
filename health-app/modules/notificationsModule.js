// HAPP — Notifications Module
// Schedules browser push notifications for each DAILY_SCHEDULE slot

const NotificationsModule = {
  STORAGE_KEY: 'happ_notif_prefs',
  _timers: [],

  async init() {
    if (!('Notification' in window)) return;
    const prefs = this._loadPrefs();
    if (prefs.enabled && Notification.permission === 'granted') {
      this._scheduleAll();
    }
  },

  // ── Prefs ─────────────────────────────────────────────────────────────────

  _loadPrefs() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || { enabled: false, slots: {} };
    } catch { return { enabled: false, slots: {} }; }
  },

  _savePrefs(prefs) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs));
  },

  // ── Permission ────────────────────────────────────────────────────────────

  async requestPermission() {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  // ── Toggle master switch ──────────────────────────────────────────────────

  async toggle(enabled) {
    if (enabled) {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }
    const prefs = this._loadPrefs();
    prefs.enabled = enabled;
    this._savePrefs(prefs);
    if (enabled) {
      this._scheduleAll();
    } else {
      this._clearTimers();
    }
    return true;
  },

  // ── Scheduling ────────────────────────────────────────────────────────────

  _scheduleAll() {
    this._clearTimers();
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const prefs = this._loadPrefs();
    if (!prefs.enabled) return;

    DAILY_SCHEDULE.forEach(slot => {
      if (prefs.slots && prefs.slots[slot.time_sort] === false) return;
      this._scheduleSlot(slot);
    });
  },

  _scheduleSlot(slot) {
    const delay = this._msUntilTime(slot.time_sort);
    const timer = setTimeout(() => {
      this._notify(slot);
      // Re-schedule for same time tomorrow
      this._scheduleSlot(slot);
    }, delay);
    this._timers.push(timer);
  },

  _msUntilTime(timeStr) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, mins, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target - now;
  },

  _clearTimers() {
    this._timers.forEach(t => clearTimeout(t));
    this._timers = [];
  },

  // ── Show notification ─────────────────────────────────────────────────────

  _notify(slot) {
    const prefs = this._loadPrefs();
    if (!prefs.enabled) return;
    if (prefs.slots && prefs.slots[slot.time_sort] === false) return;

    const count = slot.items.length;
    const body = slot.note
      ? slot.note
      : `${count} supplement${count !== 1 ? 's' : ''} to take`;

    new Notification(`💊 ${slot.time}`, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'happ-' + slot.time_sort,
      renotify: true,
    });
  },

  // ── Settings UI ───────────────────────────────────────────────────────────

  renderSettings() {
    const container = document.getElementById('notif-settings-container');
    if (!container) return;

    const prefs = this._loadPrefs();
    const supported = 'Notification' in window;
    const denied = supported && Notification.permission === 'denied';

    container.innerHTML = `
      ${denied ? `<div class="alert alert-warn" style="margin-bottom:12px">⚠️ Notifications are blocked by your browser. Open browser settings to allow them for this site.</div>` : ''}
      ${!supported ? `<div class="alert alert-warn" style="margin-bottom:12px">⚠️ Your browser does not support notifications.</div>` : ''}
      <div class="settings-row" style="align-items:center;margin-bottom:6px">
        <label class="field-label" style="margin:0">Enable supplement reminders</label>
        <label class="toggle-switch">
          <input type="checkbox" id="notif-master-toggle" ${prefs.enabled ? 'checked' : ''} ${!supported || denied ? 'disabled' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:16px">
        Get a browser notification at each schedule time — even if this tab is in the background.
      </p>

      <div id="notif-slots-list" style="${prefs.enabled ? '' : 'opacity:0.4;pointer-events:none'}">
        <div class="section-label" style="margin-bottom:8px">Schedule times</div>
        ${DAILY_SCHEDULE.map(slot => {
          const on = prefs.slots?.[slot.time_sort] !== false;
          return `
            <div class="settings-row notif-slot-row">
              <div>
                <div style="font-size:14px;font-weight:500;color:var(--text)">${slot.time}</div>
                <div style="font-size:12px;color:var(--muted)">${slot.time_sort} · ${slot.items.length} item${slot.items.length !== 1 ? 's' : ''}</div>
              </div>
              <label class="toggle-switch toggle-switch-sm">
                <input type="checkbox" data-slot="${slot.time_sort}" ${on ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          `;
        }).join('')}
      </div>

      <button class="btn btn-ghost" id="notif-test-btn" style="margin-top:16px${!prefs.enabled || !supported || denied ? ';opacity:0.4;pointer-events:none' : ''}">
        🔔 Send test notification
      </button>
    `;

    // Master toggle
    const masterToggle = container.querySelector('#notif-master-toggle');
    if (masterToggle) {
      masterToggle.addEventListener('change', async e => {
        const ok = await this.toggle(e.target.checked);
        if (!ok) e.target.checked = false;
        this.renderSettings();
      });
    }

    // Per-slot toggles
    container.querySelectorAll('[data-slot]').forEach(input => {
      input.addEventListener('change', e => {
        const p = this._loadPrefs();
        if (!p.slots) p.slots = {};
        p.slots[e.target.dataset.slot] = e.target.checked;
        this._savePrefs(p);
        this._scheduleAll();
      });
    });

    // Test button
    const testBtn = container.querySelector('#notif-test-btn');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        new Notification('💊 HAPP — Test', {
          body: 'Reminders are working correctly!',
          icon: '/favicon.svg',
          tag: 'happ-test',
        });
      });
    }
  },
};
