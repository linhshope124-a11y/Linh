import { state } from './state.js';
import { APP_VERSION, STORAGE_KEYS, WEIGHT_KEYS } from './config.js';
import { getTodayIso } from './utils.js';
import { updateAllViews } from './render.js';
import { initRankUI } from './ui.js';

export function copyDataJson() {
  const jsonStr = JSON.stringify(state.appData, null, 2);
  const btn = document.getElementById('copyJsonBtn');
  const ok = () => {
    btn.innerHTML = '✓ Đã chép!';
    btn.style.background = '#10b981'; btn.style.borderColor = '#10b981'; btn.style.color = '#fff';
    setTimeout(() => { btn.innerHTML = '📋 Chép JSON'; btn.style.background = ''; btn.style.borderColor = ''; btn.style.color = ''; }, 2000);
  };
  const fb = () => {
    try {
      const ta = document.createElement('textarea');
      ta.value = jsonStr; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      ok();
    } catch { alert('Không chép được.'); }
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(jsonStr).then(ok).catch(fb);
  else fb();
}

export function openPasteJsonModal()  {
  document.getElementById('jsonPasteInput').value = '';
  document.getElementById('pasteJsonModal').classList.add('active');
}
export function closePasteJsonModal() { document.getElementById('pasteJsonModal').classList.remove('active'); }

function weightsEqual(a, b) {
  return WEIGHT_KEYS.every(k => (parseInt(a[k], 10) || 0) === (parseInt(b[k], 10) || 0));
}

// Dọn trùng lặp trong 1 mảng records
function dedupeList(list) {
  const seen = new Set();
  return list.filter(r => {
    const key = r.date + '|' + WEIGHT_KEYS.map(k => parseInt(r.weights?.[k], 10) || 0).join('_');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function applyImportedPayload(parsed) {
  let importedData = null, importedSettings = null;
  if (parsed?.data && (parsed.data.delivery || parsed.data.pickup || parsed.data.return)) {
    importedData = parsed.data; importedSettings = parsed.settings || null;
  } else if (parsed && (parsed.delivery || parsed.pickup || parsed.return)) {
    importedData = parsed;
  } else return { success: false };

  // DỌN TRÙNG LẶP tự động khi import
  const originalDel  = importedData.delivery || [];
  const originalPick = importedData.pickup   || [];
  const originalRet  = importedData.return   || [];

  const dedupedDel  = dedupeList(originalDel);
  const dedupedPick = dedupeList(originalPick);
  const dedupedRet  = dedupeList(originalRet);

  const removedCount = (originalDel.length  - dedupedDel.length)
                     + (originalPick.length - dedupedPick.length)
                     + (originalRet.length  - dedupedRet.length);

  state.appData = {
    delivery: dedupedDel,
    pickup:   dedupedPick,
    return:   dedupedRet
  };

  localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(state.appData));
  localStorage.setItem(STORAGE_KEYS.vault,   JSON.stringify(state.appData));

  if (importedSettings) {
    if (typeof importedSettings.rankName === 'string') {
      state.rankName = importedSettings.rankName;
      localStorage.setItem(STORAGE_KEYS.rankName, state.rankName);
    }
    if (Number.isFinite(importedSettings.rankBonus)) {
      state.rankBonus = importedSettings.rankBonus;
      localStorage.setItem(STORAGE_KEYS.rank, state.rankBonus);
    }
    if (typeof importedSettings.theme === 'string') {
      localStorage.setItem(STORAGE_KEYS.theme, importedSettings.theme);
      document.documentElement.setAttribute('data-theme', importedSettings.theme);
      const icon = document.getElementById('themeIcon');
      if (icon) icon.innerText = importedSettings.theme === 'dark' ? '☀️' : '🌙';
    }
    if (importedSettings.manualPoints) {
      state.manualPoints = {
        buuCuc: importedSettings.manualPoints.buuCuc || 0,
        taiXe:  importedSettings.manualPoints.taiXe  || 0
      };
      localStorage.setItem('spx_manual_points', JSON.stringify(state.manualPoints));
    }
    if (Number.isFinite(importedSettings.manualSalary)) {
      state.manualSalary = importedSettings.manualSalary;
      localStorage.setItem('spx_manual_salary', state.manualSalary);
    }
    if (Number.isFinite(importedSettings.salaryDays)) {
      state.salaryDays = importedSettings.salaryDays;
      localStorage.setItem('spx_salary_days', state.salaryDays);
    }
    initRankUI();
  }

  return { success: true, removedCount };
}

export function confirmImportJsonString() {
  const text = document.getElementById('jsonPasteInput').value.trim();
  if (!text) { alert('Vui lòng dán chuỗi JSON!'); return; }
  try {
    const parsed = JSON.parse(text);
    const result = applyImportedPayload(parsed);
    if (result.success) {
      updateAllViews();
      closePasteJsonModal();
      let msg = '✅ Khôi phục dữ liệu thành công!';
      if (result.removedCount > 0) {
        msg += `\n\n🧹 Đã tự động bỏ qua ${result.removedCount} bản ghi trùng lặp.`;
      }
      alert(msg);
    } else alert('Chuỗi JSON không đúng định dạng!');
  } catch { alert('Dữ liệu JSON không hợp lệ!'); }
}

export function exportData() {
  const payload = {
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: {
      rankName: state.rankName,
      rankBonus: state.rankBonus,
      theme: localStorage.getItem(STORAGE_KEYS.theme) || 'light',
      manualPoints: state.manualPoints,
      manualSalary: state.manualSalary,
      salaryDays: state.salaryDays
    },
    data: state.appData
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', `SPX_Data_${getTodayIso()}.json`);
  document.body.appendChild(a); a.click(); a.remove();
}

export function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      const result = applyImportedPayload(parsed);
      if (result.success) {
        updateAllViews();
        let msg = '✅ Khôi phục dữ liệu thành công!';
        if (result.removedCount > 0) {
          msg += `\n\n🧹 Đã tự động bỏ qua ${result.removedCount} bản ghi trùng lặp.`;
        }
        alert(msg);
      } else alert('File sao lưu không đúng định dạng!');
    } catch { alert('Không đọc được file sao lưu!'); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

export function restoreFromVault() {
  const vault = JSON.parse(localStorage.getItem(STORAGE_KEYS.vault));
  const hasData = vault && (
    (vault.delivery && vault.delivery.length > 0) ||
    (vault.pickup   && vault.pickup.length   > 0) ||
    (vault.return   && vault.return.length   > 0)
  );
  if (!hasData) { alert('Không tìm thấy dữ liệu tự động lưu trữ.'); return; }
  if (!confirm('Đã tìm thấy bản sao lưu tự động. Bạn có muốn phục hồi không?')) return;
  state.appData = vault;
  updateAllViews();
  alert('Đã phục hồi dữ liệu!');
}