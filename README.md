# 📱 SPX Tracker — Hướng Dẫn Sử Dụng

Ứng dụng theo dõi sản lượng giao/lấy/hoàn và tính điểm SPX.
Cài như app: mở URL → Chrome/Safari → **Thêm vào màn hình chính**.

---

## 🚀 Bắt đầu nhanh (3 phút)

1. **Mở app** lần đầu → mở **Menu ☰** → **Backup & Cloud**
2. Dán **GitHub Token** (xem hướng dẫn ở mục 7)
3. Bấm **Backup** để lưu lên Cloud → dữ liệu tự động đồng bộ
4. Bắt đầu nhập sản lượng hàng ngày

---

## 📝 1. Nhập sản lượng

### Cách 1 — Chụp màn hình SPX rồi quét (nhanh nhất)

1. Chụp màn hình app SPX (dạng có 8 dải khối lượng)
2. Mở SPX Tracker → bấm **nút Quét (📷)** ở giữa bottom nav
3. Chọn ảnh vừa chụp → app tự động OCR
4. Kiểm tra kết quả → bấm **Lưu dữ liệu**

**Tips:**
- Chụp 1 ảnh → OCR tự động lưu nếu đủ tin cậy (conf ≥ 85%)
- Chụp nhiều ảnh → hiện **Kết quả quét**, bấm **Lưu tất cả**
- Ảnh có chữ đỏ/vàng → cần kiểm tra tay trước khi lưu

### Cách 2 — Nhập tay

1. Menu ☰ → **Nhập sản lượng**
2. Chọn **ngày ghi nhận**
3. Chọn tab **Giao / Lấy / Hoàn**
4. Nhập số đơn cho từng dải khối lượng
5. Bấm **Lưu dữ liệu**

---

## 📊 2. Đọc dữ liệu

### Tab Tổng quan (mặc định)

- **Hero card** — Tổng điểm tích lũy + số đơn
- **Dòng sub** — `Gốc X · Thưởng +Y · TN +Z`
  - Gốc = điểm từ sản lượng
  - Thưởng = % từ hạng SPX
  - TN = thu nhập tích lũy
- **3 tiles** — Tổng điểm Giao/Lấy/Hoàn
- **Hạng thưởng** — Chọn hạng SPX hiện tại
- **Phân bổ** — Tỷ lệ % theo loại đơn
- **Thu nhập** — Nhấn để mở, nhập lương + bưu cục + tài xế
- **Cơ hội tăng điểm** — Danh sách dải gần đạt mốc tiếp theo

### Tab Giao / Lấy / Hoàn

- **Hero nhỏ** — Tổng điểm + số đơn loại đó
- **Bảng 5 cột:**
  - `KG` — Dải khối lượng
  - `SL` — Sản lượng thực tế
  - `Mốc` — Mốc điểm đang đạt
  - `Điểm` — Điểm từ dải này
  - `Cần` — Số đơn cần thêm → điểm cộng thêm

### Tab Nhật ký

- Xem tất cả bản ghi đã nhập
- **Sửa** — chỉnh sửa bản ghi
- **Xóa** — xóa bản ghi (có thể **Hoàn tác** trong 5s)

---

## 🎖️ 3. Hạng thưởng SPX

### Chọn hạng
- Bấm pill **Đồng / Bạc / Vàng / B.Kim / K.Cương**
- Điểm tổng = Gốc × (1 + % hạng)

### Bỏ chọn hạng
- **Nhấn giữ 0.5s** vào pill đang chọn
- Rung nhẹ + về `+0%`

### Bảng % hạng

| Hạng | Thưởng |
|---|---|
| (không chọn) | +0% |
| Đồng | +10% |
| Bạc | +15% |
| Vàng | +20% |
| Bạch Kim | +22% |
| Kim Cương | +26% |

---

## 💰 4. Thu nhập

Nhấn **Thu nhập** ở tab Tổng quan để mở:

1. **Lương cơ bản** — lương tháng
2. **Bưu cục** — phụ cấp bưu cục
3. **Tài xế** — phụ cấp tài xế
4. Bấm **Lưu cấu hình**

**Công thức:**

⚠️ **Trần 26 ngày** — làm hơn 26 ngày cũng chỉ tính 26.

---

## 💾 5. Backup & Khôi phục

### Cloud (GitHub Gist) — khuyên dùng

1. Menu ☰ → **Backup & Cloud**
2. Dán **Token** + **Gist ID** (xem mục 7)
3. Bật **Tự động backup** → mỗi thay đổi tự đẩy lên Cloud sau 10s

**Nút:**
- 🔌 **Kiểm tra** — test kết nối
- ☁️ **Backup** — đẩy dữ liệu lên Cloud ngay
- ⬇️ **Khôi phục** — tải dữ liệu từ Cloud về

### Local

- **📋 Chép** — copy JSON vào clipboard
- **📝 Dán** — paste JSON để restore
- **💾 Lưu file** — tải file `.json`
- **📥 Nạp file** — chọn file `.json` để restore
- **🔄 Phục hồi tự động** — khôi phục từ localStorage vault

---

## 🧹 6. Công cụ & Vùng nguy hiểm

### Dọn bản ghi trùng lặp
- Menu ☰ → **Backup & Cloud** → **Dọn bản ghi trùng lặp**
- Tìm các bản ghi cùng ngày + cùng số liệu → xóa giữ 1 bản gốc

### Xóa toàn bộ nhật ký
- **⚠️ Cực kỳ nguy hiểm** — không thể khôi phục
- Có thể **Hoàn tác** trong 5s (banner dưới cùng)

---

## ☁️ 7. Lấy GitHub Token (cho Cloud Backup)

1. Vào **github.com/settings/tokens**
2. Bấm **Generate new token (classic)**
3. Điền:
   - Note: `spx-backup`
   - Expiration: `No expiration`
   - Scope: **tích `gist`**
4. Bấm **Generate** → copy token (dạng `ghp_xxx`)
5. Quay lại app → paste vào ô **GitHub Token**

**Lần đầu:** để trống Gist ID → bấm **Backup** → app tự tạo Gist mới.
**Lần sau:** Gist ID tự lưu — không cần nhập lại.

---

## 🎨 8. Giao diện

### Đổi theme
- Menu ☰ → **Chế độ tối / Chế độ sáng**

### Kỳ lọc (Period Filter)
- **Tất cả** — toàn bộ dữ liệu
- **Tháng này** — từ 1 → hôm nay
- **Tháng trước** — tháng liền trước
- **Hôm nay** — chỉ hôm nay

Áp dụng cho cả 5 tab: Tổng quan, Giao, Lấy, Hoàn, Nhật ký.

---

## ⌨️ 9. Thao tác nhanh

| Thao tác | Kết quả |
|---|---|
| Nhấn **Quét** ở bottom nav | Mở chọn ảnh |
| Nhấn **giữ** pill hạng | Bỏ chọn hạng |
| **Vuốt** bảng Giao/Lấy/Hoàn | Xem đủ 5 cột |
| **Hoàn tác** banner | Undo trong 5s |
| **Nhấn** ảnh OCR | Phóng to (lightbox) |

---

## 🔧 10. Xử lý sự cố

### OCR đọc sai số
- Chụp lại với ảnh rõ nét hơn (đủ sáng, không nghiêng)
- Kiểm tra ô confidence: **xanh** OK, **vàng** cần check, **đỏ** phải sửa
- Bấm vào ảnh gốc để đối chiếu

### App không cập nhật
- Đóng hẳn tab (không chỉ back)
- Mở lại → Service Worker tự fetch bản mới
- Nếu vẫn cũ: Chrome → Settings → Clear browsing data → **Cached images and files**

### Mất dữ liệu
- Mở **Backup & Cloud** → bấm **⬇️ Khôi phục từ Cloud**
- Hoặc **🔄 Phục hồi tự động** (từ vault localStorage)

### Không nhập được dấu phẩy
- Ô nhập chỉ chấp nhận **số nguyên**
- Nhập `1200` thay vì `1,200`

---

## 📞 11. Liên hệ

Nếu app giúp ích, ủng hộ tác giả:
- Menu ☰ → **Ủng hộ tác giả**
- Viettinbank · STK: `106879606835` · Chủ TK: LINH

---

*Phiên bản: v3.2 · Cập nhật: 2026*
