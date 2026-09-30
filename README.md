# SPX Tracker — Theo Dõi Sản Lượng & Điểm

PWA theo dõi sản lượng **Giao / Lấy / Hoàn**, tính điểm SPX, OCR ảnh chụp màn hình, có Cloud Backup + Undo + Biểu đồ.

## 🚀 Deploy

1. Push lên GitHub repository (Public)
2. Settings → Pages → Deploy from branch `main` / `(root)`
3. Truy cập `https://<username>.github.io/<repo>/`

## ✨ Tính năng

- 📊 Tra cứu điểm 8 dải khối lượng × 3 loại đơn
- 🎖️ Thưởng hạng: Chuẩn/Đồng/Bạc/Vàng/B.Kim/K.Cương
- 📷 OCR ảnh chụp màn hình SPX (6-strip + confidence + cache SHA-1)
- 📦 OCR batch nhiều ảnh + nút "Quét thêm" + quay lại batch
- 🔴 Fix trùng dữ liệu (batch + nhập tay)
- ☁️ Cloud Backup (GitHub Gist) tự động
- ⚡ Undo 5 giây
- 📊 Biểu đồ: 7 ngày / Tích lũy 30 ngày / Phân bổ
- 💾 Export/Import JSON + Vault tự động
- 🌙 Dark mode + PWA offline

## 📁 Cấu trúc