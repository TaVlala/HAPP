// HAPP — Food Pairing Module

const FoodModule = {
  _selected: new Set(),

  init() {
    this.render();
  },

  render() {
    const el = document.getElementById('food-content');
    if (!el) return;

    el.innerHTML = `
      <div class="food-pairing-box" id="food-pairing-box">
        <div class="food-pairing-empty">
          <div class="food-pairing-empty-icon">🍽️</div>
          <div class="food-pairing-empty-text">Select foods below to see how they pair</div>
        </div>
      </div>
      <div class="food-section-label">Foods — tap to select</div>
      <div class="food-grid" id="food-grid">
        ${FOOD_DATA.map(f => this._renderCard(f)).join('')}
      </div>
    `;
  },

  _renderCard(food) {
    return `
      <div class="food-card" id="food-card-${food.id}" onclick="FoodModule.toggleFood('${food.id}')">
        <div class="food-card-emoji">${food.emoji}</div>
        <div class="food-card-name">${food.name}</div>
      </div>
    `;
  },

  toggleFood(id) {
    if (this._selected.has(id)) {
      this._selected.delete(id);
    } else {
      this._selected.add(id);
    }
    this._updateCards();
    this._updatePairingBox();
  },

  _updateCards() {
    FOOD_DATA.forEach(f => {
      const card = document.getElementById(`food-card-${f.id}`);
      if (!card) return;
      card.classList.toggle('selected', this._selected.has(f.id));
    });
  },

  _updatePairingBox() {
    const box = document.getElementById('food-pairing-box');
    if (!box) return;
    const selected = [...this._selected];

    if (selected.length === 0) {
      box.innerHTML = `
        <div class="food-pairing-empty">
          <div class="food-pairing-empty-icon">🍽️</div>
          <div class="food-pairing-empty-text">Select foods below to see how they pair</div>
        </div>`;
      return;
    }

    if (selected.length === 1) {
      const food = FOOD_DATA.find(f => f.id === selected[0]);
      box.innerHTML = `
        <div class="food-context-card">
          <div class="food-context-header">
            <span class="food-context-emoji">${food.emoji}</span>
            <span class="food-context-name">${food.name}</span>
          </div>
          <div class="food-context-text">${food.context}</div>
          <div class="food-context-hint">Select another food to see pairing details</div>
        </div>`;
      return;
    }

    // Build all pairs from selected foods
    const pairs = [];
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const a = FOOD_DATA.find(f => f.id === selected[i]);
        const b = FOOD_DATA.find(f => f.id === selected[j]);
        const pairing = getFoodPairing(selected[i], selected[j]);
        pairs.push({ a, b, pairing });
      }
    }

    box.innerHTML = pairs.map(({ a, b, pairing }) => {
      if (!pairing) return '';
      const { cls, icon, label } = this._ratingMeta(pairing.rating);
      return `
        <div class="food-pair-card ${cls}">
          <div class="food-pair-header">
            <span class="food-pair-foods">${a.emoji} ${a.name} + ${b.emoji} ${b.name}</span>
            <span class="food-pair-badge food-badge-${pairing.rating}">${icon} ${label}</span>
          </div>
          <div class="food-pair-what">${pairing.what}</div>
          <div class="food-pair-reason">${pairing.reason}</div>
        </div>`;
    }).join('');
  },

  _ratingMeta(rating) {
    switch (rating) {
      case 'excellent': return { cls: 'pair-excellent', icon: '✅', label: 'Excellent pair' };
      case 'good':      return { cls: 'pair-good',      icon: '✅', label: 'Good pair' };
      case 'caution':   return { cls: 'pair-caution',   icon: '⚠️', label: 'Caution' };
      case 'bad':       return { cls: 'pair-bad',       icon: '❌', label: 'Bad pair' };
      default:          return { cls: '',               icon: '?',  label: 'Unknown' };
    }
  }
};
