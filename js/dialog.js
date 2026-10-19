// ==================== DIALOG MODULE ====================
// Thay thế alert() / confirm() bằng custom modal đẹp
// API:
//   await showAlert(message, { title, okText })
//   const ok = await showConfirm(message, { title, okText, cancelText, danger })
//   const choice = await showChoice(message, { title, icon, buttons })
// ======================================================

let _currentResolve = null;
let _currentType = 'alert';   // 'alert' | 'confirm'

export function isDialogOpen() {
  return _currentResolve !== null;
}

/**
 * Hiện dialog thông báo (thay alert())
 */
export function showAlert(message, options = {}) {
  return new Promise(resolve => {
    _openDialog({
      type: 'alert',
      title: options.title || 'Thông báo',
      message: String(message),
      okText: options.okText || 'OK',
      cancelText: '',
      danger: false,
      resolve
    });
  });
}

/**
 * Hiện dialog xác nhận (thay confirm())
 */
export function showConfirm(message, options = {}) {
  return new Promise(resolve => {
    _openDialog({
      type: 'confirm',
      title: options.title || 'Xác nhận',
      message: String(message),
      okText: options.okText || 'Đồng ý',
      cancelText: options.cancelText || 'Hủy',
      danger: !!options.danger,
      resolve
    });
  });
}

/**
 * Dialog nhiều lựa chọn (2-4 nút dọc).
 * @param {string} message
 * @param {object} options
 *   - title: string
 *   - icon: string (emoji)
 *   - buttons: [{ id, text, variant }]
 *       variant: 'primary' | 'danger' | 'ghost'
 * @returns {Promise<string>} id của button được bấm, hoặc 'cancel' nếu đóng dialog
 *
 * ⚠️ Tạo modal riêng (không dùng #dialogModal) → không đụng logic showAlert/showConfirm cũ.
 */
export function showChoice(message, options = {}) {
  return new Promise(resolve => {
    const buttons = options.buttons || [
      { id: 'cancel', text: 'Hủy', variant: 'ghost' },
      { id: 'ok',     text: 'OK',  variant: 'primary' }
    ];

    // Tạo modal mới hoàn toàn — tránh conflict với #dialogModal cũ
    const shade = document.createElement('div');
    shade.className = 'modal-shade dialog-shade active';
    shade.style.zIndex = '500';

    const box = document.createElement('div');
    box.className = 'dialog-box';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'dialog-icon-wrap';
    const iconEl = document.createElement('span');
    iconEl.className = 'dialog-icon';
    iconEl.textContent = options.icon || '❓';
    iconWrap.appendChild(iconEl);

    const titleEl = document.createElement('h3');
    titleEl.className = 'dialog-title';
    titleEl.textContent = options.title || 'Chọn hành động';

    const msgEl = document.createElement('div');
    msgEl.className = 'dialog-message';
    msgEl.textContent = String(message);

    const actionsEl = document.createElement('div');
    actionsEl.className = 'dialog-actions';
    actionsEl.style.flexDirection = 'column';
    actionsEl.style.gap = '8px';

    let resolved = false;
    const finish = (id) => {
      if (resolved) return;
      resolved = true;
      document.removeEventListener('keydown', onKey);
      shade.remove();
      resolve(id);
    };

    buttons.forEach(btn => {
      const el = document.createElement('button');
      el.className = 'dialog-btn';
      el.style.width = '100%';

      if (btn.variant === 'primary') {
        el.classList.add('dialog-btn-ok');
      } else if (btn.variant === 'danger') {
        el.classList.add('dialog-btn-ok', 'dialog-btn-danger');
      } else {
        el.classList.add('dialog-btn-cancel');
      }

      el.textContent = btn.text;
      el.onclick = () => finish(btn.id);
      actionsEl.appendChild(el);
    });

    box.appendChild(iconWrap);
    box.appendChild(titleEl);
    box.appendChild(msgEl);
    box.appendChild(actionsEl);
    shade.appendChild(box);

    // Backdrop click = cancel
    shade.onclick = e => { if (e.target === shade) finish('cancel'); };

    // ESC = cancel
    const onKey = e => { if (e.key === 'Escape') finish('cancel'); };
    document.addEventListener('keydown', onKey);

    document.body.appendChild(shade);
  });
}

/**
 * Mở dialog nội bộ (cho showAlert/showConfirm)
 *
 * Nếu đang có dialog mở → BLOCK dialog mới (không đóng dialog cũ).
 * Dialog mới tự resolve với giá trị mặc định:
 *   - confirm → false (coi như user Cancel)
 *   - alert   → undefined
 */
function _openDialog({ type, title, message, okText, cancelText, danger, resolve }) {
  // ⚠️ Có dialog đang mở → block, không tự đóng dialog cũ
  if (_currentResolve) {
    console.warn('[Dialog] Bị block — dialog khác đang mở:', {
      currentType: _currentType,
      newType: type,
      newTitle: title
    });
    resolve(type === 'confirm' ? false : undefined);
    return;
  }

  _currentResolve = resolve;
  _currentType = type;

  const shade    = document.getElementById('dialogModal');
  const titleEl  = document.getElementById('dialogTitle');
  const msgEl    = document.getElementById('dialogMessage');
  const iconEl   = document.getElementById('dialogIcon');
  const okBtn    = document.getElementById('dialogOkBtn');
  const cancelBtn = document.getElementById('dialogCancelBtn');

  // Fallback nếu HTML chưa có dialog modal
  if (!shade || !titleEl || !msgEl || !okBtn || !cancelBtn) {
    console.warn('[Dialog] Modal chưa có trong HTML → fallback về native');
    _currentResolve = null;
    _currentType = 'alert';
    if (type === 'confirm') {
      resolve(window.confirm(message));
    } else {
      window.alert(message);
      resolve(undefined);
    }
    return;
  }

  // Set nội dung
  titleEl.innerText = title;
  msgEl.innerText = message;
  okBtn.innerText = okText;

  // Icon theo loại
  if (iconEl) {
    if (danger) iconEl.innerText = '⚠️';
    else if (type === 'confirm') iconEl.innerText = '❓';
    else iconEl.innerText = 'ℹ️';
  }

  // Style danger cho nút OK
  okBtn.classList.toggle('dialog-btn-danger', danger);

  // Cancel button
  if (type === 'confirm') {
    cancelBtn.style.display = '';
    cancelBtn.innerText = cancelText;
  } else {
    cancelBtn.style.display = 'none';
  }

  shade.classList.add('active');
}

/**
 * Đóng dialog hiện tại với kết quả
 * @param {*} result - true/false cho confirm, undefined cho alert
 */
export function closeDialog(result) {
  const shade = document.getElementById('dialogModal');
  if (shade) shade.classList.remove('active');

  if (_currentResolve) {
    const resolve = _currentResolve;
    const type = _currentType;
    _currentResolve = null;
    _currentType = 'alert';
    resolve(type === 'confirm' ? !!result : undefined);
  }
}

// ==================== GLOBAL HANDLERS (cho onclick) ====================
if (typeof window !== 'undefined') {
  window.dialogOk = () => closeDialog(true);
  window.dialogCancel = () => closeDialog(false);

  // Đóng khi click backdrop
  document.addEventListener('DOMContentLoaded', () => {
    const shade = document.getElementById('dialogModal');
    if (shade) {
      shade.addEventListener('click', e => {
        if (e.target === shade) {
          closeDialog(false);
        }
      });
    }
  });

  // Đóng khi nhấn Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _currentResolve) {
      closeDialog(false);
    }
  });
}