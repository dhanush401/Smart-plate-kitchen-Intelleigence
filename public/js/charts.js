// Chart.js Manager for SmartPlate Dashboard & Analytics
const ChartsManager = {
  instances: {},

  // Global Chart.js defaults
  initDefaults() {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.tooltip.backgroundColor = '#161c24';
    Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
    Chart.defaults.plugins.tooltip.bodyColor = '#94a3b8';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
  },

  destroyChart(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  // Dashboard Quick Chart
  renderDashboardQuickChart(canvasId, analyticsData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: analyticsData.labels,
        datasets: [
          {
            label: 'Waste (kg)',
            data: analyticsData.wasteTrend,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Prepared (kg)',
            data: analyticsData.prepTrend,
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.35,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end'
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#64748b' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#64748b' },
            beginAtZero: true
          }
        }
      }
    });
  },

  // Analytics View Charts
  renderAnalyticsCharts(data) {
    this.initDefaults();

    // 1. Waste vs Prep Trend Chart
    this.destroyChart('analyticsWasteTrendChart');
    const trendCtx = document.getElementById('analyticsWasteTrendChart');
    if (trendCtx) {
      this.instances['analyticsWasteTrendChart'] = new Chart(trendCtx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [
            {
              type: 'line',
              label: 'Wasted Food (kg)',
              data: data.wasteTrend,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderWidth: 3,
              fill: true,
              tension: 0.35,
              yAxisID: 'y'
            },
            {
              type: 'bar',
              label: 'Prepared Food (kg)',
              data: data.prepTrend,
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderRadius: 6,
              yAxisID: 'y'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', align: 'end' }
          },
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.04)' } },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              title: { display: true, text: 'Kilograms (kg)' }
            }
          }
        }
      });
    }

    // 2. Waste Reason Breakdown (Doughnut)
    this.destroyChart('analyticsReasonChart');
    const reasonCtx = document.getElementById('analyticsReasonChart');
    if (reasonCtx) {
      this.instances['analyticsReasonChart'] = new Chart(reasonCtx, {
        type: 'doughnut',
        data: {
          labels: data.reasons.labels,
          datasets: [{
            data: data.reasons.data,
            backgroundColor: [
              '#f59e0b', // Over-prep
              '#ef4444', // Expired
              '#dc2626', // Burnt
              '#8b5cf6', // Plate Waste
              '#3b82f6', // Spoilage
              '#10b981'  // Other
            ],
            borderWidth: 2,
            borderColor: '#172030'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { boxWidth: 12, padding: 14 }
            }
          },
          cutout: '68%'
        }
      });
    }

    // 3. Financial Loss Trend
    this.destroyChart('analyticsCostTrendChart');
    const costCtx = document.getElementById('analyticsCostTrendChart');
    if (costCtx) {
      this.instances['analyticsCostTrendChart'] = new Chart(costCtx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Cost Loss (₹)',
            data: data.costTrend,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#f59e0b'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.04)' } },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: {
                callback: value => '₹' + value.toLocaleString()
              }
            }
          }
        }
      });
    }

    // 4. Top Wasted Items (Horizontal Bar)
    this.destroyChart('analyticsTopItemsChart');
    const topCtx = document.getElementById('analyticsTopItemsChart');
    if (topCtx) {
      this.instances['analyticsTopItemsChart'] = new Chart(topCtx, {
        type: 'bar',
        data: {
          labels: data.topWasted.map(i => i.name),
          datasets: [{
            label: 'Total Wasted (kg / units)',
            data: data.topWasted.map(i => i.qty),
            backgroundColor: 'rgba(239, 68, 68, 0.75)',
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: 'rgba(255, 255, 255, 0.04)' }
            },
            y: {
              grid: { display: false }
            }
          }
        }
      });
    }
  }
};

window.ChartsManager = ChartsManager;
