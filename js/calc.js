import { TABLE_4_DATA, TABLE_5_DATA, TABLE_6_DATA, WEIGHT_KEYS } from './config.js';
import { getCurrentMonthIso } from './utils.js';

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

/**
 * v42: Kiểm tra 1 ngày có thuộc kỳ đang xem hay không
 *
 * @param {string} isoDate     - Ngày dạng "2026-10-02"
 * @param {string} period      - 'month' | 'today' | (backward compat: 'all', 'this_month', 'last_month')
 * @param {string} currentMonth - Tháng đang chọn dạng "2026-10" (chỉ dùng khi period='month')
 * @returns {boolean}
 */
export function isDateInCurrentPeriod(isoDate, period, currentMonth) {
  if (period === 'all') return true;
  if (!isoDate || typeof isoDate !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;

  const [y, m, d] = isoDate.split('-').map(Number);
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;
  const curD = now.getDate();

  // ===== v42: 'month' — dùng currentMonth =====
  if (period === 'month') {
    const cm = currentMonth || getCurrentMonthIso();
    const [cmY, cmM] = cm.split('-').map(Number);
    return y === cmY && m === cmM;
  }

  if (period === 'today') {
    return y === curY && m === curM && d === curD;
  }

  // ===== Backward compat (không dùng nữa nhưng giữ để không crash) =====
  if (period === 'this_month') {
    return y === curY && m === curM;
  }
  if (period === 'last_month') {
    let lm = curM - 1, ly = curY;
    if (lm === 0) { lm = 12; ly--; }
    return y === ly && m === lm;
  }

  return true;
}

/**
 * v42: Aggregate weights theo kỳ đang xem
 *
 * @param {object} records      - state.appData
 * @param {string} period       - 'month' | 'today' | ...
 * @param {string} currentMonth - "2026-10"
 */
export function aggregateWeights(records, period, currentMonth) {
  const agg = { del: [0,0,0,0,0,0,0,0], pick: [0,0,0,0,0,0,0,0], ret: [0,0,0,0,0,0,0,0] };
  const total = { del: 0, pick: 0, ret: 0 };

  records.delivery
    .filter(r => isDateInCurrentPeriod(r.date, period, currentMonth))
    .forEach(r => WEIGHT_KEYS.forEach((k, i) => {
      const v = parseInt(r.weights[k], 10) || 0;
      agg.del[i] += v;
      total.del += v;
    }));

  records.pickup
    .filter(r => isDateInCurrentPeriod(r.date, period, currentMonth))
    .forEach(r => WEIGHT_KEYS.forEach((k, i) => {
      const v = parseInt(r.weights[k], 10) || 0;
      agg.pick[i] += v;
      total.pick += v;
    }));

  records.return
    .filter(r => isDateInCurrentPeriod(r.date, period, currentMonth))
    .forEach(r => WEIGHT_KEYS.forEach((k, i) => {
      const v = parseInt(r.weights[k], 10) || 0;
      agg.ret[i] += v;
      total.ret += v;
    }));

  return { agg, total };
}

export function getTableFor(type) {
  if (type === 'delivery') return TABLE_5_DATA;
  if (type === 'pickup')   return TABLE_4_DATA;
  return TABLE_6_DATA;
}