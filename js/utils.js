const _nf = new Intl.NumberFormat('vi-VN');
export const _fmt = n => _nf.format(n);

export const generateId  = () => Date.now() * 1000 + Math.floor(Math.random() * 1000);
export const sanitizeInt = v  => { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : 0; };
export const formatPts   = n  => _fmt(Math.round(n)) + ' Điểm';

export function getTodayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDateDisplay(iso) {
  if (!iso) return '';
  const p = iso.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
}

export function debounce(fn, delay) {
  let t = null;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}