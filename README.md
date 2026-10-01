# 📦 SPX Tracker

> **PWA theo dõi sản lượng Giao/Lấy/Hoàn và tính điểm SPX**
> OCR ảnh chụp màn hình · Cloud Backup · Undo · Dark mode · Offline

[![Live Demo](https://img.shields.io/badge/Live-Demo-ff5722?style=for-the-badge&logo=googlechrome&logoColor=white)](https://linhshope124-a11y.github.io/spx-tracker1/)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Version](https://img.shields.io/badge/version-3.8-blue?style=for-the-badge)](https://github.com/linhshope124-a11y/spx-tracker1/releases)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](./LICENSE)

---

## 🎯 Giới thiệu

**SPX Tracker** là ứng dụng PWA giúp **tài xế SPX Express** theo dõi sản lượng hàng ngày và tính điểm thưởng theo đúng **chính sách phúc lợi** của công ty.

Không cần cài đặt — mở URL là chạy, thêm vào màn hình chính là có app.

### Tại sao dùng SPX Tracker?

| Truyền thống | SPX Tracker |
|---|---|
| 📱 Chụp màn hình, ghi chép sổ | 📷 Quét ảnh — OCR tự nhập |
| 🧮 Tính điểm bằng tay, dễ sai | 🤖 App tính tự động theo bảng giá |
| 💰 Không biết đủ công chưa | 📊 Hiển thị công theo khu vực |
| 💾 Data mất khi đổi máy | ☁️ Backup Cloud tự động |

---

## ✨ Tính năng

### 📊 Theo dõi & Tính điểm
- ✅ 8 dải khối lượng × 3 loại đơn (Giao / Lấy / Hoàn)
- ✅ Tính điểm theo bảng giá SPX
- ✅ 6 hạng thưởng: Chuẩn / Đồng / Bạc / Vàng / B.Kim / K.Cương
- ✅ Hiển thị **Cơ hội tăng điểm** — dải gần đạt mốc tiếp theo
- ✅ **Row highlight** — dải dễ đạt mốc nhất được làm nổi bật

### 📷 OCR ảnh chụp màn hình
- ✅ 6-strip pipeline (Otsu + multi-pass preprocessing)
- ✅ Cache SHA-1 — quét lại ảnh cũ trong 0.1s
- ✅ Batch OCR — xử lý nhiều ảnh cùng lúc
- ✅ **Confidence color** — viền ô xanh/vàng/đỏ theo độ tin cậy
- ✅ Auto-save khi độ tin cậy cao

### 💰 Tính công & Thu nhập
- ✅ Quy đổi chuẩn SPX: **6 lấy = 1 giao = 1 hoàn**
- ✅ 2 khu vực: **Miền Bắc/Trung/Nam (60/30)** · **TP.HCM & Hà Nội (80/40)**
- ✅ Số ngày tối đa theo tháng: **T2 = 24**, còn lại **26**
- ✅ Cấu hình LCB + Bưu cục + Tài xế

### 💾 Backup & Sync
- ✅ **3 tầng backup**: localStorage + vault + Cloud
- ✅ Cloud Backup qua **GitHub Gist** (miễn phí)
- ✅ Tự động backup sau mỗi thay đổi
- ✅ Import/Export JSON
- ✅ Tự **dọn trùng lặp** khi restore

### 🎨 Giao diện
- ✅ **Design system** với color tokens, typography scale
- ✅ **Dark mode** đầy đủ
- ✅ **Bottom nav** 5 slot với FAB Quét 48px
- ✅ **Coachmark** hướng dẫn lần đầu
- ✅ **Microinteraction** — pulse, undo banner

### ⚡ Khác
- ✅ **Undo 5 giây** cho mọi thao tác
- ✅ **Chặn trùng lặp** ngày + số liệu
- ✅ **PWA** — offline, thêm vào home screen
- ✅ **Safe-area-inset** cho iPhone notch

---

## 🚀 Deploy

### Bước 1: Fork repo

```bash
git clone https://github.com/linhshope124-a11y/spx-tracker1.git
cd sp