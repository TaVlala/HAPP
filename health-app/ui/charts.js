// HAPP — Charts (Chart.js 4)
// Weight progress + Body fat progress line charts

const Charts = {

  _weightChart: null,
  _fatChart:    null,

  _chartDefaults: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e2535',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        titleColor: '#e8eaf0',
        bodyColor: '#7a8099',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid:  { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#7a8099', font: { size: 11 }, maxTicksLimit: 8 },
      },
      y: {
        grid:  { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#7a8099', font: { size: 11 } },
      },
    },
    elements: {
      point: { radius: 3, hoverRadius: 5, backgroundColor: '#4f9cf0' },
      line:  { tension: 0.3 },
    },
  },

  _prepareData(history, field) {
    if (!history || !history.length) return { labels: [], data: [] };
    const filtered = history.filter(e => e[field] != null);
    return {
      labels: filtered.map(e => e.date || new Date(e.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })),
      data:   filtered.map(e => e[field]),
    };
  },

  renderWeightChart(history) {
    const canvas = document.getElementById('chart-weight');
    if (!canvas) return;
    const { labels, data } = this._prepareData(history, 'weight');

    if (this._weightChart) { this._weightChart.destroy(); this._weightChart = null; }

    if (!data.length) {
      const titleEl = canvas.parentElement.querySelector('.chart-title');
      if (titleEl) titleEl.insertAdjacentHTML('afterend',
        '<p style="color:var(--muted);font-size:12px;margin-top:8px">Log weight measurements to see your progress chart.</p>');
      return;
    }

    // Remove placeholder text if present
    const placeholder = canvas.parentElement.querySelector('p');
    if (placeholder) placeholder.remove();

    this._weightChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          borderColor: '#4f9cf0',
          backgroundColor: 'rgba(79,156,240,0.08)',
          fill: true,
          borderWidth: 2,
        }],
      },
      options: {
        ...this._chartDefaults,
        scales: {
          ...this._chartDefaults.scales,
          y: {
            ...this._chartDefaults.scales.y,
            ticks: { ...this._chartDefaults.scales.y.ticks, callback: v => v + ' kg' },
          },
        },
        plugins: {
          ...this._chartDefaults.plugins,
          tooltip: {
            ...this._chartDefaults.plugins.tooltip,
            callbacks: { label: ctx => ` ${ctx.parsed.y} kg` },
          },
        },
      },
    });
  },

  renderFatChart(history) {
    const canvas = document.getElementById('chart-fat');
    if (!canvas) return;
    const { labels, data } = this._prepareData(history, 'bodyFat');

    if (this._fatChart) { this._fatChart.destroy(); this._fatChart = null; }

    if (!data.length) {
      const titleEl = canvas.parentElement.querySelector('.chart-title');
      if (titleEl) titleEl.insertAdjacentHTML('afterend',
        '<p style="color:var(--muted);font-size:12px;margin-top:8px">Log body fat measurements to see your progress chart.</p>');
      return;
    }

    const placeholder = canvas.parentElement.querySelector('p');
    if (placeholder) placeholder.remove();

    this._fatChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167,139,250,0.08)',
          fill: true,
          borderWidth: 2,
        }],
      },
      options: {
        ...this._chartDefaults,
        scales: {
          ...this._chartDefaults.scales,
          y: {
            ...this._chartDefaults.scales.y,
            ticks: { ...this._chartDefaults.scales.y.ticks, callback: v => v + '%' },
          },
        },
        plugins: {
          ...this._chartDefaults.plugins,
          tooltip: {
            ...this._chartDefaults.plugins.tooltip,
            callbacks: { label: ctx => ` ${ctx.parsed.y}%` },
          },
        },
      },
    });
  },

  updateWeightChart(history) { this.renderWeightChart(history); },
  updateFatChart(history)    { this.renderFatChart(history); },
};
