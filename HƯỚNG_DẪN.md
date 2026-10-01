# 📖 SPX Tracker — Hướng Dẫn Sử Dụng

Ứng dụng PWA theo dõi sản lượng **Giao / Lấy / Hoàn** và tính điểm SPX theo chính sách phúc lợi.

**URL**: https://linhshope124-a11y.github.io/spx-tracker1/

---

## 🚀 Bắt đầu nhanh

### Lần đầu mở app
1. Mở URL → Chrome/Safari → **Thêm vào màn hình chính**
2. Menu ☰ → **Backup & Cloud** → dán GitHub Token (xem mục 6)
3. Menu ☰ → **Hướng dẫn** để xem tutorial bất cứ lúc nào

### Hàng ngày
1. Chụp màn hình SPX
2. Nhấn **📷 Quét** giữa bottom nav
3. Chọn ảnh → App tự OCR và lưu

---

## 📝 1. Nhập sản lượng

### Cách 1 — Quét ảnh (nhanh nhất)

1. Chụp màn hình app SPX có **8 dải khối lượng**
2. Mở app → nhấn **📷 Quét**
3. Chọn 1 hoặc nhiều ảnh
4. App tự động:
   - **1 ảnh, độ tin cậy ≥ 85%** → tự lưu luôn
   - **1 ảnh có vấn đề** → mở modal kiểm tra
   - **Nhiều ảnh** → modal "Kết quả quét"

### Cách 2 — Nhập tay

1. Menu ☰ → **Nhập sản lượng**
2. Chọn ngày → chọn tab **Giao/Lấy/Hoàn**
3. Nhập số đơn cho từng dải → **Lưu**

> 💡 **Tips:**
> - Ô nhập tự xóa số `0` khi focus
> - Ô trống tự điền `0` khi rời
> - Có thể nhập cả 3 loại trong 1 lần lưu

### Màu viền ô nhập sau OCR

- 🟢 **Xanh** = conf ≥ 85% — đáng tin
- 🟡 **Vàng** = 70-84% — cần check
- 🔴 **Đỏ** = < 70% — phải sửa tay

---

## 📊 2. Đọc dữ liệu

### Tab Tổng quan

**Hero card** — Tổng điểm tích lũy
- Số to = Tổng điểm (Gốc + Thưởng + TN)
- Pill = Số đơn
- Sub = `Gốc X · Thưởng +Y · TN +Z`

**3 tiles** — Điểm Giao/Lấy/Hoàn riêng biệt (màu cam/vàng/đỏ)

**Hạng thưởng** — Chọn hạng SPX (xem mục 4)

**Phân bổ** — % theo loại đơn

**Thu nhập** — Accordion, nhấn để mở (xem mục 5)

**Cơ hội tăng điểm** — Gợi ý dải gần đạt mốc

### Tab Giao / Lấy / Hoàn

**Bảng 5 cột:**

| Cột | Ý nghĩa |
|---|---|
| **KG** | Dải khối lượng |
| **SL** | Sản lượng |
| **Mốc** | Mốc đang đạt |
| **Điểm** | Điểm từ dải |
| **Cần** | Số đơn cần thêm → điểm thêm |

Ví dụ: `+12 → +275đ` = cần thêm 12 đơn → được cộng 275 điểm.

### Tab Nhật ký (trong menu ☰)

- Xem tất cả bản ghi theo kỳ
- **Sửa** — chỉnh sửa (chặn nếu trùng)
- **Xóa** — có Hoàn tác 5s

---

## 🎖️ 3. Hạng thưởng

### Cách chọn
- **Nhấn nhanh** pill Đồng/Bạc/Vàng/B.Kim/K.Cương

### Cách bỏ chọn
- **Nhấn giữ 0.5s** pill đang active → rung + về `+0%`

### Bảng % thưởng

| Hạng | Thưởng |
|---|---|
| (không chọn) | +0% |
| Đồng | +10% |
| Bạc | +15% |
| Vàng | +20% |
| Bạch Kim | +22% |
| Kim Cương | +26% |

**Công thức:** `Điểm tổng = Gốc × (1 + % hạng)`

---

## 💰 4. Thu nhập & Tính công

### Quy tắc quy đổi

> **6 đơn lấy = 1 đơn giao = 1 đơn hoàn**

**Công thức:**

**Ví dụ:**
| Giao | Lấy | Hoàn | Quy đổi |
|---|---|---|---|
| 50 | 60 | 10 | 50 + 10 + 10 = **70** |
| 30 | 30 | 0 | 30 + 5 + 0 = **35** |
| 20 | 0 | 0 | 20 + 0 + 0 = **20** |

### Ngưỡng công theo khu vực

Chọn trong panel Thu nhập:

| Khu vực | 1 công | 0.5 công |
|---|---|---|
| **Miền Bắc/Trung/Nam** | ≥ 60 đơn | ≥ 30 đơn |
| **TP.HCM & Hà Nội** | ≥ 80 đơn | ≥ 40 đơn |

**Ví dụ (Miền):**
- Quy đổi 70 → **1 công**
- Quy đổi 45 → **0.5 công**
- Quy đổi 25 → **0 công**

### Số ngày tối đa / tháng

| Tháng | Ngày tối đa |
|---|---|
| **Tháng 2** | **24** |
| Các tháng khác | **26** |

### Nhập cấu hình thu nhập

1. Nhấn **Thu nhập** ở Tổng quan
2. Chọn **Khu vực** (Miền / TP.HCM · HN)
3. Nhập **LCB** (Lương cơ bản)
4. Nhập **Bưu cục** (phụ cấp)
5. Nhập **Tài xế** (phụ cấp)
6. Bấm **Lưu cấu hình**

### Công thức thu nhập
Lương 1 công = (LCB + Bưu cục + Tài xế) / số ngày tối đa

Tích lũy = Lương 1 công x số công

**Ví dụ:**
- LCB 4.730.000 + Bưu cục 2.000.000 + Tài xế 200.000 = **6.930.000đ**
- Tháng 10 (26 ngày): Lương 1 công = **266.538đ**
- Làm 20 công → tích lũy = **5.330.769đ**

---

## ☁️ 5. Backup & Khôi phục

### Cloud Backup (GitHub Gist) — KHUYÊN DÙNG

**Setup lần đầu:**
1. Vào **github.com/settings/tokens**
2. Bấm **Generate new token (classic)**
3. Điền:
   - Note: `spx-backup`
   - Expiration: `No expiration`
   - Scope: tích **`gist`**
4. Bấm **Generate** → copy token
5. Menu ☰ → **Backup & Cloud** → paste token
6. Bấm **🔌 Kiểm tra** → báo OK
7. Bấm **☁️ Backup** → tự tạo Gist

**Sau đó:**
- Bật **Tự động backup** → tự đẩy Cloud sau mỗi thay đổi
- **⬇️ Khôi phục từ Cloud** → tải data về khi reset máy

### Backup cục bộ

| Nút | Chức năng |
|---|---|
| **📋 Chép** | Copy JSON vào clipboard |
| **📝 Dán** | Paste JSON để restore |
| **💾 Lưu file** | Tải file `.json` |
| **📥 Nạp file** | Chọn file để restore |
| **🔄 Phục hồi tự động** | Khôi phục từ vault |

> ⚠️ Khi import/restore, app tự **dọn trùng lặp**.

---

## 🧹 6. Công cụ & Nguy hiểm

### Dọn bản ghi trùng lặp
- Menu → **Backup & Cloud → Dọn trùng lặp**
- Tìm bản ghi cùng ngày + cùng số liệu → xóa giữ 1

### Xóa toàn bộ nhật ký
- **⚠️ Nguy hiểm** — không thể khôi phục
- Có thể **Hoàn tác** trong 5s

---

## 🎨 7. Giao diện

### Đổi theme
- Menu ☰ → **Chế độ tối / sáng**

### Kỳ lọc

| Kỳ | Phạm vi |
|---|---|
| **Tất cả** | Toàn bộ |
| **Tháng này** | 1 → hôm nay |
| **Tháng trước** | Tháng liền trước |
| **Hôm nay** | Chỉ hôm nay |

Áp dụng cho cả 5 tab.

---

## ⌨️ 8. Thao tác nhanh

| Thao tác | Kết quả |
|---|---|
| Nhấn **📷 Quét** | Chọn ảnh |
| **Nhấn giữ 0.5s** pill | Bỏ chọn hạng |
| **Vuốt ngang** bảng | Xem đủ 5 cột |
| **Hoàn tác** banner | Undo 5s |
| **Nhấn** ảnh OCR | Phóng to |
| **Menu ☰** | Mở menu |
| **Nhấn** ⓘ | Xem giải thích |

---

## 🔧 9. Xử lý sự cố

### OCR đọc sai
- Chụp lại ảnh rõ nét hơn (đủ sáng, không nghiêng)
- Kiểm tra màu viền ô: 🟢 OK · 🟡 cần check · 🔴 sửa tay

### App không cập nhật
- **Đóng hẳn tab** → mở lại
- Nếu vẫn cũ: Chrome → Settings → Clear browsing data → Cached images

### Mất dữ liệu
- Backup & Cloud → **⬇️ Khôi phục từ Cloud**
- Hoặc **🔄 Phục hồi tự động**

### Không nhập được dấu phẩy
- Ô chỉ nhận **số nguyên**. Nhập `1200` thay vì `1,200`

### Điểm công sai khu vực
- Mở **Thu nhập** → kiểm tra **Khu vực**
- Miền: 60/30 · TP.HCM & HN: 80/40

---

## 📋 10. Bảng tóm tắt công thức

| Thành phần | Công thức |
|---|---|
| **Điểm gốc** | Tổng điểm từ 8 dải × 3 loại đơn |
| **Thưởng hạng** | Điểm gốc × % hạng |
| **Thu nhập** | Lương 1 công × số công |
| **Tổng điểm** | Điểm gốc + Thưởng + Thu nhập |
| **Công 1 ngày** | Giao + Lấy/6 + Hoàn |
| **Ngưỡng công** | Miền: 60/30 · HCM/HN: 80/40 |
| **Số ngày tối đa** | T2 = 24, còn lại 26 |

---

## 📞 11. Liên hệ

Ủng hộ tác giả:
- Menu ☰ → **Ủng hộ tác giả**
- **Viettinbank** · STK: `106879606835` · Chủ TK: **LINH**

---

*Cập nhật: v37 · Tác giả: LINH*