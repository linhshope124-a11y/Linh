import { TABLE_4_DATA, TABLE_5_DATA, TABLE_6_DATA, WEIGHT_KEYS } from './config.js';

export function lookupTier(orders, colIdx, tableData) {
  if (orders === 0) {
    return {
      matched: { range: "-", pt: 0, maxA: 0 },
      next:    { range: tableData[0].range, min: tableData[0].min, pt: tableData[0].pts[colIdx] },
      pct:     0
    };
  }
  let lo = 0, hi = tableData.length - 1, found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const row = tableData[mid];
    if (orders >= row.min && orders < row.max) { found = mid; break; }
    if (orders < row.min) hi = mid - 1; else lo = mid + 1;
  }
  if (found === -1) {
    const last = tableData[tableData.length - 1];
    return {
      matched: { range: last.range, pt: last.pts[colIdx], maxA: last.max },
      next:    null,
      pct:     100
    };
  }
  const row     = tableData[found];
  const nextRow = tableData[found + 1] || null;
  const span    = row.max - row.min;
  const pct     = Math.min(100, Math.round(((orders - row.min) / span) * 100));
  return {
    matched: { range: row.range, pt: row.pts[colIdx], maxA: row.max },
    next:    nextRow ? { range: nextRow.range, min: nextRow.min, pt: nextRow.pts[colIdx] } : null,
    pct
  };
}

export function isDateInCurrentPeriod(isoDate, period) {
  if (period === 'all') return true;
  if (!isoDate) return false;
  const now = new Date();
  const [y, m, d] = isoDate.split('-').map(Number);
  const curY = now.getFullYear(), curM = now.getMonth() + 1, curD = now.getDate();
  if (period === 'today')      return y === curY && m === curM && d === curD;
  if (period === 'this_month') return y === curY && m === curM;
  if (period === 'last_month') {
    let lm = curM - 1, ly = curY;
    if (lm === 0) { lm = 12; ly--; }
    return y === ly && m === lm;
  }
  return true;
}

export function aggregateWeights(records, period) {
  const agg = { del: [0,0,0,0,0,0,0,0], pick: [0,0,0,0,0,0,0,0], ret: [0,0,0,0,0,0,0,0] };
  const total = { del: 0, pick: 0, ret: 0 };
  records.delivery.filter(r => isDateInCurrentPeriod(r.date, period))
    .forEach(r => WEIGHT_KEYS.forEach((k, i) => { const v = parseInt(r.weights[k], 10) || 0; agg.del[i] += v; total.del += v; }));
  records.pickup.filter(r => isDateInCurrentPeriod(r.date, period))
    .forEach(r => WEIGHT_KEYS.forEach((k, i) => { const v = parseInt(r.weights[k], 10) || 0; agg.pick[i] += v; total.pick += v; }));
  records.return.filter(r => isDateInCurrentPeriod(r.date, period))
    .forEach(r => WEIGHT_KEYS.forEach((k, i) => { const v = parseInt(r.weights[k], 10) || 0; agg.ret[i] += v; total.ret += v; }));
  return { agg, total };
}

export function getTableFor(type) {
  if (type === 'delivery') return TABLE_5_DATA;
  if (type === 'pickup')   return TABLE_4_DATA;
  return TABLE_6_DATA;
}