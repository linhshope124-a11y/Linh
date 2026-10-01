import { state, persistSettings } from './state.js';
import { updateAllViews, renderHistory } from './render.js';
import { getTodayIso } from './utils.js';
import { toggleTheme } from './theme.js';

// ================ TABS ================
export function switchMainTab(tabId, el) {
  state.activeTab = tabId;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('tab-' + tabId);
  if (panel) panel.classList.add('active');

  if (tabId === 'history') {
    state.histFilter = 'all';
    document.querySelectorAll('#tab-history .filter-bar .filter-btn')
      .forEach((b, i) => b.classList.toggle('active', i === 0));
    renderHistory();
  }
}

export function openHistoryTab() {
  state.activeTab = 'history';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('tab-history');
  if (panel) panel.classList.add('active');
  state.histFilter = 'all';
  document.querySelectorAll('#tab-history .filter-bar .filter-btn')
    .forEach((b, i) => b.classList.toggle('active', i === 0));
  renderHistory();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function switchModalSubTab(tabKey) {
  ['del', 'pick', 'ret'].forEach(k => {
    const btn = document.getElementById('subtab-btn-' + k);
    const pane = document.getElementById('pane-' + k);
    if (btn) btn.classList.remove('active');
    if (pane) pane.style.display = 'none';
  });
  const btn = document.getElementById('subtab-btn-' + tabKey);
  const pane = document.getElementById('pane-' + tabKey);
  if (btn) btn.classList.add('active');
  if (pane) pane.style.display = 'block';
}

// ================ FILTERS ================
export function setOverviewFilter(filter, el) {
  state.overviewFilter = filter;
  const bar = el.closest('.filter-bar');
  if (bar) bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#overviewMilestoneList .suggestion-item').forEach(item => {
    if (filter === 'all')       item.style.display = 'flex';
    else if (filter === 'del')  item.style.display = item.classList.contains('sugg-del')  ? 'flex' : 'none';
    else if (filter === 'pick') item.style.display = item.classList.contains('sugg-pick') ? 'flex' : 'none';
    else if (filter === 'ret')  item.style.display = item.classList.contains('sugg-ret')  ? 'flex' : 'none';
  });
}

export function setPeriodFilter(period, el) {
  state.periodFilter = period;
  el.parentElement.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  updateAllViews();
}

export function setHistFilter(filter, btn) {
  state.histFilter = filter;
  const bar = btn.closest('.filter-bar');
  if (bar) bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderHistory();
}

// ================ RANK ================
export function setRankTier(rankKey, bonusPct, el) {
  if (window.__spxLongPressFired) {
    window.__spxLongPressFired = false;
    return;
  }
  state.rankBonus = bonusPct;
  state.rankName  = rankKey;
  persistSettings();
  el.parentElement.querySelectorAll('.rank-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  const label = document.getElementById('currentBonusPctLabel');
  if (label) label.innerText = `+${Math.round(bonusPct * 100)}%`;
  updateAllViews();
}

function resetRankToNone() {
  state.rankBonus = 0;
  state.rankName  = 'none';
  persistSettings();
  document.querySelectorAll('.rank-pill').forEach(p => {
    p.classList.remove('active');
    p.classList.remove('long-pressing');
  });
  const label = document.getElementById('currentBonusPctLabel');
  if (label) label.innerText = '+0%';
  updateAllViews();
  showToast('Đã bỏ chọn hạng thưởng', 'success', 1800);
}

let _rankLongPressAttached = false;
function attachRankLongPress() {
  if (_rankLongPressAttached) return;
  _rankLongPressAttached = true;

  document.querySelectorAll('.rank-pill').forEach(pill => {
    let timer = null;
    const start = () => {
      window.__spxLongPressFired = false;
      pill.classList.add('long-pressing');
      timer = setTimeout(() => {
        window.__spxLongPressFired = true;
        if (pill.classList.contains('active')) {
          if (navigator.vibrate) { try { navigator.vibrate(30); } catch {} }
          resetRankToNone();
        } else {
          pill.classList.remove('long-pressing');
        }
      }, 550);
    };
    const cancel = () => {
      clearTimeout(timer);
      timer = null;
      pill.classList.remove('long-pressing');
    };
    pill.addEventListener('touchstart',  start,  { passive: true });
    pill.addEventListener('touchend',    cancel);
    pill.addEventListener('touchcancel', cancel);
    pill.addEventListener('touchmove',   cancel, { passive: true });
    pill.addEventListener('mousedown',   start);
    pill.addEventListener('mouseup',     cancel);
    pill.addEventListener('mouseleave',  cancel);
  });
}

export function initRankUI() {
  document.querySelectorAll('.rank-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.rank === state.rankName);
  });
  const label = document.getElementById('currentBonusPctLabel');
  if (label) label.innerText = `+${Math.round(state.rankBonus * 100)}%`;
  attachRankLongPress();
}

// ================ REGION ================
export function setRegion(regionKey, el) {
  state.region = regionKey;
  localStorage.setItem('spx_region', regionKey);
  el.parentElement.querySelectorAll('.region-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  updateAllViews();
  showToast(
    `Khu vực: ${regionKey === 'hcm_hn' ? 'TP.HCM & Hà Nội (80/40)' : 'Miền Bắc/Trung/Nam (60/30)'}`,
    'success',
    1800
  );
}

export function initRegionUI() {
  document.querySelectorAll('.region-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.region === state.region);
  });
}

// ================ THEME (từ menu) ================
export function toggleThemeFromMenu() {
  toggleTheme();
  updateMenuThemeUI();
  closeMenuModal();
}

export function updateMenuThemeUI() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const title = document.getElementById('menuThemeTitle');
  const sub   = document.getElementById('menuThemeSub');
  if (current === 'dark') {
    if (title) title.innerText = 'Chế độ sáng';
    if (sub)   sub.innerText   = 'Chuyển về giao diện sáng';
  } else {
    if (title) title.innerText = 'Chế độ tối';
    if (sub)   sub.innerText   = 'Chuyển sang giao diện tối';
  }
}

// ================ MODALS ================
export function openAddModal() {
  document.getElementById('modalTitle').innerText = 'Nhập sản lượng ngày';
  document.getElementById('editEntryId').value = '';
  document.getElementById('editEntryType').value = '';
  document.getElementById('modalSubTabGroup').style.display = 'flex';
  document.getElementById('inputDate').value = getTodayIso();

  ['0_2','2_4','4_6','6_8','8_10','10_12','12_15','over_15'].forEach(id => {
    document.getElementById('del_inp_'  + id).value = 0;
    document.getElementById('pick_inp_' + id).value = 0;
    document.getElementById('ret_inp_'  + id).value = 0;
  });
  switchModalSubTab('del');
  clearAllConfidenceHighlightsLocal();

  if (state.isOcrScan && state.lastOcrImageDataUrl) {
    document.getElementById('ocrPreviewImg').src = state.lastOcrImageDataUrl;
    document.getElementById('ocrPreviewBox').style.display = 'block';
    state.isOcrScan = false;
  } else {
    document.getElementById('ocrPreviewBox').style.display = 'none';
  }
  document.getElementById('entryModal').classList.add('active');
}

export function openEditModal(type, id) {
  const item = (state.appData[type] || []).find(r => r.id === id);
  if (!item) { showToast('Không tìm thấy bản ghi', 'error'); return; }

  document.getElementById('modalTitle').innerText =
    `Sửa (${type === 'delivery' ? 'Giao' : type === 'pickup' ? 'Lấy' : 'Hoàn'})`;
  document.getElementById('editEntryId').value = id;
  document.getElementById('editEntryType').value = type;
  document.getElementById('inputDate').value = item.date;

  ['0_2','2_4','4_6','6_8','8_10','10_12','12_15','over_15'].forEach(sfx => {
    document.getElementById('del_inp_'  + sfx).value = 0;
    document.getElementById('pick_inp_' + sfx).value = 0;
    document.getElementById('ret_inp_'  + sfx).value = 0;
  });

  const prefix = type === 'delivery' ? 'del_inp' : type === 'pickup' ? 'pick_inp' : 'ret_inp';
  const subTab = type === 'delivery' ? 'del'     : type === 'pickup' ? 'pick'    : 'ret';
  document.getElementById('modalSubTabGroup').style.display = 'none';
  switchModalSubTab(subTab);

  const mapKey = {
    w0_2:'0_2', w2_4:'2_4', w4_6:'4_6', w6_8:'6_8',
    w8_10:'8_10', w10_12:'10_12', w12_15:'12_15', wover_15:'over_15'
  };
  Object.keys(mapKey).forEach(k => {
    const inp = document.getElementById(prefix + '_' + mapKey[k]);
    if (inp) inp.value = item.weights[k] || 0;
  });

  document.getElementById('ocrPreviewBox').style.display = 'none';
  clearAllConfidenceHighlightsLocal();
  document.getElementById('entryModal').classList.add('active');
}

export function closeModal(force) {
  if (!force) {
    const hasData = ['del_inp','pick_inp','ret_inp'].some(pfx =>
      ['0_2','2_4','4_6','6_8','8_10','10_12','12_15','over_15'].some(sfx => {
        const el = document.getElementById(pfx + '_' + sfx);
        return el && parseInt(el.value, 10) > 0;
      })
    );
    const isEditing = document.getElementById('editEntryId').value !== '';
    if (hasData && !isEditing && !confirm('Bạn đang có dữ liệu chưa lưu. Đóng và bỏ qua?')) return;
  }
  document.getElementById('entryModal').classList.remove('active');
  state.isOcrScan = false;
  state.lastOcrImageDataUrl = '';
}

// ================ MENU MODAL ================
export function openMenuModal() {
  updateMenuThemeUI();
  document.getElementById('menuModal').classList.add('active');
}
export function closeMenuModal() {
  document.getElementById('menuModal').classList.remove('active');
}

// ================ SETTINGS MODAL ================
export function openSettingsModal() {
  if (typeof window.initCloudUI === 'function') window.initCloudUI();
  document.getElementById('settingsModal').classList.add('active');
}
export function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('active');
}

// ================ GUIDE MODAL ================
export function openGuideModal()  { document.getElementById('guideModal').classList.add('active'); }
export function closeGuideModal() { document.getElementById('guideModal').classList.remove('active'); }

// ================ COFFEE MODAL ================
export function openCoffeeModal()  { document.getElementById('coffeeModal').classList.add('active'); }
export function closeCoffeeModal() { document.getElementById('coffeeModal').classList.remove('active'); }

export function copyBankNumber() {
  const stk = document.getElementById('bankSTK').innerText.trim();
  const btn = document.getElementById('copyBankBtn');
  const ok = () => {
    btn.innerHTML = '✓ Đã sao chép!';
    btn.style.background = 'var(--success)';
    btn.style.borderColor = 'var(--success)';
    setTimeout(() => {
      btn.innerHTML = '📋 Sao chép số tài khoản';
      btn.style.background = '';
      btn.style.borderColor = '';
    }, 2000);
  };
  const fb = () => {
    try {
      const ta = document.createElement('textarea');
      ta.value = stk; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      ok();
    } catch { showToast('STK: ' + stk, 'warning'); }
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(stk).then(ok).catch(fb);
  else fb();
}

// ================ TOAST ================
export function showToast(message, type = 'success', duration = 2200) {
  const toast = document.getElementById('appToast');
  if (!toast) return;
  toast.className = 'app-toast ' + type;
  toast.innerText = message;
  void toast.offsetWidth;
  toast.classList.add('active');
  clearTimeout(window.__spxToastTimer);
  window.__spxToastTimer = setTimeout(() => {
    toast.classList.remove('active');
  }, duration);
}

// ================ HELPERS ================
function clearAllConfidenceHighlightsLocal() {
  ['del_inp','pick_inp','ret_inp'].forEach(pfx =>
    ['0_2','2_4','4_6','6_8','8_10','10_12','12_15','over_15'].forEach(k => {
      const input = document.getElementById(pfx + '_' + k);
      if (!input) return;
      input.classList.remove('conf-high', 'conf-mid', 'conf-low');
      const parent = input.closest('.weight-input-item');
      if (parent) {
        const badge = parent.querySelector('.conf-badge');
        if (badge) badge.remove();
      }
    })
  );
}