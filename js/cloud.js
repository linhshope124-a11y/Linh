import {
  state,
  persistData,
  persistSalaryByMonth,
  persistRankByMonth
} from './state.js';
import { STORAGE_KEYS, APP_VERSION } from './config.js';
import { applyImportedPayload, askImportMode } from './backup.js';
import { updateAllViews } from './render.js';

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
      // v50.8.0
      rankByMonth:  state.rankByMonth,
      salaryByMonth: state.salaryByMonth,
      salaryDays:   state.salaryDays,
      region:       state.region,
      theme:        localStorage.getItem(STORAGE_KEYS.theme) || 'light'
    },
    data: state.appData
  };
}

// ==================== TEST CONNECTION ====================
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

// ==================== PUSH TO CLOUD ====================
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

// ==================== PULL FROM CLOUD ====================
export async function pullFromCloud() {
  const token  = (document.getElementById('ghTokenInput')?.value.trim()) || getToken();
  const gistId = (document.getElementById('gistIdInput')?.value.trim()) || getGistId();

  if (!token || !gistId) { setStatus('❌ Chưa cấu hình token/gist', 'err'); return; }
  if (!confirm('Khôi phục từ Cloud sẽ ÁP DỤNG dữ liệu từ Cloud. Tiếp tục?')) return;

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

    // v50.8.0: Hỏi user chọn chế độ (chỉ hỏi nếu app đang có data)
    const mode = await askImportMode();
    if (!mode) { setStatus('Đã hủy', 'idle'); return; }

    // Áp dụng payload với mode đã chọn
    const result = applyImportedPayload(parsed, mode);

    if (!result.success) throw new Error('Áp dụng dữ liệu thất bại');

    persistData();

    const { initRankUI, initRegionUI } = await import('./ui.js');
    const { updateAllViews } = await import('./render.js');
    initRankUI();
    initRegionUI();
    updateAllViews();

    let doneMsg = mode === 'overwrite'
      ? `✅ Đã GHI ĐÈ từ Cloud: ${result.addedCount} bản ghi`
      : `✅ Đã THÊM VÀO từ Cloud: +${result.addedCount} bản ghi` +
        (result.removedCount > 0 ? `\n🧹 Bỏ qua ${result.removedCount} trùng` : '');

    setStatus('✅ Khôi phục thành công!', 'ok');
    alert(doneMsg);
  } catch (e) {
    setStatus(`❌ Lỗi: ${e.message}`, 'err');
  }
}

// ==================== INIT CLOUD UI ====================
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

// ==================== AUTO BACKUP ====================
let autoBackupTimer = null;
export function scheduleAutoBackup() {
  if (!isAutoBackup() || !getToken()) return;
  clearTimeout(autoBackupTimer);
  autoBackupTimer = setTimeout(() => {
    pushToCloud().catch(e => console.warn('[Cloud] Auto-backup failed:', e));
  }, 10000);
}

window.addEventListener('spx:datachanged', scheduleAutoBackup);