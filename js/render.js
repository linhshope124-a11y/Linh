import { state, persistData } from './state.js';
import { WEIGHT_LABELS, WEIGHT_KEYS, TABLE_4_DATA, TABLE_5_DATA, TABLE_6_DATA } from './config.js';
import { lookupTier, aggregateWeights, isDateInCurrentPeriod } from './calc.js';
import { formatPts, formatDateDisplay, _fmt } from './utils.js';

const NEED_HIGHLIGHT = 'color:#dc2626;font-size:1.35em;font-weight:900;letter-spacing:0.5px;';

// Đếm số ngày công theo kỳ đang chọn
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
        // 'all' và 'this_month' đều tính tháng hiện tại
        if (ry === cy && rm === cm) dates.add(r.date);
      }
    });
  });
  return dates.size;
}

function renderRow(weightLabel, orders, tier, typeClass) {
  const ptsText = tier.matched.pt === 0
    ? '<span style="color:var(--text-3);font-weight:400">—</span>'
    : `<span style="color:var(--accent);font-weight:700">${_fmt(tier.matched.pt)}</span><span style="font-size:9px;color:var(--text-3);margin-left:1px;font-weight:500">đ</span>`;

  return `<td class="weight-name">${weightLabel}</td>
    <td class="order-num ${typeClass} ${orders === 0 ? 'zero' : ''}">${_fmt(orders)}<div class="bar-container"><div class="bar-fill ${typeClass.replace('-num','')}" style="width:${tier.pct}%"></div></div></td>
    <td style="color:var(--text-3);font-size:11px">${tier.matched.range}</td>
    <td class="points-badge ${orders === 0 ? 'zero' : ''}">${ptsText}</td>`;
}

function buildSuggestion(label, orders, tier) {
  if (orders <= 0 || !tier.next || !isFinite(tier.matched.maxA)) return null;
  const need = tier.matched.maxA - orders;
  return `<div class="suggestion-item">
    <div class="sugg-left"><h4>${label} · ${_fmt(orders)} đơn (${tier.matched.range})</h4>
    <p>Cần thêm <b style="${NEED_HIGHLIGHT}">+${_fmt(need)}</b> đơn để đạt mốc ${tier.next.range}</p></div>
    <div class="sugg-points">+${formatPts(tier.next.pt - tier.matched.pt)}</div>
  </div>`;
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

  const delSuggBuf = [], pickSuggBuf = [], retSuggBuf = [], ovSuggBuf = [];
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

    const s1 = buildSuggestion(WEIGHT_LABELS[col], dOrders, dTier); if (s1) delSuggBuf.push(s1);
    const s2 = buildSuggestion(WEIGHT_LABELS[col], pOrders, pTier); if (s2) pickSuggBuf.push(s2);
    const s3 = buildSuggestion(WEIGHT_LABELS[col], rOrders, rTier); if (s3) retSuggBuf.push(s3);
    const o1 = buildOverviewSuggestion('del',  WEIGHT_LABELS[col], dOrders, dTier); if (o1) ovSuggBuf.push(o1);
    const o2 = buildOverviewSuggestion('pick', WEIGHT_LABELS[col], pOrders, pTier); if (o2) ovSuggBuf.push(o2);
    const o3 = buildOverviewSuggestion('ret',  WEIGHT_LABELS[col], rOrders, rTier); if (o3) ovSuggBuf.push(o3);
  }

  const emptyMsg = t => `<div style="font-size:11.5px;color:var(--text-muted);text-align:center;padding:14px">Chưa có dữ liệu đơn ${t} kỳ này.</div>`;
  document.getElementById('delMilestoneList').innerHTML  = delSuggBuf.join('')  || (total.del  === 0 ? emptyMsg('giao') : '');
  document.getElementById('pickMilestoneList').innerHTML = pickSuggBuf.join('') || (total.pick === 0 ? emptyMsg('lấy')  : '');
  document.getElementById('retMilestoneList').innerHTML  = retSuggBuf.join('')  || (total.ret  === 0 ? emptyMsg('hoàn') : '');

  const ovBox = document.getElementById('overviewMilestoneList');
  if (total.del + total.pick + total.ret === 0) {
    ovBox.innerHTML = '<div style="font-size:11.5px;color:var(--text-muted);text-align:center;padding:14px">Chưa có dữ liệu kỳ này. Bấm "＋ Nhập" để bắt đầu.</div>';
  } else {
    ovBox.innerHTML = ovSuggBuf.join('');
  }

  const rawBase   = delPts + pickPts + retPts;
  const rankBonus = Math.round(rawBase * state.rankBonus);

  // === Ngày công theo kỳ ===
  const salaryDays = 26;
  const workedDays = getWorkedDaysByPeriod(state.periodFilter);
  const displayDays = workedDays === 0 ? salaryDays : Math.min(workedDays, salaryDays);

  // === Lương tổng tháng ===
  const salaryBase   = state.manualSalary || 0;
  const manualBuuCuc = state.manualPoints?.buuCuc || 0;
  const manualTaiXe  = state.manualPoints?.taiXe  || 0;
  const monthlyTotal = salaryBase + manualBuuCuc + manualTaiXe;

  // === Lương 1 ngày ===
  const perDay = salaryDays > 0 ? monthlyTotal / salaryDays : 0;
  const incomeAccumulated = Math.round(perDay * displayDays);

  const finalTotal  = rawBase + rankBonus + incomeAccumulated;
  const totalOrders = total.del + total.pick + total.ret;

  document.getElementById('overallTotalPoints').innerText  = formatPts(finalTotal);
  document.getElementById('rankBonusDetailText').innerText = `Gốc: ${formatPts(rawBase)} · Thưởng: +${formatPts(rankBonus)} · Thu nhập: +${formatPts(incomeAccumulated)}`;
  document.getElementById('overallTotalOrders').innerText  = `${_fmt(totalOrders)} đơn`;

  if (totalOrders > 0) {
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
    document.getElementById('ratioText').innerText = `${pDel}% G · ${pPick}% L · ${pRet}% H`;
  } else {
    document.getElementById('ratioBarDel').style.width  = '33.3%';
    document.getElementById('ratioBarPick').style.width = '33.3%';
    document.getElementById('ratioBarRet').style.width  = '33.4%';
    document.getElementById('ratioText').innerText = '0% G · 0% L · 0% H';
  }

  document.getElementById('miniDelPoints').innerText  = formatPts(delPts);
  document.getElementById('miniDelOrders').innerText  = `${_fmt(total.del)} đơn`;
  document.getElementById('miniPickPoints').innerText = formatPts(pickPts);
  document.getElementById('miniPickOrders').innerText = `${_fmt(total.pick)} đơn`;
  document.getElementById('miniRetPoints').innerText  = formatPts(retPts);
  document.getElementById('miniRetOrders').innerText  = `${_fmt(total.ret)} đơn`;

  document.getElementById('delTotalPoints').innerText  = formatPts(delPts);
  document.getElementById('delTotalOrders').innerText  = `${_fmt(total.del)} đơn`;
  document.getElementById('pickTotalPoints').innerText = formatPts(pickPts);
  document.getElementById('pickTotalOrders').innerText = `${_fmt(total.pick)} đơn`;
  document.getElementById('retTotalPoints').innerText  = formatPts(retPts);
  document.getElementById('retTotalOrders').innerText  = `${_fmt(total.ret)} đơn`;

  // === Update UI Thu nhập ===
  const salaryBaseEl   = document.getElementById('salaryBaseInput');
  const buuCucInput    = document.getElementById('manualBuuCucInput');
  const taiXeInput     = document.getElementById('manualTaiXeInput');
  const incomeDayCount = document.getElementById('incomeDayCount');
  const incomePerDay   = document.getElementById('incomePerDayText');
  const incomeTotal    = document.getElementById('incomeTotalDisplay');
  const incomeTotalInner = document.getElementById('incomeTotalDisplayInner');
  const incomeLabelEl  = document.getElementById('incomePeriodLabel');

  if (salaryBaseEl && document.activeElement !== salaryBaseEl) salaryBaseEl.value = salaryBase;
  if (buuCucInput && document.activeElement !== buuCucInput)   buuCucInput.value  = manualBuuCuc;
  if (taiXeInput  && document.activeElement !== taiXeInput)    taiXeInput.value   = manualTaiXe;

  if (incomeDayCount) incomeDayCount.innerText = `${displayDays}/${salaryDays} ngày`;
  if (incomePerDay)   incomePerDay.innerText   = formatPts(Math.round(perDay)) + '/ngày';
  if (incomeTotal)    incomeTotal.innerText    = '+' + formatPts(incomeAccumulated);
  if (incomeTotalInner) incomeTotalInner.innerText = '+' + formatPts(incomeAccumulated);

  // Label kỳ đang xem
  if (incomeLabelEl) {
    const map = {
      'all':         '(tháng này)',
      'this_month':  '(tháng này)',
      'last_month':  '(tháng trước)',
      'today':       '(hôm nay)'
    };
    incomeLabelEl.innerText = map[state.periodFilter] || '(tháng này)';
  }

  // Cảnh báo chưa nhập ngày công tháng này
  const incomeBox = document.getElementById('incomeContent') || document.getElementById('incomeDetails');
  if (incomeBox) {
    let warnEl = incomeBox.querySelector('.income-warning');
    if (workedDays === 0 && state.periodFilter === 'this_month') {
      if (!warnEl) {
        warnEl = document.createElement('div');
        warnEl.className = 'income-warning';
        warnEl.style.cssText = 'font-size:10.5px;color:var(--warning);margin-top:10px;text-align:center;padding:8px;background:var(--warning-soft);border-radius:8px;border:1px solid var(--warning-border);font-weight:500';
        warnEl.innerText = 'Chưa nhập ngày công tháng này — đang tạm tính 26/26 ngày';
        incomeBox.appendChild(warnEl);
      }
    } else if (warnEl) {
      warnEl.remove();
    }
  }

  const filteredCount =
    state.appData.delivery.filter(r => isDateInCurrentPeriod(r.date, state.periodFilter)).length +
    state.appData.pickup.filter(r => isDateInCurrentPeriod(r.date, state.periodFilter)).length +
    state.appData.return.filter(r => isDateInCurrentPeriod(r.date, state.periodFilter)).length;
  document.getElementById('histCountNote').innerText = `${filteredCount} bản ghi`;

  persistData();
  window.dispatchEvent(new CustomEvent('spx:datachanged'));
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
    container.innerHTML = '<div style="font-size:11.5px;color:var(--text-muted);text-align:center;padding:20px">Chưa có bản ghi nào trong kỳ được chọn.</div>';
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