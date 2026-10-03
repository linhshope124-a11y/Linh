import { STORAGE_KEYS } from './config.js';
import { generateId, getCurrentMonthIso, getTodayIso } from './utils.js';

export const state = {
  appData: { delivery: [], pickup: [], return: [] },
  rankBonus: 0,
  rankName: 'none',
  salaryByMonth: {},          // ← MỚI v50.4: { "YYYY-MM": {base, buuCuc, taiXe} }
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

const SALARY_BY_MONTH_KEY = 'spx_salary_by_month';
const LEGACY_SALARY_KEY   = 'spx_manual_salary';
const LEGACY_POINTS_KEY   = 'spx_manual_points';

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

// ============ v50.4: SALARY BY MONTH ============
export function persistSalaryByMonth() {
  localStorage.setItem(SALARY_BY_MONTH_KEY, JSON.stringify(state.salaryByMonth));
}

export function getSalaryConfig(monthIso) {
  const m = monthIso || state.currentMonth || getCurrentMonthIso();
  const cfg = state.salaryByMonth[m];
  if (cfg && typeof cfg === 'object') {
    return {
      base:   Number(cfg.base)   || 0,
      buuCuc: Number(cfg.buuCuc) || 0,
      taiXe:  Number(cfg.taiXe)  || 0
    };
  }
  return { base: 0, buuCuc: 0, taiXe: 0 };
}

export function setSalaryConfig(monthIso, config) {
  const m = monthIso || state.currentMonth || getCurrentMonthIso();
  state.salaryByMonth[m] = {
    base:   Number(config.base)   || 0,
    buuCuc: Number(config.buuCuc) || 0,
    taiXe:  Number(config.taiXe)  || 0
  };
  persistSalaryByMonth();
}

export function hasSalaryConfig(monthIso) {
  const m = monthIso || state.currentMonth || getCurrentMonthIso();
  return Boolean(state.salaryByMonth[m]);
}

function loadSalaryByMonth() {
  // 1. Thử đọc cấu trúc mới
  try {
    const raw = localStorage.getItem(SALARY_BY_MONTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        state.salaryByMonth = parsed;
        return;
      }
    }
  } catch {}

  // 2. Migration từ data cũ (chạy 1 lần duy nhất)
  const oldSalary = parseFloat(localStorage.getItem(LEGACY_SALARY_KEY)) || 0;
  let oldBuuCuc = 0, oldTaiXe = 0;
  try {
    const oldPts = JSON.parse(localStorage.getItem(LEGACY_POINTS_KEY) || '{}');
    oldBuuCuc = oldPts.buuCuc || 0;
    oldTaiXe  = oldPts.taiXe  || 0;
  } catch {}

  if (oldSalary > 0 || oldBuuCuc > 0 || oldTaiXe > 0) {
    const m = state.currentMonth || getCurrentMonthIso();
    state.salaryByMonth = {
      [m]: { base: oldSalary, buuCuc: oldBuuCuc, taiXe: oldTaiXe }
    };
    persistSalaryByMonth();
    localStorage.removeItem(LEGACY_SALARY_KEY);
    localStorage.removeItem(LEGACY_POINTS_KEY);
    console.log('[Migration] Đã chuyển config lương cũ vào tháng', m);
  }
}
// ============ /v50.4 ============

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

  // v50.4: salary config theo từng tháng
  state.salaryDays = 26;
  loadSalaryByMonth();

  const reg = localStorage.getItem('spx_region');
  state.region = (reg === 'hcm_hn' || reg === 'mien') ? reg : 'mien';
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