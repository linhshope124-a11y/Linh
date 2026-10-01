import { state, persistData } from './state.js';
import { WEIGHT_LABELS, WEIGHT_KEYS, TABLE_4_DATA, TABLE_5_DATA, TABLE_6_DATA } from './config.js';
import { lookupTier, aggregateWeights, isDateInCurrentPeriod } from './calc.js';
import { formatPts, formatDateDisplay, _fmt } from './utils.js';

const NEED_HIGHLIGHT = 'color:#dc2626;font-size:1.35em;font-weight:900;letter-spacing:0.5px;';

let _lastDataHash = null;

function getWorkedDaysByPeriod(period) {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  let ly = cy, lm = cm - 1;
  if (lm === 0) { lm = 12; ly--; }

  const todayIso = `${cy}-${String(cm).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dates = new Set();

  ['delivery', 'pickup', 'return'].forEach(type => {
    state.appData[type].forEach(r => {
      const [ry, rm] = r.date.split('-').map(Number);
      if (period === 'today') {
        if (r.date === todayIso) dates.add(r.date);
      } else if (period === 'last_month') {
        if (ry === ly && rm === lm) dates.add(r.date);
      } else {
        if (ry === cy && rm === cm) dates.add(r.date);
      }
    });
  });
  return dates.size;
}

// ===== ROW bảng 5 cột: KG | SL | Mốc | Điểm | Cần =====
function renderRow(weightLabel, orders, tier, typeClass) {
  const shortLabel = weightLabel.replace(/\s+/g, '').replace('kg', '');

  const ptsText = tier.matched.pt === 0
    ? '<span class="zero-dash">—</span>'
    : _fmt(tier.matched.pt);

  let nextText;
  if (orders <= 0) {
    nextText = '<span class="zero-dash">—</span>';
  } else if (!tier.next || !isFinite(tier.matched.maxA)) {
    nextText = '<span style="color:var(--success);font-weight:700">MAX</span>';
  } else {
    const need = tier.matched.maxA - orders;
    const gain = tier.next.pt - tier.matched.pt;
    nextText = `<span class="need-num">+${_fmt(need)}</span><span class="arrow"> → </span><span class="gain-num">+${_fmt(gain)}đ</span>`;
  }

  return `<td class="weight-name">${shortLabel}</td>
    <td class="order-num ${typeClass} ${orders === 0 ? 'zero' : ''}">${_fmt(orders)}</td>
    <td class="range-cell">${tier.matched.range}</td>
    <td class="points-badge ${orders === 0 ? 'zero' : ''}">${ptsText}</td>
    <td class="next-cell">${nextText}</td>`;
}

function buildOverviewSuggestion(type, label, orders, tier) {
  if (orders <= 0 || !tier.next || !isFinite(tier.matched.maxA)) return null;
  const need  = tier.matched.maxA - orders;
  const badge = type === 'del' ? 'G' : type === 'pick' ? 'L' : 'H';
  const cls   = type === 'del' ? 'sugg-del'  : type === 'pick' ? 'sugg-pick'  : 'sugg-ret';
  const bcls  = type === 'del' ? 'sugg-type-del' : type === 'pick' ? 'sugg-type-pick' : 'sugg-type-ret';
  return `<div class="suggestion-item ${cls}">
    <div class="sugg-left"><h4><span class="sugg-type-badge ${bcls}">${badge}</span> ${label} · ${_fmt(orders)} đơn</h4>
    <p>Thêm <b style="${NEED_HIGHLIGHT}">+${_fmt(need)}</b> đơn đạt ${tier.next.range}</p></div>
    <div class="sugg-points">+${formatPts(tier.next.pt - tier.matched.pt)}</div>
  </div>`;
}

function _updateAllViews() {
  const { agg, total } = aggregateWeights(state.appData, state.periodFilter);

  const delTbody  = document.getElementById('delTableBody');  delTbody.innerHTML = '';
  const pickTbody = document.getElementById('pickTableBody'); pickTbody.innerHTML = '';
  const retTbody  = document.getElementById('retTableBody');  retTbody.innerHTML = '';

  const ovSuggBuf = [];
  let delPts = 0, pickPts = 0, retPts = 0;

  for (let col = 0; col < 8; col++) {
    const dOrders = agg.del[col], pOrders = agg.pick[col], rOrders = agg.ret[col];
    const dTier = lookupTier(dOrders, col, TABLE_5_DATA);
    const pTier = lookupTier(pOrders, col, TABLE_4_DATA);
    const rTier = lookupTier(rOrders, col, TABLE_6_DATA);
    delPts  += dTier.matched.pt;
    pickPts += pTier.matched.pt;
    retPts  += rTier.matched.pt;

    delTbody.insertAdjacentHTML('beforeend',  `<tr>${renderRow(WEIGHT_LABELS[col], dOrders, dTier, 'delivery-num')}</tr>`);
    pickTbody.insertAdjacentHTML('beforeend', `<tr>${renderRow(WEIGHT_LABELS[col], pOrders, pTier, 'pickup-num')}</tr>`);
    retTbody.insertAdjacentHTML('beforeend',  `<tr>${renderRow(WEIGHT_LABELS[col], rOrders, rTier, 'return-num')}</tr>`);

    const o1 = buildOverviewSuggestion('del',  WEIGHT_LABELS[col], dOrders, dTier); if (o1) ovSuggBuf.push(o1);
    const o2 = buildOverviewSuggestion('pick', WEIGHT_LABELS[col], pOrders, pTier); if (o2) ovSuggBuf.push(o2);
    const o3 = buildOverviewSuggestion('ret',  WEIGHT_LABELS[col], rOrders, rTier); if (o3) ovSuggBuf.push(o3);
  }

  const ovBox = document.getElementById('overviewMilestoneList');
  if (total.del + total.pick + total.ret === 0) {
    ovBox.innerHTML = '<div style="font-size:11.5px;color:var(--text-3);text-align:center;padding:16px">Chưa có dữ liệu kỳ này. Bấm menu → Nhập sản lượng để bắt đầu.</div>';
  } else {
    ovBox.innerHTML = ovSuggBuf.join('');
  }

  const rawBase   = delPts + pickPts + retPts;
  const rankBonus = Math.round(rawBase * state.rankBonus);

  // Trần 26 ngày
  const salaryDays = 26;
  const workedDays = getWorkedDaysByPeriod(state.periodFilter);
  const displayDays = workedDays === 0 ? salaryDays : Math.min(workedDays, salaryDays);

  const salaryBase   = state.manualSalary || 0;
  const manualBuuCuc = state.manualPoints?.buuCuc || 0;
  const manualTaiXe  = state.manualPoints?.taiXe  || 0;
  const monthlyTotal = salaryBase + manualBuuCuc + manualTaiXe;

  const perDay = salaryDays > 0 ? monthlyTotal / salaryDays : 0;
  const incomeAccumulated = Math.round(perDay * displayDays);

  const finalTotal  = rawBase + rankBonus + incomeAccumulated;
  const totalOrders = total.del + total.pick + total.ret;

  document.getElementById('overallTotalPoints').innerHTML =
    `${_fmt(finalTotal)} <span class="hero-value-unit">Điểm</span>`;
  document.getElementById('rankBonusDetailText').innerText =
    `Gốc ${_fmt(rawBase)} · Thưởng +${_fmt(rankBonus)} · TN +${_fmt(incomeAccumulated)}`;
  document.getElementById('overallTotalOrders').innerText  = `${_fmt(totalOrders)} đơn`;

  // Ratio bar
  const ratioBar = document.getElementById('ratioBar');
  const pctDelEl  = document.getElementById('ratioPctDel');
  const pctPickEl = document.getElementById('ratioPctPick');
  const pctRetEl  = document.getElementById('ratioPctRet');

  if (totalOrders > 0) {
    if (ratioBar) ratioBar.classList.remove('is-empty');

    const rawDel  = (total.del  / totalOrders) * 100;
    const rawPick = (total.pick / totalOrders) * 100;
    const rawRet  = (total.ret  / totalOrders) * 100;
    let pDel  = Math.floor(rawDel);
    let pPick = Math.floor(rawPick);
    let pRet  = Math.floor(rawRet);
    const remainder = 100 - (pDel + pPick + pRet);
    const fracs = [
      { k: 'del',  f: rawDel  - pDel  },
      { k: 'pick', f: rawPick - pPick },
      { k: 'ret',  f: rawRet  - pRet  }
    ].sort((a, b) => b.f - a.f);
    for (let i = 0; i < remainder; i++) {
      if (fracs[i % 3].k === 'del') pDel++;
      else if (fracs[i % 3].k === 'pick') pPick++;
      else pRet++;
    }
    document.getElementById('ratioBarDel').style.width  = pDel  + '%';
    document.getElementById('ratioBarPick').style.width = pPick + '%';
    document.getElementById('ratioBarRet').style.width  = pRet  + '%';
    if (pctDelEl)  pctDelEl.innerText  = pDel  + '%';
    if (pctPickEl) pctPickEl.innerText = pPick + '%';
    if (pctRetEl)  pctRetEl.innerText  = pRet  + '%';
  } else {
    if (ratioBar) ratioBar.classList.add('is-empty');
    document.getElementById('ratioBarDel').style.width  = '33.3%';
    document.getElementById('ratioBarPick').style.width = '33.3%';
    document.getElementById('ratioBarRet').style.width  = '33.4%';
    if (pctDelEl)  pctDelEl.innerText  = '0%';
    if (pctPickEl) pctPickEl.innerText = '0%';
    if (pctRetEl)  pctRetEl.innerText  = '0%';
  }

  // Mini tiles
  document.getElementById('miniDelPoints').innerText  = _fmt(delPts);
  document.getElementById('miniDelOrders').innerText  = _fmt(total.del);
  document.getElementById('miniPickPoints').innerText = _fmt(pickPts);
  document.getElementById('miniPickOrders').innerText = _fmt(total.pick);
  document.getElementById('miniRetPoints').innerText  = _fmt(retPts);
  document.getElementById('miniRetOrders').innerText  = _fmt(total.ret);

  // Hero tab chi tiết
  document.getElementById('delTotalPoints').innerHTML =
    `${_fmt(delPts)} <span class="hero-value-unit">Điểm</span>`;
  document.getElementById('delTotalOrders').innerText = `${_fmt(total.del)} đơn`;
  document.getElementById('pickTotalPoints').innerHTML =
    `${_fmt(pickPts)} <span class="hero-value-unit">Điểm</span>`;
  document.getElementById('pickTotalOrders').innerText = `${_fmt(total.pick)} đơn`;
  document.getElementById('retTotalPoints').innerHTML =
    `${_fmt(retPts)} <span class="hero-value-unit">Điểm</span>`;
  document.getElementById('retTotalOrders').innerText = `${_fmt(total.ret)} đơn`;

  // Income UI
  const salaryBaseEl   = document.getElementById('salaryBaseInput');
  const buuCucInput    = document.getElementById('manualBuuCucInput');
  const taiXeInput     = document.getElementById('manualTaiXeInput');
  const incomeDayCount = document.getElementById('incomeDayCount');
  const incomePerDay   = document.getElementById('incomePerDayText');
  const incomeTotal    = document.getElementById('incomeTotalDisplay');
  const incomeTotalInner = document.getElementById('incomeTotalDisplayInner');

  if (salaryBaseEl && document.activeElement !== salaryBaseEl) salaryBaseEl.value = salaryBase;
  if (buuCucInput && document.activeElement !== buuCucInput)   buuCucInput.value  = manualBuuCuc;
  if (taiXeInput  && document.activeElement !== taiXeInput)    taiXeInput.value   = manualTaiXe;

  if (incomeDayCount) incomeDayCount.innerText = `${displayDays}/${salaryDays} ngày`;
  if (incomePerDay)   incomePerDay.innerText   = formatPts(Math.round(perDay)) + '/ngày';
  if (incomeTotal)    incomeTotal.innerText    = '+' + formatPts(incomeAccumulated);
  if (incomeTotalInner) incomeTotalInner.innerText = '+' + formatPts(incomeAccumulated);

  // Count
  const filteredCount =
    state.appData.delivery.filter(r => isDateInCurrentPeriod(r.date, state.periodFilter)).length +
    state.appData.pickup.filter(r => isDateInCurrentPeriod(r.date, state.periodFilter)).length +
    state.appData.return.filter(r => isDateInCurrentPeriod(r.date, state.periodFilter)).length;
  document.getElementById('histCountNote').innerText = `${filteredCount} bản ghi`;

  persistData();

  const currentHash = JSON.stringify(state.appData);
  if (_lastDataHash === null) {
    _lastDataHash = currentHash;
  } else if (currentHash !== _lastDataHash) {
    _lastDataHash = currentHash;
    window.dispatchEvent(new CustomEvent('spx:datachanged'));
  }

  renderHistory();
}

let _updateAllViews_debounced = null;
export function updateAllViews() {
  if (!_updateAllViews_debounced) {
    _updateAllViews_debounced = (() => {
      let t = null;
      return () => { clearTimeout(t); t = setTimeout(_updateAllViews, 60); };
    })();
  }
  _updateAllViews_debounced();
}

export function renderHistory() {
  const container = document.getElementById('historyEntries');
  if (!container) return;
  const prevScroll = container.scrollTop;
  container.innerHTML = '';

  let list = [];
  if (state.histFilter === 'all' || state.histFilter === 'delivery')
    state.appData.delivery.forEach(r => list.push({ ...r, type: 'delivery' }));
  if (state.histFilter === 'all' || state.histFilter === 'pickup')
    state.appData.pickup.forEach(r => list.push({ ...r, type: 'pickup' }));
  if (state.histFilter === 'all' || state.histFilter === 'return')
    state.appData.return.forEach(r => list.push({ ...r, type: 'return' }));

  list = list.filter(r => isDateInCurrentPeriod(r.date, state.periodFilter));
  list.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.id - a.id));

  if (list.length === 0) {
    container.innerHTML = '<div style="font-size:11.5px;color:var(--text-3);text-align:center;padding:20px">Chưa có bản ghi nào trong kỳ được chọn.</div>';
    return;
  }

  list.forEach(r => {
    let dayTotal = 0;
    const parts = [];
    WEIGHT_KEYS.forEach((k, col) => {
      const v = parseInt(r.weights[k], 10) || 0;
      dayTotal += v;
      if (v > 0) parts.push(`${WEIGHT_LABELS[col].replace('>', '').replace(' kg', '')}: ${_fmt(v)}`);
    });

    const tagMap = { delivery: ['tag-delivery', 'Giao'], pickup: ['tag-pickup', 'Lấy'], return: ['tag-return', 'Hoàn'] };
    const [tagClass, tagText] = tagMap[r.type];

    const div = document.createElement('div');
    div.className = 'history-entry';
    div.innerHTML = `<div>
      <div class="hist-meta"><span class="hist-badge-tag ${tagClass}">${tagText}</span>${formatDateDisplay(r.date)} · <span>${_fmt(dayTotal)} đơn</span></div>
      <div class="hist-detail">${parts.join(' • ') || '0 đơn'}</div></div>
      <div class="hist-actions">
        <button class="hist-btn hist-edit-btn" onclick="openEditModal('${r.type}', ${r.id})">Sửa</button>
        <button class="hist-btn hist-del-btn" onclick="deleteRecord('${r.type}', ${r.id})">Xóa</button>
      </div>`;
    container.appendChild(div);
  });

  requestAnimationFrame(() => { container.scrollTop = prevScroll; });
}