import { state, persistData } from './state.js';
import { STORAGE_KEYS, APP_VERSION } from './config.js';

const GH_API = 'https://api.github.com';
const GIST_FILENAME = 'spx-tracker-backup.json';

const getToken    = () => localStorage.getItem('spx_gh_token') || '';
const getGistId   = () => localStorage.getItem('spx_gist_id') || '';
const isAutoBackup = () => localStorage.getItem('spx_auto_backup') === '1';

function setStatus(msg, type) {
  const el = document.getElementById('cloudStatus');
  if (!el) return;
  el.className = 'cloud-status ' + (type || 'idle');
  el.innerText = msg;
}

function buildPayload() {
  return {
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
}

export async function testCloudConnection() {
  const token = document.getElementById('ghTokenInput').value.trim();
  if (!token) { setStatus('❌ Chưa nhập token', 'err'); return; }
  setStatus('⏳ Đang kiểm tra...', 'idle');
  try {
    const res = await fetch(`${GH_API}/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' }
    });
    if (!res.ok) throw new Error('Token sai hoặc hết hạn');
    const user = await res.json();
    localStorage.setItem('spx_gh_token', token);
    setStatus(`✅ OK — ${user.login}`, 'ok');
  } catch (e) {
    setStatus(`❌ ${e.message}`, 'err');
  }
}

export async function pushToCloud() {
  const token = (document.getElementById('ghTokenInput')?.value.trim()) || getToken();
  if (!token) { setStatus('❌ Chưa có token', 'err'); return; }

  let gistId = (document.getElementById('gistIdInput')?.value.trim()) || getGistId();
  const payload = buildPayload();
  setStatus('⏳ Đang backup...', 'idle');

  try {
    let res;
    if (gistId) {
      res = await fetch(`${GH_API}/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: { [GIST_FILENAME]: { content: JSON.stringify(payload, null, 2) } }
        })
      });
    } else {
      res = await fetch(`${GH_API}/gists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'SPX Tracker auto-backup',
          public: false,
          files: { [GIST_FILENAME]: { content: JSON.stringify(payload, null, 2) } }
        })
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    const gist = await res.json();
    localStorage.setItem('spx_gh_token', token);
    localStorage.setItem('spx_gist_id', gist.id);
    const input = document.getElementById('gistIdInput');
    if (input) input.value = gist.id;

    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem('spx_last_backup', now);
    setStatus(`✅ Đã backup lúc ${now}`, 'ok');
  } catch (e) {
    setStatus(`❌ Lỗi: ${e.message}`, 'err');
  }
}

export async function pullFromCloud() {
  const token  = (document.getElementById('ghTokenInput')?.value.trim()) || getToken();
  const gistId = (document.getElementById('gistIdInput')?.value.trim()) || getGistId();

  if (!token || !gistId) { setStatus('❌ Chưa cấu hình token/gist', 'err'); return; }
  if (!confirm('Khôi phục từ Cloud sẽ GHI ĐÈ dữ liệu hiện tại. Tiếp tục?')) return;

  setStatus('⏳ Đang tải...', 'idle');
  try {
    const res = await fetch(`${GH_API}/gists/${gistId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const gist = await res.json();
    const content = gist.files[GIST_FILENAME]?.content;
    if (!content) throw new Error('Không tìm thấy dữ liệu trong Gist');

    const parsed = JSON.parse(content);
    if (!parsed.data || !parsed.data.delivery) throw new Error('Dữ liệu không hợp lệ');

    // Dọn trùng lặp tự động khi restore
    function dedupeList(list) {
      const seen = new Set();
      return list.filter(r => {
        const key = r.date + '|' + (r.weights ? Object.values(r.weights).join('_') : '');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    const originalDel  = parsed.data.delivery || [];
    const originalPick = parsed.data.pickup   || [];
    const originalRet  = parsed.data.return   || [];

    state.appData = {
      delivery: dedupeList(originalDel),
      pickup:   dedupeList(originalPick),
      return:   dedupeList(originalRet)
    };

    const removedCount = (originalDel.length - state.appData.delivery.length)
                       + (originalPick.length - state.appData.pickup.length)
                       + (originalRet.length - state.appData.return.length);

    if (parsed.settings) {
      if (typeof parsed.settings.rankName === 'string') state.rankName = parsed.settings.rankName;
      if (Number.isFinite(parsed.settings.rankBonus)) state.rankBonus = parsed.settings.rankBonus;
      if (typeof parsed.settings.theme === 'string') {
        localStorage.setItem(STORAGE_KEYS.theme, parsed.settings.theme);
        document.documentElement.setAttribute('data-theme', parsed.settings.theme);
        const icon = document.getElementById('themeIcon');
        if (icon) icon.innerText = parsed.settings.theme === 'dark' ? '☀️' : '🌙';
      }
      if (parsed.settings.manualPoints) {
        state.manualPoints = {
          buuCuc: parsed.settings.manualPoints.buuCuc || 0,
          taiXe:  parsed.settings.manualPoints.taiXe  || 0
        };
        localStorage.setItem('spx_manual_points', JSON.stringify(state.manualPoints));
      }
      if (Number.isFinite(parsed.settings.manualSalary)) {
        state.manualSalary = parsed.settings.manualSalary;
        localStorage.setItem('spx_manual_salary', state.manualSalary);
      }
      if (Number.isFinite(parsed.settings.salaryDays)) {
        state.salaryDays = parsed.settings.salaryDays;
        localStorage.setItem('spx_salary_days', state.salaryDays);
      }
    }

    persistData();
    const { initRankUI } = await import('./ui.js');
    const { updateAllViews } = await import('./render.js');
    initRankUI();
    updateAllViews();

    let doneMsg = '✅ Khôi phục từ Cloud thành công!';
    if (removedCount > 0) doneMsg += `\n\n🧹 Đã tự động bỏ qua ${removedCount} bản ghi trùng lặp.`;
    setStatus('✅ Khôi phục thành công!', 'ok');
    alert(doneMsg);
  } catch (e) {
    setStatus(`❌ Lỗi: ${e.message}`, 'err');
  }
}

export function initCloudUI() {
  const token = getToken();
  const gistId = getGistId();
  const autoBackup = isAutoBackup();

  const tokenInput = document.getElementById('ghTokenInput');
  const gistInput  = document.getElementById('gistIdInput');
  const toggle     = document.getElementById('autoBackupToggle');

  if (tokenInput) tokenInput.value = token;
  if (gistInput)  gistInput.value  = gistId;
  if (toggle) {
    toggle.checked = autoBackup;
    toggle.onchange = () => {
      localStorage.setItem('spx_auto_backup', toggle.checked ? '1' : '0');
      setStatus(toggle.checked ? '✅ Đã bật auto-backup' : 'Đã tắt auto-backup', toggle.checked ? 'ok' : 'idle');
    };
  }

  if (!token)       setStatus('Chưa cấu hình — cần tạo token', 'idle');
  else if (!gistId) setStatus('Đã có token — bấm "Backup ngay"', 'idle');
  else {
    const last = localStorage.getItem('spx_last_backup');
    setStatus(last ? `✅ Backup cuối: ${last}` : '✅ Đã cấu hình', 'ok');
  }
}

let autoBackupTimer = null;
export function scheduleAutoBackup() {
  if (!isAutoBackup() || !getToken()) return;
  clearTimeout(autoBackupTimer);
  autoBackupTimer = setTimeout(() => {
    pushToCloud().catch(e => console.warn('[Cloud] Auto-backup failed:', e));
  }, 10000);
}

window.addEventListener('spx:datachanged', scheduleAutoBackup);