import { state, persistData } from './state.js';
import { WEIGHT_LABELS, WEIGHT_KEYS, TABLE_4_DATA, TABLE_5_DATA, TABLE_6_DATA } from './config.js';
import { lookupTier, aggregateWeights, isDateInCurrentPeriod } from './calc.js';
import { formatPts, formatDateDisplay, _fmt } from './utils.js';

const NEED_HIGHLIGHT = 'color:#dc2626;font-size:1.35em;font-weight:900;letter-spacing:0.5px;';
const NEAR_MOC_THRESHOLD = 0.2;   // trong 20% cuối → coi là gần mốc

let _lastDataHash = null;

// ===== Ngưỡng công theo khu vực =====
function getRegionThresholds(region) {
  if (region === 'hcm_hn') return { full: 80, half: 40 };
  return { full: 60, half: 30 };
}

// ===== Số ngày tối đa theo tháng =====
function getSalaryDaysForPeriod(period) {
  const now = new Date();
  let month = now.getMonth() + 1;
  if (period === 'last_month') {
    month -= 1;
    if (month === 0) month = 12;
  }
  return month === 2 ? 24 : 26;
}

// ===== Tính công =====
function getWorkDaysByPeriod(period, region) {
  const dailyByType = {};
  ['delivery', 'pickup', 'return'].forEach(type => {
    const key = type === 'delivery' ? 'del' : type === 'pickup' ? 'pick' : 'ret';
    state.appData[type].forEach(r => {
      if (!isDateInCurrentPeriod(r.date, period)) return;
      if (!dailyByType[r.date]) dailyByType[r.date] = { del: 0, pick: 0, ret: 0 };
      const dayTotal = WEIGHT_KEYS.reduce(
        (sum, k) => sum + (parseInt(r.weights[k], 10) || 0), 0
      );
      dailyByType[r.date][key] += dayTotal;
    });
  });

  const { full, half } = getRegionThresholds(region);
  let workDays = 0;
  Object.values(dailyByType).forEach(({ del, pick, ret }) => {
    const converted = del + (pick / 6) + ret;
    if (converted >= full)      workDays += 1;
    else if (converted >= half) workDays += 0.5;
  });
  return workDays;
}

// ===== Tính delta so với kỳ trước =====
function getCompareTotal() {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;

  let targetY, targetM, targetD = null;
  if (state.periodFilter === 'this_month') {
    let lm = cm - 1, ly = cy;
    if (lm === 0) { lm = 12; ly--; }
    targetY = ly; targetM = lm;
  } else if (state.periodFilter === 'last_month') {
    let lm = cm - 2, ly = cy;
    if (lm <= 0) { lm += 12; ly--; }
    targetY = ly; targetM = lm;
  } else if (state.periodFilter === 'today') {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    targetY = y.getFullYear();
    targetM = y.getMonth() + 1;
    targetD = y.getDate();
  } else {
    return null;
  }

  let total = 0;
  ['delivery', 'pickup', 'return'].forEach(type => {
    state.appData[type].forEach(r => {
      const [ry, rm, rd] = r.date.split('-').map(Number);
      if (ry === targetY && rm === targetM && (targetD === null || rd === targetD)) {
        total += WEIGHT_KEYS.reduce((s, k) => s + (parseInt(r.weights[k], 10) || 0), 0);
      }
    });
  });
  return total;
}

// ===== Render delta badge =====
function renderDelta(elId, currentTotal) {
  const el = document.getElementById(elId);
  if (!el) return;
  const compare = getCompareTotal();
  if (compare === null || compare === 0) {
    el.textContent = '';
    el.className = 'hero-delta';
    return;
  }
  const diff = currentTotal - compare;
  const pct = Math.round((diff / compare) * 100);
  if (diff > 0) {
    el.textContent = `▲ +${pct}%`;
    el.className = 'hero-delta up';
  } else if (diff < 0) {
    el.textContent = `▼ ${pct}%`;
    el.className = 'hero-delta down';
  } else {
    el.textContent = '— 0%';
    el.className = 'hero-delta flat';
  }
}

// ===== Render sparkline 7 ngày =====
function renderSparkline(containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let total = 0;
    const types = type === 'all' ? ['delivery', 'pickup', 'return'] : [type];
    types.forEach(t => {
      state.appData[t].forEach(r => {
        if (r.date === iso) {
          total += WEIGHT_KEYS.reduce((s, k) => s + (parseInt(r.weights[k], 10) || 0), 0);
        }
      });
    });
    days.push(total);
  }

  const max = Math.max(...days, 1);
  const w = 100, h = 40;
  const pad = 3;
  const step = days.length > 1 ? (w - pad * 2) / (days.length - 1) : 0;

  const points = days.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const areaPoints = `${pad},${h - pad} ${points} ${w - pad},${h - pad}`;

  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:100%">
      <polyline points="${areaPoints}" fill="currentColor" opacity="0.15" stroke="none"/>
      <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    </svg>
  `;
}

// ===== ROW bảng 5 cột =====
function renderRow(weightLabel, orders, tier, typeClass, typeKey) {
  const shortLabel = weightLabel.replace(/\s+/g, '').replace('kg', '');

  const ptsText = tier.matched.pt === 0
    ? '<span class="zero-dash">—</span>'
    : _fmt(tier.matched.pt);

  let nextText;
  let isNear = false;
  if (orders <= 0) {
    nextText = '<span class="zero-dash">—</span>';
  } else if (!tier.next || !isFinite(tier.matched.maxA)) {
    nextText = '<span style="color:var(--success);font-weight:700">MAX</span>';
  } else {
    const need = tier.matched.maxA - orders;
    const gain = tier.next.pt - tier.matched.pt;
    const rangeSpan = tier.matched.maxA - (tier.matched.min || 0);
    if (rangeSpan > 0 && need / rangeSpan <= NEAR_MOC_THRESHOLD) isNear = true;
    nextText = `<span class="need-num">+${_fmt(need)}</span><span class="dot-sep">·</span><span class="gain-num">+${_fmt(gain)}đ</span>`;
  }

  // Progress bar mini dưới SL
  const pct = Math.min(100, Math.max(0, tier.pct));

  return `<td class="weight-name">${shortLabel}</td>
    <td class="order-num ${typeClass} ${orders === 0 ? 'zero' : ''}">
      <div class="sl-wrap">
        <span>${_fmt(orders)}</span>
        <div class="sl-bar"><div class="sl-bar-fill" style="width:${pct}%"></div></div>
      </div>
    </td>
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

    // Row Giao
    const dNear = (dOrders > 0 && dTier.next && isFinite(dTier.matched.maxA)
      && (dTier.matched.maxA - dOrders) / (dTier.matched.maxA - (dTier.matched.min || 0)) <= NEAR_MOC_THRESHOLD);
    const dTr = `<tr class="${dNear ? 'row-near' : ''}">${renderRow(WEIGHT_LABELS[col], dOrders, dTier, 'delivery-num', 'delivery')}</tr>`;
    delTbody.insertAdjacentHTML('beforeend', dTr);

    // Row Lấy
    const pNear = (pOrders > 0 && pTier.next && isFinite(pTier.matched.maxA)
      && (pTier.matched.maxA - pOrders) / (pTier.matched.maxA - (pTier.matched.min || 0)) <= NEAR_MOC_THRESHOLD);
    const pTr = `<tr class="${pNear ? 'row-near-pick' : ''}">${renderRow(WEIGHT_LABELS[col], pOrders, pTier, 'pickup-num', 'pickup')}</tr>`;
    pickTbody.insertAdjacentHTML('beforeend', pTr);

    // Row Hoàn
    const rNear = (rOrders > 0 && rTier.next && isFinite(rTier.matched.maxA)
      && (rTier.matched.maxA - rOrders) / (rTier.matched.maxA - (rTier.matched.min || 0)) <= NEAR_MOC_THRESHOLD);
    const rTr = `<tr class="${rNear ? 'row-near-ret' : ''}">${renderRow(WEIGHT_LABELS[col], rOrders, rTier, 'return-num', 'return')}</tr>`;
    retTbody.insertAdjacentHTML('beforeend', rTr);

    const o1 = buildOverviewSuggestion('del',  WEIGHT_LABELS[col], dOrders, dTier); if (o1) ovSuggBuf.push(o1);
    const o2 = buildOverviewSuggestion('pick', WEIGHT_LABELS[col], pOrders, pTier); if (o2) ovSuggBuf.push(o2);
    const o3 = buildOverviewSuggestion('ret',  WEIGHT_LABELS[col], rOrders, rTier); if (o3) ovSuggBuf.push(o3);
  }

  const ovBox = document.getElementById('overviewMilestoneList');
  if (total.del + total.pick + total.ret === 0) {
    ovBox.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🎯</div>
      <div class="empty-title">Chưa có dữ liệu kỳ này</div>
      <div class="empty-sub">Nhấn nút Quét hoặc vào menu → Nhập sản lượng để bắt đầu theo dõi</div>
    </div>`;
  } else if (ovSuggBuf.length === 0) {
    ovBox.innerHTML = `<div class="empty-state">
      <div class="empty-icon">✨</div>
      <div class="empty-title">Đang ở mức tối ưu</div>
      <div class="empty-sub">Tất cả dải đều đã đạt mốc cao hoặc chưa có gợi ý cải thiện</div>
    </div>`;
  } else {
    ovBox.innerHTML = ovSuggBuf.join('');
  }

  const rawBase   = delPts + pickPts + retPts;
  const rankBonus = Math.round(rawBase * state.rankBonus);

  const salaryDays = getSalaryDaysForPeriod(state.periodFilter);
  const workDays   = getWorkDaysByPeriod(state.periodFilter, state.region);
  const displayDays = Math.min(workDays, salaryDays);

  const salaryBase   = state.manualSalary || 0;
  const manualBuuCuc = state.manualPoints?.buuCuc || 0;
  const manualTaiXe  = state.manualPoints?.taiXe  || 0;
  const monthlyTotal = salaryBase + manualBuuCuc + manualTaiXe;

  const perDay = salaryDays > 0 ? monthlyTotal / salaryDays : 0;
  const incomeAccumulated = Math.round(perDay * displayDays);

  const finalTotal  = rawBase + rankBonus + incomeAccumulated;
  const totalOrders = total.del + total.pick + total.ret;

  // ===== HERO =====
  const heroValueEl = document.getElementById('overallTotalPoints');
  const heroSubEl   = document.getElementById('rankBonusDetailText');
  const heroPillEl  = document.getElementById('overallTotalOrders');
  const deltaEl     = document.getElementById('overallDelta');

  if (totalOrders === 0) {
    heroValueEl.innerHTML = '<span style="font-size:0.45em;color:var(--text-3);font-weight:600;letter-spacing:0">Chưa có dữ liệu</span>';
    heroSubEl.innerText = 'Bắt đầu nhập sản lượng để tính điểm';
    heroPillEl.innerText = '0 đơn';
    if (deltaEl) { deltaEl.textContent = ''; deltaEl.className = 'hero-delta'; }
  } else {
    heroValueEl.innerHTML = `${_fmt(finalTotal)} <span class="hero-value-unit">Điểm</span>`;
    heroSubEl.innerText = `Gốc ${_fmt(rawBase)} · Thưởng +${_fmt(rankBonus)} · TN +${_fmt(incomeAccumulated)}`;
    heroPillEl.innerText = `${_fmt(totalOrders)} đơn`;
  }

  // ===== DELTA cho 4 tab =====
  renderDelta('overallDelta', totalOrders);
  renderDelta('delDelta',  total.del);
  renderDelta('pickDelta', total.pick);
  renderDelta('retDelta',  total.ret);

  // ===== SPARKLINE =====
  renderSparkline('heroSparkline', 'all');
  renderSparkline('delSparkline',  'delivery');
  renderSparkline('pickSparkline', 'pickup');
  renderSparkline('retSparkline',  'return');

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

  const workDaysText = Number.isInteger(displayDays)
    ? displayDays.toString()
    : displayDays.toFixed(1);

  if (incomeDayCount) incomeDayCount.innerText = `${workDaysText}/${salaryDays} công`;
  if (incomePerDay)   incomePerDay.innerText   = formatPts(Math.round(perDay)) + '/công';
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