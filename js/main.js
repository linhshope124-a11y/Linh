import { state, loadState, persistCurrentMonth } from './state.js';
import { initTheme, toggleTheme } from './theme.js';
import { getCurrentMonthIso, formatMonthLabel } from './utils.js';
import {
  switchMainTab, switchModalSubTab, setOverviewFilter, setPeriodFilter, setHistFilter,
  setRankTier, initRankUI,
  initRegionUI, updateMonthNavUI,
  openAddModal, openEditModal, closeModal,
  openMenuModal, closeMenuModal,
  openHistoryTab,
  openSettingsModal, closeSettingsModal,
  openCoffeeModal, closeCoffeeModal, copyBankNumber,
  openGuideModal, closeGuideModal,
  toggleThemeFromMenu
} from './ui.js';
import {
  handleOcrImage, preloadTesseractWorker,
  openOcrLightbox, closeOcrLightbox,
  openBatchOcrModal, closeBatchOcrModal, appendBatchFiles,
  saveBatchAll, importBatchItem, removeBatchItem,
  backToBatch, hasBatchPending, showBackToBatchBtn
} from './ocr.js';
import { saveRecord, deleteRecord, clearAllHistory } from './entry.js';
import {
  copyDataJson, openPasteJsonModal, closePasteJsonModal,
  confirmImportJsonString, exportData, importData, restoreFromVault
} from './backup.js';
import { updateAllViews } from './render.js';
import { testCloudConnection, pushToCloud, pullFromCloud, initCloudUI } from './cloud.js';
import { undoLast } from './undo.js';
import { WEIGHT_KEYS } from './config.js';

// ================ AUTO-CLEAR INPUT ================
function attachAutoClearInputs() {
  document.querySelectorAll('.auto-clear').forEach(input => {
    input.addEventListener('focus', function () { if (this.value === '0') this.value = ''; });
    input.addEventListener('blur',  function () { if (this.value.trim() === '') this.value = '0'; });
  });
}

// ================ SERVICE WORKER ================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(reg => console.log('[PWA] SW đã đăng ký:', reg.scope))
      .catch(err => console.warn('[PWA] Bỏ qua SW:', err.message));
  });
}

// ================ SAVE CONFIG ================
let manualPointsTimer = null;
function _saveManualPoints() {
  const buuCuc = parseInt(document.getElementById('manualBuuCucInput').value, 10) || 0;
  const taiXe  = parseInt(document.getElementById('manualTaiXeInput').value, 10) || 0;
  state.manualPoints = { buuCuc, taiXe };
  localStorage.setItem('spx_manual_points', JSON.stringify(state.manualPoints));
  clearTimeout(manualPointsTimer);
  manualPointsTimer = setTimeout(() => updateAllViews(), 300);
}

let salaryTimer = null;
function _saveSalaryConfig() {
  const salary = parseFloat(document.getElementById('salaryBaseInput').value) || 0;
  state.manualSalary = salary;
  localStorage.setItem('spx_manual_salary', salary);
  clearTimeout(salaryTimer);
  salaryTimer = setTimeout(() => updateAllViews(), 300);
}

// ================ DỌN TRÙNG LẶP ================
function _findDuplicates() {
  const dups = [];
  ['delivery', 'pickup', 'return'].forEach(type => {
    const seen = {};
    state.appData[type].forEach(r => {
      const key = r.date + '|' + WEIGHT_KEYS.map(k => parseInt(r.weights?.[k], 10) || 0).join('_');
      if (seen[key]) {
        dups.push({ type, id: r.id, date: r.date, keptId: seen[key].id });
      } else {
        seen[key] = r;
      }
    });
  });
  return dups;
}

function _cleanupDuplicates() {
  const dups = _findDuplicates();
  if (dups.length === 0) {
    alert('Không có bản ghi trùng lặp!');
    return;
  }
  const summary = { Giao: 0, Lấy: 0, Hoàn: 0 };
  dups.forEach(d => {
    const label = d.type === 'delivery' ? 'Giao' : d.type === 'pickup' ? 'Lấy' : 'Hoàn';
    summary[label]++;
  });
  let msg = `Tìm thấy ${dups.length} bản ghi trùng lặp:\n`;
  Object.keys(summary).forEach(k => {
    if (summary[k] > 0) msg += `• ${k}: ${summary[k]}\n`;
  });
  msg += '\nXóa hết các bản ghi trùng (giữ lại 1 bản gốc)?';
  if (!confirm(msg)) return;
  const idsByType = { delivery: [], pickup: [], return: [] };
  dups.forEach(d => idsByType[d.type].push(d.id));
  Object.keys(idsByType).forEach(type => {
    const ids = idsByType[type];
    state.appData[type] = state.appData[type].filter(r => !ids.includes(r.id));
  });
  updateAllViews();
  alert(`Đã xóa ${dups.length} bản ghi trùng lặp!`);
}

// ================ v42: MONTH NAVIGATION ================
function _prevMonth() {
  const [y, m] = state.currentMonth.split('-').map(Number);
  let newY = y, newM = m - 1;
  if (newM < 1) { newM = 12; newY--; }
  // Giới hạn: không cho về trước 2020
  if (newY < 2020) return;
  state.currentMonth = `${newY}-${String(newM).padStart(2, '0')}`;
  persistCurrentMonth();
  updateMonthNavUI();
  updateAllViews();
}

function _nextMonth() {
  const now = getCurrentMonthIso();
  if (state.currentMonth >= now) return; // không vượt quá tháng hiện tại
  const [y, m] = state.currentMonth.split('-').map(Number);
  let newY = y, newM = m + 1;
  if (newM > 12) { newM = 1; newY++; }
  state.currentMonth = `${newY}-${String(newM).padStart(2, '0')}`;
  persistCurrentMonth();
  updateMonthNavUI();
  updateAllViews();
}

function _openMonthPicker() {
  const picker = document.getElementById('monthPickerInput');
  if (!picker) return;
  picker.value = state.currentMonth;
  // Mở native picker (Chrome/Edge/Safari hỗ trợ)
  if (typeof picker.showPicker === 'function') {
    try { picker.showPicker(); } catch { picker.click(); }
  } else {
    picker.click();
  }
}

function _jumpToMonth(value) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return;
  const now = getCurrentMonthIso();
  // Không cho chọn tháng tương lai
  state.currentMonth = value > now ? now : value;
  persistCurrentMonth();
  updateMonthNavUI();
  updateAllViews();
}

// ================ EXPOSE TO WINDOW ================
Object.assign(window, {
  toggleTheme,
  toggleThemeFromMenu,
  switchMainTab, switchModalSubTab, setOverviewFilter, setPeriodFilter, setHistFilter,
  setRankTier,

  // ===== v42: MONTH NAV =====
  prevMonth: _prevMonth,
  nextMonth: _nextMonth,
  openMonthPicker: _openMonthPicker,
  jumpToMonth: _jumpToMonth,

  // ===== REGION — inline onclick handler =====
  changeRegion: function(regionKey, el) {
    try {
      console.log('[Region] change →', regionKey);
      if (!regionKey || (regionKey !== 'mien' && regionKey !== 'hcm_hn')) return;

      const oldRegion = state.region;
      if (oldRegion === regionKey) return;

      state.region = regionKey;
      localStorage.setItem('spx_region', regionKey);
      console.log('[Region] state updated:', oldRegion, '→', regionKey);

      document.querySelectorAll('.region-pill').forEach(p => p.classList.remove('active'));
      if (el) el.classList.add('active');

      updateAllViews();

      const label = regionKey === 'hcm_hn'
        ? 'TP.HCM & Hà Nội (80/40)'
        : 'Miền Bắc/Trung/Nam (60/30)';
      alert(`Đã chọn khu vực: ${label}`);
    } catch (e) {
      console.error('[Region] error:', e);
      alert('Lỗi đổi khu vực: ' + e.message);
    }
  },

  openAddModal, openEditModal, closeModal,
  openMenuModal, closeMenuModal,
  openHistoryTab,
  openSettingsModal, closeSettingsModal,
  openCoffeeModal, closeCoffeeModal, copyBankNumber,
  openGuideModal, closeGuideModal,
  handleOcrImage, openOcrLightbox, closeOcrLightbox,
  openBatchOcrModal, closeBatchOcrModal, appendBatchFiles,
  saveBatchAll, importBatchItem, removeBatchItem,
  backToBatch, hasBatchPending, showBackToBatchBtn,
  saveRecord, deleteRecord, clearAllHistory,
  copyDataJson, openPasteJsonModal, closePasteJsonModal,
  confirmImportJsonString, exportData, importData, restoreFromVault,
  testCloudConnection, pushToCloud, pullFromCloud, initCloudUI,
  undoLast,

  saveManualPoints: _saveManualPoints,
  saveSalaryConfig: _saveSalaryConfig,

  forceSaveConfig: function() {
    const buuCuc = parseInt(document.getElementById('manualBuuCucInput').value, 10) || 0;
    const taiXe  = parseInt(document.getElementById('manualTaiXeInput').value, 10) || 0;
    const salary = parseFloat(document.getElementById('salaryBaseInput').value) || 0;
    state.manualPoints = { buuCuc, taiXe };
    state.manualSalary = salary;
    localStorage.setItem('spx_manual_points', JSON.stringify(state.manualPoints));
    localStorage.setItem('spx_manual_salary', salary);
    localStorage.setItem('spx_region', state.region);
    clearTimeout(manualPointsTimer);
    clearTimeout(salaryTimer);
    updateAllViews();
    alert('Đã lưu cấu hình!\n\n• Lương: ' + salary.toLocaleString('vi-VN') +
          '\n• Bưu cục: ' + buuCuc.toLocaleString('vi-VN') +
          '\n• Tài xế: ' + taiXe.toLocaleString('vi-VN') +
          '\n• Khu vực: ' + (state.region === 'hcm_hn' ? 'TP.HCM & HN' : 'Miền'));
  },

  findDuplicates: _findDuplicates,
  cleanupDuplicates: _cleanupDuplicates
});

// ================ INIT ================
(function init() {
  loadState();
  initTheme();
  initRankUI();
  initRegionUI();
  updateMonthNavUI();   // v42: set label + disable nút › nếu đang ở tháng hiện tại
  attachAutoClearInputs();
  updateAllViews();
  setTimeout(() => preloadTesseractWorker(), 2000);
})();