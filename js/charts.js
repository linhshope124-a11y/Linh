import { state } from './state.js';
import { WEIGHT_KEYS } from './config.js';

let chartTrend = null;
let chartCumulative = null;
let chartPie = null;
let chartJsLoading = null;

async function loadChartJS() {
  if (window.Chart) return window.Chart;
  if (chartJsLoading) return chartJsLoading;

  chartJsLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    s.onload = () => resolve(window.Chart);
    s.onerror = () => reject(new Error('Cannot load Chart.js'));
    document.head.appendChild(s);
  });
  return chartJsLoading;
}

function getLastNDays(n) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ iso, label });
  }
  return out;
}

function sumRecordsByDate(records, isoDate) {
  let total = 0;
  records.forEach(r => {
    if (r.date !== isoDate) return;
    WEIGHT_KEYS.forEach(k => { total += parseInt(r.weights[k], 10) || 0; });
  });
  return total;
}

export async function toggleCharts() {
  const box = document.getElementById('chartsContainer');
  const btn = document.getElementById('toggleChartsBtn');
  if (!box) return;

  const isHidden = box.style.display === 'none' || box.style.display === '';
  if (!isHidden) {
    box.style.display = 'none';
    if (btn) btn.innerText = '📊 Hiện';
    return;
  }
  box.style.display = 'block';
  if (btn) btn.innerText = '📊 Ẩn';

  const loading = document.getElementById('chartsLoading');
  if (loading) loading.style.display = 'block';

  try {
    await loadChartJS();
    renderTrendChart();
    renderCumulativeChart();
    renderPieChart();
  } catch (e) {
    console.error('Chart load failed:', e);
    if (loading) loading.innerText = '❌ Không tải được biểu đồ (cần mạng)';
  } finally {
    if (loading) loading.style.display = 'none';
  }
}

function renderTrendChart() {
  const ctx = document.getElementById('chartTrend');
  if (!ctx) return;
  if (chartTrend) chartTrend.destroy();

  const days = getLastNDays(7);
  const delData  = days.map(d => sumRecordsByDate(state.appData.delivery, d.iso));
  const pickData = days.map(d => sumRecordsByDate(state.appData.pickup,   d.iso));
  const retData  = days.map(d => sumRecordsByDate(state.appData.return,   d.iso));

  chartTrend = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: days.map(d => d.label),
      datasets: [
        { label: 'Giao',  data: delData,  backgroundColor: '#8b5cf6' },
        { label: 'Lấy',   data: pickData, backgroundColor: '#0ea5e9' },
        { label: 'Hoàn',  data: retData,  backgroundColor: '#f59e0b' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } }
    }
  });
}

function renderCumulativeChart() {
  const ctx = document.getElementById('chartCumulative');
  if (!ctx) return;
  if (chartCumulative) chartCumulative.destroy();

  const days = getLastNDays(30);
  let cum = 0;
  const cumData = days.map(d => {
    const dayTotal = sumRecordsByDate(state.appData.delivery, d.iso)
                   + sumRecordsByDate(state.appData.pickup,   d.iso)
                   + sumRecordsByDate(state.appData.return,   d.iso);
    cum += dayTotal;
    return cum;
  });

  chartCumulative = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: days.map(d => d.label),
      datasets: [{
        label: 'Đơn tích lũy',
        data: cumData,
        borderColor: '#ff5722',
        backgroundColor: 'rgba(255, 87, 34, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function renderPieChart() {
  const ctx = document.getElementById('chartPie');
  if (!ctx) return;
  if (chartPie) chartPie.destroy();

  let delTotal = 0, pickTotal = 0, retTotal = 0;
  state.appData.delivery.forEach(r => WEIGHT_KEYS.forEach(k => delTotal += parseInt(r.weights[k], 10) || 0));
  state.appData.pickup.forEach(r   => WEIGHT_KEYS.forEach(k => pickTotal += parseInt(r.weights[k], 10) || 0));
  state.appData.return.forEach(r   => WEIGHT_KEYS.forEach(k => retTotal += parseInt(r.weights[k], 10) || 0));

  chartPie = new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Giao', 'Lấy', 'Hoàn'],
      datasets: [{
        data: [delTotal, pickTotal, retTotal],
        backgroundColor: ['#8b5cf6', '#0ea5e9', '#f59e0b']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
      }
    }
  });
}