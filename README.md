<div align="center">

# 📦 SPX Tracker

**Theo dõi sản lượng · Tính điểm SPX · Backup Cloud**

[![Live](https://img.shields.io/badge/Live_Demo-ff5722?style=for-the-badge)](https://linhshope124-a11y.github.io/spx-tracker1/)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?style=for-the-badge)]()
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](./LICENSE)

</div>

PWA dành cho **tài xế SPX Express** — theo dõi sản lượng **Giao / Lấy / Hoàn** hàng ngày và tính điểm thưởng theo **chính sách phúc lợi** công ty.

**Không cần cài đặt.** Mở URL → Thêm vào màn hình chính → Dùng luôn.

👉 **Mở app:** https://linhshope124-a11y.github.io/spx-tracker1/

---

## ✨ Tính năng

**📊 Theo dõi** — 8 dải khối lượng × 3 loại đơn · Bảng điểm SPX · 6 hạng thưởng · Cơ hội tăng điểm

**📷 OCR** — Quét ảnh chụp màn hình SPX · Batch nhiều ảnh · Cache SHA-1 (0.1s) · Confidence color

**💰 Thu nhập** — Quy đổi **6 lấy = 1 giao = 1 hoàn** · 2 khu vực: Miền (60/30) · HCM/HN (80/40) · Ngày tối đa T2 = 24, khác 26

**☁️ Backup** — Cloud Gist miễn phí · Auto-save · Undo 5s · Dark mode

---

## 📱 Cài đặt

| Nền tảng | Cách cài |
|---|---|
| **Android** | Chrome → ⋮ → *Thêm vào màn hình chính* |
| **iOS** | Safari → Chia sẻ → *Thêm vào màn hình chính* |
| **Desktop** | Mở URL bất kỳ browser |

App chạy **offline**, có icon riêng sau khi cài.

---

## 🔢 Công thức
Tính công 1 ngày:

Đơn tính công = Giao + Lấy/6 + Hoàn

Miền: ≥60 = 1 công ≥30 = 0.5 công

TP.HCM & HN: ≥80 = 1 công ≥40 = 0.5 công

Thu nhập:

Lương 1 công = (LCB + Bưu cục + Tài xế) / số ngày tối đa

Tích lũy = Lương 1 công × số công

Tổng điểm: Tổng = Gốc + (Gốc x % hạng) + Thu nhập

📖 Chi tiết: **[HƯỚNG_DẪN.md](./HƯỚNG_DẪN.md)**

---

## 📁 Cấu trúc
spx-tracker1/

text

index.html manifest.json sw.js

README.md HƯỚNG_DẪN.md · LICENSE

css/style.css

js/

main.js # Bootstrap

config.js # Bảng điểm SPX

state.js # App state

render.js # Render UI

ui.js # Actions

entry.js # CRUD

ocr.js # OCR pipeline

backup.js # Import/Export

cloud.js # Gist sync

calc.js # Logic tính

theme.js # Dark mode

undo.js # Undo 5s

utils.js # Helpers

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Core | Vanilla JavaScript (ES modules) |
| Styling | CSS3 — Design tokens |
| OCR | Tesseract.js v5 |
| Storage | localStorage + GitHub Gist |
| PWA | Service Worker + Manifest |

**Không framework** · Tải < 500KB · Mượt trên mọi thiết bị.

---

## 🗺️ Roadmap

**Đã xong:** Module hóa · OCR batch · Cloud Backup · Undo 5s · Region selector

| Mã | Tính năng | Ưu tiên |
|---|---|---|
| 🔍 SPX-H | Search nâng cao | ⭐⭐⭐ |
| 🔔 SPX-I | Notification nhắc | ⭐⭐ |
| 📤 SPX-F | PWA Share Target | ⭐ |
| 📄 SPX-J | Export PDF | ⭐ |
| ☁️ SPX-G | Supabase Sync | ⭐ |

---

## 🤝 Đóng góp

**Báo bug:** [Tạo issue](https://github.com/linhshope124-a11y/spx-tracker1/issues/new) kèm mô tả + screenshot.

**Gửi PR:**
```bash
git checkout -b feature/ten-tinh-nang
git commit -m "Add: tính năng X"
git push origin feature/ten-tinh-nang