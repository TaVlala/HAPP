// HAPP — Notifications Module
// Schedules browser push notifications for each DAILY_SCHEDULE slot.
// Meal-linked slots (breakfast, lunch, dinner, bedtime) fire 30 min early
// based on user-configured meal times.

const NotificationsModule = {
  STORAGE_KEY: 'happ_notif_prefs',
  _timers: [],

  // Maps DAILY_SCHEDULE time_sort → meal key for 30-min-early reminders
  MEAL_MAP: {
    '07:45': 'breakfast',
    '13:00': 'lunch',
    '18:45': 'dinner',
    '22:00': 'bedtime',
  },

  DEFAULT_MEALS: {
    breakfast: '08:00',
    lunch:     '13:00',
    dinner:    '19:00',
    bedtime:   '22:30',
  },

  MEAL_LABELS: {
    breakfast: '🍳 Breakfast',
    lunch:     '🥗 Lunch',
    dinner:    '🍽️ Dinner',
    bedtime:   '🛏️ Bedtime',
  },

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
      const p = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
      return {
        enabled: p.enabled || false,
        slots:   p.slots   || {},
        meals:   Object.assign({}, this.DEFAULT_MEALS, p.meals || {}),
      };
    } catch { return { enabled: false, slots: {}, meals: { ...this.DEFAULT_MEALS } }; }
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

  // Returns the fire-time string (HH:MM) for a slot.
  // Meal-linked slots fire 30 min before the user's meal time.
  _fireTime(slot) {
    const mealKey = this.MEAL_MAP[slot.time_sort];
    if (!mealKey) return slot.time_sort;

    const prefs = this._loadPrefs();
    const mealTime = prefs.meals[mealKey] || this.DEFAULT_MEALS[mealKey];
    const [h, m] = mealTime.split(':').map(Number);
    const total = h * 60 + m - 30;
    const fh = Math.floor(((total % 1440) + 1440) % 1440 / 60);
    const fm = ((total % 60) + 60) % 60;
    return String(fh).padStart(2, '0') + ':' + String(fm).padStart(2, '0');
  },

  _scheduleSlot(slot) {
    const fireTime = this._fireTime(slot);
    const delay = this._msUntilTime(fireTime);
    const timer = setTimeout(() => {
      this._notify(slot);
      this._scheduleSlot(slot); // reschedule for tomorrow
    }, delay);
    this._timers.push(timer);
  },

  _msUntilTime(timeStr) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const now    = new Date();
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

    const count   = slot.items.length;
    const isMeal  = !!this.MEAL_MAP[slot.time_sort];
    const body    = isMeal
      ? `${count} supplement${count !== 1 ? 's' : ''} to take — in 30 minutes`
      : slot.note || `${count} supplement${count !== 1 ? 's' : ''} to take`;

    new Notification(`💊 ${slot.time}`, {
      body,
      icon:     '/favicon.svg',
      badge:    '/favicon.svg',
      tag:      'happ-' + slot.time_sort,
      renotify: true,
    });
  },

  // ── Settings UI ───────────────────────────────────────────────────────────

  renderSettings() {
    const container = document.getElementById('notif-settings-container');
    if (!container) return;

    const prefs     = this._loadPrefs();
    const supported = 'Notification' in window;
    const denied    = supported && Notification.permission === 'denied';
    const dimmed    = !prefs.enabled ? 'opacity:0.4;pointer-events:none' : '';

    container.innerHTML = `
      ${denied    ? `<div class="alert alert-warn" style="margin-bottom:12px">⚠️ Notifications are blocked by your browser. Open browser settings to allow them for this site.</div>` : ''}
      ${!supported ? `<div class="alert alert-warn" style="margin-bottom:12px">⚠️ Your browser does not support notifications.</div>` : ''}

      <!-- Master toggle -->
      <div class="settings-row" style="align-items:center;margin-bottom:6px">
        <label class="field-label" style="margin:0">Enable supplement reminders</label>
        <label class="toggle-switch">
          <input type="checkbox" id="notif-master-toggle" ${prefs.enabled ? 'checked' : ''} ${!supported || denied ? 'disabled' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:20px">
        Get a browser notification at each schedule time — even if this tab is in the background.
      </p>

      <!-- Meal times -->
      <div style="${dimmed}">
        <div class="section-label" style="margin-bottom:10px">Your meal times</div>
        <p style="font-size:12px;color:var(--muted);margin-bottom:12px">
          Reminders for breakfast, lunch, dinner, and bedtime slots fire <strong>30 minutes early</strong>.
        </p>
        <div class="notif-meal-grid">
          ${Object.entries(this.MEAL_LABELS).map(([key, label]) => `
            <div class="notif-meal-row">
              <label class="notif-meal-label">${label}</label>
              <input type="time" class="input notif-meal-input" data-meal="${key}"
                     value="${prefs.meals[key] || this.DEFAULT_MEALS[key]}"
                     style="width:120px">
            </div>
          `).join('')}
        </div>
        <button class="btn btn-primary" id="notif-save-meals-btn" style="margin-top:14px">
          Save meal times
        </button>
        <p class="field-hint" id="notif-meal-saved" style="display:none;margin-top:8px;color:var(--accent2)">✅ Saved — reminders rescheduled</p>
      </div>

      <!-- Per-slot toggles -->
      <div id="notif-slots-list" style="margin-top:24px;${dimmed}">
        <div class="section-label" style="margin-bottom:8px">Schedule slots</div>
        ${DAILY_SCHEDULE.map(slot => {
          const on      = prefs.slots?.[slot.time_sort] !== false;
          const mealKey = this.MEAL_MAP[slot.time_sort];
          const fireT   = this._fireTime(slot);
          const sub     = mealKey
            ? `${this.MEAL_LABELS[mealKey]} − 30 min (fires ${fireT})`
            : `${slot.time_sort} · ${slot.items.length} item${slot.items.length !== 1 ? 's' : ''}`;
          return `
            <div class="settings-row notif-slot-row">
              <div>
                <div style="font-size:14px;font-weight:500;color:var(--text)">${slot.time}</div>
                <div style="font-size:12px;color:var(--muted)">${sub}</div>
              </div>
              <label class="toggle-switch toggle-switch-sm">
                <input type="checkbox" data-slot="${slot.time_sort}" ${on ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Test button -->
      <button class="btn btn-ghost" id="notif-test-btn"
              style="margin-top:16px${!prefs.enabled || !supported || denied ? ';opacity:0.4;pointer-events:none' : ''}">
        🔔 Send test notification
      </button>
    `;

    // Master toggle
    container.querySelector('#notif-master-toggle')?.addEventListener('change', async e => {
      const ok = await this.toggle(e.target.checked);
      if (!ok) e.target.checked = false;
      this.renderSettings();
    });

    // Save meal times
    container.querySelector('#notif-save-meals-btn')?.addEventListener('click', () => {
      const p = this._loadPrefs();
      container.querySelectorAll('[data-meal]').forEach(input => {
        if (input.value) p.meals[input.dataset.meal] = input.value;
      });
      this._savePrefs(p);
      this._scheduleAll();
      // Show confirmation
      const hint = container.querySelector('#notif-meal-saved');
      if (hint) { hint.style.display = ''; setTimeout(() => hint.style.display = 'none', 2500); }
      // Re-render slot subtitles to reflect new fire times
      this.renderSettings();
    });

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
    container.querySelector('#notif-test-btn')?.addEventListener('click', () => {
      new Notification('💊 HAPP — Test', {
        body: 'Reminders are working correctly!',
        icon: '/favicon.svg',
        tag:  'happ-test',
      });
    });
  },
};
