import { state, loadState, persistPeriodState, getSalaryConfig, setSalaryConfig } from './state.js';
import { initTheme, toggleTheme } from './theme.js';
import { getTodayIso, getCurrentMonthIso } from './utils.js';
import {
  switchMainTab, switchModalSubTab, setOverviewFilter, setHistFilter,
  setRankTier, initRankUI,
  initRegionUI,
  setPeriodMode, periodPrev, periodNext, openPeriodPicker,
  jumpToMonth, jumpToDate, goToLatest, updatePeriodBarUI,
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

// ================ v50.4: SAVE CONFIG THEO THÁNG ================
let manualPointsTimer = null;
function _saveManualPoints() {
  const buuCuc = parseInt(document.getElementById('manualBuuCucInput').value, 10) || 0;
  const taiXe  = parseInt(document.getElementById('manualTaiXeInput').value, 10) || 0;
  const cfg = getSalaryConfig(state.currentMonth);
  setSalaryConfig(state.currentMonth, { ...cfg, buuCuc, taiXe });
  clearTimeout(manualPointsTimer);
  manualPointsTimer = setTimeout(() => updateAllViews(), 300);
}

let salaryTimer = null;
function _saveSalaryConfig() {
  const salary = parseFloat(document.getElementById('salaryBaseInput').value) || 0;
  const cfg = getSalaryConfig(state.currentMonth);
  setSalaryConfig(state.currentMonth, { ...cfg, base: salary });
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

// ================ v48: HERO COLLAPSIBLE ================
function _toggleHeroMetrics() {
  const wrap = document.getElementById('heroMetricsWrap');
  const text = document.getElementById('heroToggleText');
  if (!wrap) return;
  const isExpanded = wrap.classList.toggle('expanded');
  if (text) text.innerText = isExpanded ? 'Ẩn' : 'Chi tiết';
  try { localStorage.setItem('spx_hero_expanded', isExpanded ? '1' : '0'); } catch {}
}

function _initHeroExpandState() {
  const wrap = document.getElementById('heroMetricsWrap');
  const text = document.getElementById('heroToggleText');
  if (!wrap) return;
  const saved = localStorage.getItem('spx_hero_expanded') === '1';
  if (saved) {
    wrap.classList.add('expanded');
    if (text) text.innerText = 'Ẩn';
  }
}

// ================ EXPOSE TO WINDOW ================
Object.assign(window, {
  toggleTheme,
  toggleThemeFromMenu,
  switchMainTab, switchModalSubTab, setOverviewFilter, setHistFilter,
  setRankTier,

  // ===== v46: PERIOD BAR =====
  setPeriodMode,
  periodPrev,
  periodNext,
  openPeriodPicker,
  jumpToMonth,
  jumpToDate,
  goToLatest,

  // ===== REGION — inline onclick =====
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

  // v50.4: force save config vào tháng hiện tại
  forceSaveConfig: function() {
    const buuCuc = parseInt(document.getElementById('manualBuuCucInput').value, 10) || 0;
    const taiXe  = parseInt(document.getElementById('manualTaiXeInput').value, 10) || 0;
    const salary = parseFloat(document.getElementById('salaryBaseInput').value) || 0;

    setSalaryConfig(state.currentMonth, { base: salary, buuCuc, taiXe });
    localStorage.setItem('spx_region', state.region);

    clearTimeout(manualPointsTimer);
    clearTimeout(salaryTimer);
    updateAllViews();

    const [y, m] = state.currentMonth.split('-');
    alert(
      `Đã lưu cấu hình cho Tháng ${parseInt(m, 10)}/${y}!\n\n` +
      `• Lương:   ${salary.toLocaleString('vi-VN')}\n` +
      `• Bưu cục: ${buuCuc.toLocaleString('vi-VN')}\n` +
      `• Tài xế:  ${taiXe.toLocaleString('vi-VN')}\n` +
      `• Khu vực: ${state.region === 'hcm_hn' ? 'TP.HCM & HN' : 'Miền'}`
    );
  },

  findDuplicates: _findDuplicates,
  cleanupDuplicates: _cleanupDuplicates,

  // v48: Hero toggle
  toggleHeroMetrics: _toggleHeroMetrics
});

// ================ INIT ================
(function init() {
  loadState();
  initTheme();
  initRankUI();
  initRegionUI();

  // v46: đồng bộ period bar theo state đã load
  updatePeriodBarUI();

  // v48: đồng bộ hero expand state
  _initHeroExpandState();

  attachAutoClearInputs();
  updateAllViews();
  setTimeout(() => preloadTesseractWorker(), 2000);
})();