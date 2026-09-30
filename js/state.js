import { STORAGE_KEYS } from './config.js';

export const state = {
  appData: { delivery: [], pickup: [], return: [] },
  rankBonus: 0,
  rankName: 'none',
  manualPoints: { buuCuc: 0, taiXe: 0 },
  manualSalary: 0,
  salaryDays: 26,
  activeTab: 'overview',
  histFilter: 'all',
  overviewFilter: 'all',
  periodFilter: 'all',
  lastOcrImageDataUrl: '',
  isOcrScan: false
};

export function loadState() {
  let d = JSON.parse(localStorage.getItem(STORAGE_KEYS.records));
  if (!d || (!d.delivery && !d.pickup)) {
    d = JSON.parse(localStorage.getItem(STORAGE_KEYS.vault)) || { delivery: [], pickup: [], return: [] };
  }
  if (!d.delivery) d.delivery = [];
  if (!d.pickup)   d.pickup   = [];
  if (!d.return)   d.return   = [];
  state.appData = d;
  state.rankBonus = parseFloat(localStorage.getItem(STORAGE_KEYS.rank)) || 0;
  state.rankName  = localStorage.getItem(STORAGE_KEYS.rankName) || 'none';

  const mp = JSON.parse(localStorage.getItem('spx_manual_points') || '{}');
  state.manualPoints = { buuCuc: mp.buuCuc || 0, taiXe: mp.taiXe || 0 };

  state.manualSalary = parseFloat(localStorage.getItem('spx_manual_salary')) || 0;
  state.salaryDays = 26;
}

export function persistData() {
  localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(state.appData));
  const total = state.appData.delivery.length + state.appData.pickup.length + state.appData.return.length;
  if (total > 0) localStorage.setItem(STORAGE_KEYS.vault, JSON.stringify(state.appData));
}

export function persistSettings() {
  localStorage.setItem(STORAGE_KEYS.rank,     state.rankBonus);
  localStorage.setItem(STORAGE_KEYS.rankName, state.rankName);
}