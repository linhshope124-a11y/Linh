import { state, persistSettings } from './state.js';
import { updateAllViews, renderHistory } from './render.js';

// ================ TABS ================
export function switchMainTab(tabId, el) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');

  if (tabId === 'history') {
    state.histFilter = 'all';
    document.querySelectorAll('#tab-history .history-filter-bar .filter-btn')
      .forEach((b, i) => b.classList.toggle('active', i === 0));
    renderHistory();
  }
}

export function switchModalSubTab(tabKey) {
  ['del', 'pick', 'ret'].forEach(k => {
    document.getElementById('subtab-btn-' + k).classList.remove('active');
    document.getElementById('pane-' + k).style.display = 'none';
  });
  document.getElementById('subtab-btn-' + tabKey).classList.add('active');
  document.getElementById('pane-' + tabKey).style.display = 'block';
}

// ================ FILTERS ================
export function setOverviewFilter(filter, el) {
  state.overviewFilter = filter;
  const bar = el.closest('.history-filter-bar');
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
  const bar = btn.closest('.history-filter-bar');
  if (bar) bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderHistory();
}

// ================ RANK ================
export function setRankTier(rankKey, bonusPct, el) {
  state.rankBonus = bonusPct;
  state.rankName  = rankKey;
  persistSettings();
  el.parentElement.querySelectorAll('.rank-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('currentBonusPctLabel').innerText = `+${Math.round(bonusPct * 100)}%`;
  updateAllViews();
}

export function initRankUI() {
  document.querySelectorAll('.rank-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.rank === state.rankName);
  });
  document.getElementById('currentBonusPctLabel').innerText = `+${Math.round(state.rankBonus * 100)}%`;
}

// ================ MODALS ================
export function openAddModal() {
  document.getElementById('modalTitle').innerText = 'Nhập sản lượng ngày';
  document.getElementById('editEntryId').value = '';
  document.getElementById('editEntryType').value = '';
  document.getElementById('modalSubTabGroup').style.display = 'flex';
  document.getElementById('inputDate').value = getTodayIsoLocal();

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
}

export function openSettingsModal() {
  if (typeof window.initCloudUI === 'function') window.initCloudUI();
  document.getElementById('settingsModal').classList.add('active');
}
export function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('active');
}

export function openCoffeeModal()  { document.getElementById('coffeeModal').classList.add('active'); }
export function closeCoffeeModal() { document.getElementById('coffeeModal').classList.remove('active'); }

export function copyPhoneNumber() {
  const phone = document.getElementById('coffeePhone').innerText.trim();
  const btn = document.getElementById('copyPhoneBtn');
  const ok = () => {
    btn.innerHTML = '✓ Đã chép!';
    btn.style.background = 'var(--success)';
    btn.style.borderColor = 'var(--success)';
    setTimeout(() => { btn.innerHTML = 'Chép'; btn.style.background = ''; btn.style.borderColor = ''; }, 2000);
  };
  const fb = () => {
    try {
      const ta = document.createElement('textarea');
      ta.value = phone; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      ok();
    } catch { showToast('Số: ' + phone, 'warning'); }
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(phone).then(ok).catch(fb);
  else fb();
}

export function copyBankNumber() {
  const stk = document.getElementById('bankSTK').innerText.trim();
  const btn = document.getElementById('copyBankBtn');
  const ok = () => {
    btn.innerHTML = '✓ Đã chép!';
    btn.style.background = 'var(--success)';
    btn.style.borderColor = 'var(--success)';
    setTimeout(() => { btn.innerHTML = 'Chép'; btn.style.background = ''; btn.style.borderColor = ''; }, 2000);
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
  // Trigger reflow để animation chạy lại nếu toast đang active
  void toast.offsetWidth;
  toast.classList.add('active');
  clearTimeout(window.__spxToastTimer);
  window.__spxToastTimer = setTimeout(() => {
    toast.classList.remove('active');
  }, duration);
}

// ================ HELPERS ================
function getTodayIsoLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
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