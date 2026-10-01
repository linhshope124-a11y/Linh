# 📱 SPX Tracker — Hướng Dẫn Sử Dụng

Ứng dụng PWA theo dõi sản lượng **Giao / Lấy / Hoàn** và tính điểm SPX theo chính sách.
Cài như app: mở URL → Chrome/Safari → **Thêm vào màn hình chính**.

**URL**: https://linhshope124-a11y.github.io/spx-tracker1/

---

## 📑 Mục lục

1. [Bắt đầu nhanh](#1-bắt-đầu-nhanh)
2. [Nhập sản lượng](#2-nhập-sản-lượng)
3. [Đọc dữ liệu](#3-đọc-dữ-liệu)
4. [Hạng thưởng](#4-hạng-thưởng)
5. [Thu nhập & Tính công](#5-thu-nhập--tính-công)
6. [Backup & Khôi phục](#6-backup--khôi-phục)
7. [Công cụ & Vùng nguy hiểm](#7-công-cụ--vùng-nguy-hiểm)
8. [Giao diện](#8-giao-diện)
9. [Thao tác nhanh](#9-thao-tác-nhanh)
10. [Xử lý sự cố](#10-xử-lý-sự-cố)
11. [Bảng tóm tắt công thức](#11-bảng-tóm-tắt-công-thức)

---

## 1. Bắt đầu nhanh

### Lần đầu mở app

1. Sau khi mở app **~1.2 giây**, sẽ có **coachmark** (overlay hướng dẫn) chỉ vào nút **Quét**
2. Bấm **"Đã hiểu"** hoặc **nhấn nút Quét** để đóng coachmark
3. **Menu ☰ → Backup & Cloud** → dán **GitHub Token** để bật đồng bộ Cloud (xem mục 6)
4. **Menu ☰ → Hướng dẫn sử dụng** để xem tutorial đầy đủ bất cứ lúc nào

### Quy trình hàng ngày

1. Chụp màn hình app SPX (có 8 dải khối lượng)
2. Nhấn **nút Quét 📷** giữa bottom nav
3. Chọn ảnh → app **tự OCR và lưu**
4. Vào tab **Tổng quan** để xem điểm đã cập nhật

---

## 2. Nhập sản lượng

### Cách 1 — Quét ảnh (nhanh nhất)

1. Chụp màn hình app SPX có **8 dải khối lượng**
2. Mở SPX Tracker → nhấn **Quét 📷** (nút cam ở giữa bottom nav)
3. Chọn 1 hoặc nhiều ảnh từ thư viện
4. App xử lý và:
   - **1 ảnh + độ tin cậy ≥ 85%** → **tự lưu luôn**, chỉ hiện toast
   - **1 ảnh nhưng có vấn đề** → mở modal để bạn kiểm tra
   - **Nhiều ảnh** → hiện modal "Kết quả quét"

### Cách 2 — Nhập tay

1. **Menu ☰ → Nhập sản lượng**
2. Chọn **ngày ghi nhận**
3. Chọn tab **Giao / Lấy / Hoàn**
4. Nhập số đơn cho từng dải khối lượng
5. **Lưu dữ liệu**

> 💡 **Tips:**
> - Ô nhập tự **xóa số `0`** khi bạn focus vào
> - Ô trống tự **điền lại `0`** khi bạn rời khỏi
> - Có thể nhập **cả 3 loại** (Giao + Lấy + Hoàn) trong **1 lần lưu**

### Modal "Kết quả quét" — Batch OCR

Khi quét nhiều ảnh, mỗi ảnh hiển thị 1 card:

| Ký hiệu | Ý nghĩa |
|---|---|
| 🟢 | Độ tin cậy cao (≥ 85%) — đáng tin |
| 🟡 | Trung bình (70-84%) — cần check |
| 🔴 | Thấp (< 70%) — phải sửa tay |
| ⚡ | Cache — ảnh đã quét trước đó |
| ⚠️ | Tổng OCR lệch so với dòng "Tổng" trong ảnh |
| **Đã có** badge | Đã có bản ghi cùng ngày |

**Nút trong mỗi card:**
- **📝 Nhập** — mở form nhập để kiểm tra
- **🔍 So sánh** — so sánh OCR với bản ghi đã có
- **Bỏ** — xóa khỏi batch

**Nút dưới cùng:**
- **📷 Quét thêm** — chọn thêm ảnh (append vào batch)
- **Đóng** — đóng modal
- **Lưu tất cả** — lưu hết (bỏ qua ảnh trùng)

### Màu viền ô nhập (sau khi OCR)

Khi modal mở với dữ liệu từ OCR, mỗi ô có **viền màu**:

- 🟢 **Xanh** = conf ≥ 85% → đáng tin
- 🟡 **Vàng** = 70-84% → cần kiểm tra
- 🔴 **Đỏ** = < 70% → bắt buộc sửa

Có **badge %** ở góc phải ô.

---

## 3. Đọc dữ liệu

### Tab Tổng quan (mặc định)

#### Hero card
- **Số to** — Tổng điểm tích lũy
- **Pill trên phải** — Tổng số đơn
- **Dòng sub** — `Gốc X · Thưởng +Y · TN +Z`

**Khi chưa có dữ liệu:**
- Hero **thu nhỏ lại** (~90px thay vì 180px)
- Hiện text "**Chưa có dữ liệu**" màu xám + gợi ý "Bắt đầu nhập sản lượng để tính điểm"

#### 3 tiles Giao / Lấy / Hoàn
Màu tương ứng: **Cam đậm** (Giao), **Vàng** (Lấy), **Đỏ** (Hoàn).

#### Hạng thưởng
Xem mục 4.

#### Phân bổ
Tỷ lệ % theo loại đơn — có legend chấm tròn.

#### Thu nhập (accordion)
Nhấn để mở. Xem mục 5.

#### Cơ hội tăng điểm
- Gợi ý các dải gần đạt mốc tiếp theo
- Filter: **Tất cả / Giao / Lấy / Hoàn**
- Mỗi gợi ý có badge **G / L / H** và màu viền tương ứng

### Tab Giao / Lấy / Hoàn

**Hero nhỏ** — Tổng điểm + số đơn của loại đó.

**Bảng 5 cột:**

| Cột | Ý nghĩa |
|---|---|
| **KG** | Dải khối lượng |
| **SL** | Sản lượng thực tế |
| **Mốc** | Mốc điểm đang đạt |
| **Điểm** | Điểm từ dải này |
| **Cần** | Số đơn cần thêm → điểm cộng thêm |

Ví dụ: `+12 → +275đ` = cần thêm **12 đơn** để được cộng **275 điểm**.

> 🟠 **Row highlight gần mốc:**
> Nếu dải nào có `+X đơn` mà X ≤ **20% độ rộng dải hiện tại** → row sẽ được:
> - **Viền trái cam** (hoặc vàng/đỏ theo loại)
> - **Background gradient nhạt**
> - **Chấm nhấp nháy** cạnh số đơn
>
> Đây là dải **dễ đạt mốc nhất** — nên ưu tiên nhập thêm đơn cho dải này.

### Tab Nhật ký

- Xem tất cả bản ghi đã nhập theo kỳ đang chọn
- **Sửa** — chỉnh sửa bản ghi (chặn nếu trùng ngày + số liệu)
- **Xóa** — xóa bản ghi → có thể **Hoàn tác** trong 5s

---

## 4. Hạng thưởng

### Cách chọn hạng

**Nhấn nhanh** vào pill **Đồng / Bạc / Vàng / B.Kim / K.Cương**.

### Cách bỏ chọn hạng

**Nhấn giữ 0.5s** vào pill đang active → rung nhẹ + về `+0%`.

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

**Ví dụ:**
- Điểm gốc = 10.000
- Hạng Vàng = +20%
- → Điểm tổng = 10.000 × 1.20 = **12.000**

---

## 5. Thu nhập & Tính công

### Quy tắc quy đổi đơn

> **06 đơn lấy = 01 đơn giao = 01 đơn hoàn**

**Công thức:**