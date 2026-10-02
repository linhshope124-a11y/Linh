import { STORAGE_KEYS } from './config.js';
import { generateId, getCurrentMonthIso, getTodayIso } from './utils.js';

export const state = {
  appData: { delivery: [], pickup: [], return: [] },
  rankBonus: 0,
  rankName: 'none',
  manualPoints: { buuCuc: 0, taiXe: 0 },
  manualSalary: 0,
  salaryDays: 26,
  region: 'mien',

  activeTab: 'overview',
  histFilter: 'all',
  overviewFilter: 'all',

  // v46: Chế độ xem — 'month' hoặc 'day'
  periodMode: 'month',
  currentMonth: getCurrentMonthIso(),
  currentDate: getTodayIso(),

  lastOcrImageDataUrl: '',
  isOcrScan: false
};

function sanitizeRecords(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(r =>
      r && typeof r === 'object' &&
      typeof r.date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(r.date) &&
      r.weights && typeof r.weights === 'object'
    )
    .map(r => ({
      id: Number.isFinite(r.id) ? r.id : generateId(),
      date: r.date,
      weights: r.weights
    }));
}

export function loadState() {
  let d = JSON.parse(localStorage.getItem(STORAGE_KEYS.records));
  if (!d || (!d.delivery && !d.pickup)) {
    d = JSON.parse(localStorage.getItem(STORAGE_KEYS.vault)) || { delivery: [], pickup: [], return: [] };
  }
  state.appData = {
    delivery: sanitizeRecords(d.delivery),
    pickup:   sanitizeRecords(d.pickup),
    return:   sanitizeRecords(d.return)
  };

  state.rankBonus = parseFloat(localStorage.getItem(STORAGE_KEYS.rank)) || 0;
  state.rankName  = localStorage.getItem(STORAGE_KEYS.rankName) || 'none';

  const mp = JSON.parse(localStorage.getItem('spx_manual_points') || '{}');
  state.manualPoints = { buuCuc: mp.buuCuc || 0, taiXe: mp.taiXe || 0 };

  state.manualSalary = parseFloat(localStorage.getItem('spx_manual_salary')) || 0;
  state.salaryDays = 26;

  const reg = localStorage.getItem('spx_region');
  state.region = (reg === 'hcm_hn' || reg === 'mien') ? reg : 'mien';

  // v46: period mode
  const savedMode = localStorage.getItem('spx_period_mode');
  state.periodMode = (savedMode === 'day' || savedMode === 'month') ? savedMode : 'month';

  // currentMonth
  const savedMonth = localStorage.getItem('spx_current_month');
  if (savedMonth && /^\d{4}-\d{2}$/.test(savedMonth)) {
    state.currentMonth = savedMonth;
  } else {
    state.currentMonth = getCurrentMonthIso();
  }

  // currentDate
  const savedDate = localStorage.getItem('spx_current_date');
  if (savedDate && /^\d{4}-\d{2}-\d{2}$/.test(savedDate)) {
    state.currentDate = savedDate;
  } else {
    state.currentDate = getTodayIso();
  }
}

export function persistData() {
  localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(state.appData));
  const total = state.appData.delivery.length + state.appData.pickup.length + state.appData.return.length;
  if (total > 0) localStorage.setItem(STORAGE_KEYS.vault, JSON.stringify(state.appData));
}

export function persistSettings() {
  localStorage.setItem(STORAGE_KEYS.rank,     state.rankBonus);
  localStorage.setItem(STORAGE_KEYS.rankName, state.rankName);
  localStorage.setItem('spx_region', state.region);
}

// v46: persist period state (mode + month + date)
export function persistPeriodState() {
  localStorage.setItem('spx_period_mode',  state.periodMode);
  localStorage.setItem('spx_current_month', state.currentMonth);
  localStorage.setItem('spx_current_date',  state.currentDate);
}

// Backward compat — hàm cũ vẫn gọi được
export function persistCurrentMonth() {
  persistPeriodState();
}