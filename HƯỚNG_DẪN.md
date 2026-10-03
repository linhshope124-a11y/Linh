📖 HƯỚNG DẪN SỬ DỤNG SPX TRACKER

Phiên bản: v50.4.1
Ứng dụng: Theo dõi sản lượng giao/lấy/hoàn + tính điểm phúc lợi SPX Express

---

📌 MỤC LỤC

1. Giới thiệu
2. Cài đặt & Truy cập
3. Tổng quan giao diện
4. Bắt đầu nhanh
5. Nhập sản lượng
6. Thu nhập theo tháng
7. Đọc hiểu dữ liệu
8. Chọn kỳ xem (tháng)
9. Hạng thưởng
10. Nhật ký — Sửa/Xóa
11. Backup & Cloud
12. Cài đặt khác
13. Xử lý sự cố
14. Câu hỏi thường gặp

---

1. GIỚI THIỆU

SPX Tracker là ứng dụng web (PWA) giúp tài xế SPX Express:

· 📊 Theo dõi sản lượng hàng ngày theo 8 dải khối lượng
· 🎯 Tính điểm phúc lợi theo chính sách công ty
· 📷 Quét ảnh chụp màn hình SPX — tự động nhập liệu
· 💰 Tính thu nhập theo công + phụ cấp (lưu riêng từng tháng)
· 🏆 Chọn hạng thưởng để tính % bonus
· ☁️ Backup Cloud qua GitHub Gist — không mất dữ liệu
· 📱 Chạy offline — không cần mạng sau lần đầu tải

Không cần tài khoản, không cần đăng ký. Dữ liệu lưu ngay trên điện thoại bạn.

---

2. CÀI ĐẶT & TRUY CẬP

🌐 Cách 1: Dùng trên trình duyệt (nhanh)

1. Mở Chrome/Safari trên điện thoại
2. Truy cập: https://linhshope124-a11y.github.io/Linh/
3. App tự tải về máy (~15MB lần đầu)
4. Đợi 5-10s → dùng được

📱 Cách 2: Cài như app (khuyến nghị)

Trên Android (Chrome):

1. Mở URL trên
2. Chạm ⋮ (góc phải) → "Thêm vào màn hình chính"
3. Đặt tên → Thêm → Biểu tượng SPX xuất hiện

Trên iPhone (Safari):

1. Mở URL trên
2. Chạm Chia sẻ (biểu tượng hộp mũi tên) → "Thêm vào màn hình chính"
3. Thêm → Biểu tượng SPX xuất hiện

Lợi ích khi cài: Mở nhanh như app thật, chạy toàn màn hình, tự cập nhật.

---

3. TỔNG QUAN GIAO DIỆN

```
┌──────────────────────────────────┐
│ [☰]  [‹ Tháng 10/2026 ›]   [🕰] │  ← Header
├──────────────────────────────────┤
│                                   │
│  Điểm tích lũy       Tháng 10     │
│  1.479 Điểm        [ⓘ Chi tiết]   │  ← Hero
│  ─────────────────────            │
│  GIAO   LẤY   HOÀN                │
│   301    16     1                 │  ← Tiles
│                                   │
├──────────────────────────────────┤
│ HẠNG [Đồng][Bạc][Vàng][BK][KC]   │
├──────────────────────────────────┤
│ PHÂN BỔ  ●95% · ●5% · ●0%        │
├──────────────────────────────────┤
│ Thu nhập              +777 Điểm ▼ │
├──────────────────────────────────┤
│ Cơ hội tăng điểm                  │
├──────────────────────────────────┤
│ [T.Quan][Giao][📷][Lấy][Hoàn]    │  ← Bottom nav
└──────────────────────────────────┘
```

🧭 5 Tab chính

Tab Chức năng
T.Quan Tổng điểm, 3 loại đơn, cơ hội tăng điểm
Giao Chi tiết bảng 8 dải khối lượng Giao
📷 (giữa) Quét ảnh OCR
Lấy Chi tiết bảng 8 dải Lấy
Hoàn Chi tiết bảng 8 dải Hoàn

---

4. BẮT ĐẦU NHANH

🎯 4 bước đầu tiên

Bước 1 — Chọn khu vực + nhập lương

1. Vào tab T.Quan → mở mục Thu nhập
2. Chọn Khu vực: Miền hoặc TP.HCM & HN
3. Nhập LCB, Bưu cục, Tài xế của tháng hiện tại
4. Bấm "Lưu cấu hình tháng này"

Bước 2 — Chọn hạng thưởng

1. Vào mục Hạng ở tab T.Quan
2. Bấm pill hạng của bạn (VD: Vàng)

Bước 3 — Nhập sản lượng hôm nay

1. Cách 1: Bấm 📷 ở giữa → chọn ảnh chụp màn hình SPX
2. Cách 2: Menu ☰ → Nhập sản lượng → nhập tay

Bước 4 — Xem kết quả

· Quay về T.Quan → xem tổng điểm đã cập nhật

---

5. NHẬP SẢN LƯỢNG

📷 Cách 1: Quét ảnh OCR (nhanh + khuyến nghị)

Chuẩn bị ảnh:

1. Mở app SPX Express → vào màn hình "Chi tiết đơn theo ngày"
2. Chụp màn hình (nút nguồn + volume down)
3. Có thể chụp nhiều ảnh cùng lúc

Quét:

1. Mở SPX Tracker → bấm 📷 ở giữa
2. Chọn 1 hoặc nhiều ảnh cùng lúc
3. Đợi 5-15s → app tự nhận diện
4. Nếu conf ≥ 85% + tổng khớp → tự động lưu ✅
5. Nếu cần check → hiện modal để đối chiếu

Màu viền ô khi cần check:

· 🟢 Xanh — tin cậy cao, không cần sửa
· 🟡 Vàng — cần xem lại
· 🔴 Đỏ — phải sửa tay

Nút trong modal:

· Ảnh gốc ở dưới → chạm phóng to để đối chiếu
· Lưu dữ liệu nếu số đúng
· Hủy nếu OCR sai nhiều

✏️ Cách 2: Nhập tay

1. Menu ☰ → Nhập sản lượng
2. Chọn Ngày ghi nhận (mặc định hôm nay)
3. Chuyển tab Giao / Lấy / Hoàn
4. Nhập số đơn cho từng dải khối lượng:

Dải khối lượng Nhập số đơn
>0 - 2 kg ___
>2 - 4 kg ___
>4 - 6 kg ___
>6 - 8 kg ___
>8 - 10 kg ___
>10 - 12 kg ___
>12 - 15 kg ___
>15 kg ___

5. Bấm Lưu dữ liệu

Mẹo: Ô nhập có tự xóa số 0 khi chạm vào — nhập nhanh hơn.

🚫 Báo lỗi trùng lặp

Nếu báo "Đã tồn tại bản ghi với CÙNG số liệu" → tức là ngày đó bạn đã nhập rồi. Muốn sửa → vào Nhật ký → Sửa.

📷 Quét nhiều ảnh cùng lúc

1. Bấm 📷 → chọn nhiều ảnh (Chrome cho chọn tối đa 10-20 ảnh)
2. App xử lý tuần tự
3. Ảnh tự lưu → ảnh cần check → hiện danh sách Batch
4. Trong Batch: bấm 📝 Nhập từng ảnh để check
5. Hoặc Lưu tất cả để lưu những ảnh đã pass

---

6. THU NHẬP THEO THÁNG

⚡ Đặc biệt quan trọng: Lương được lưu RIÊNG theo từng tháng. Khi công ty đổi chính sách, chỉ cần cấu hình lại cho tháng mới — dữ liệu tháng cũ giữ nguyên.

💡 Cách hoạt động

```
Tháng 9/2026 → LCB 10tr, BC 2tr, TX 1tr
Tháng 10/2026 → LCB 12tr, BC 2tr, TX 1tr  ← Chính sách mới
```

Mỗi tháng độc lập — không ảnh hưởng nhau.

📝 Nhập config cho 1 tháng

1. Chọn tháng muốn nhập (dùng ‹ › ở header)
2. Vào mục Thu nhập ở tab T.Quan
3. Xem hint ngay đầu panel:

Hint Nghĩa
📅 Xanh "Áp dụng cho: Tháng 10/2026" Đã có config cho tháng này
⚠️ Vàng "Chưa thiết lập cho: Tháng 10/2026" Chưa có, cần nhập

4. Nhập LCB, Bưu cục, Tài xế
5. Bấm "Lưu cấu hình tháng này"
6. Alert xác nhận ghi rõ "Tháng X/Y"

🔄 Đổi tháng để nhập config khác

1. Bấm ‹ ở header → lùi về tháng trước
2. Hint chuyển sang vàng (nếu chưa có config)
3. Input reset = 0 — không dùng chung với tháng cũ
4. Nhập config cho tháng đó → Lưu

🌍 Khu vực (không theo tháng)

Khu vực (Miền / TP.HCM & HN) là thuộc tính nhân viên — chỉ chọn 1 lần, áp dụng cho tất cả tháng.

📐 Công thức tính

```
Lương 1 công = (LCB + Bưu cục + Tài xế) / số ngày tối đa

Số ngày tối đa:
- Tháng 2 = 24
- Tháng khác = 26

Số công = Đếm ngày có:
  Giao + (Lấy / 6) + Hoàn ≥ ngưỡng
  • Miền:    ≥60 = 1 công, ≥30 = 0.5 công
  • HCM/HN:  ≥80 = 1 công, ≥40 = 0.5 công

Tích lũy = Lương 1 công × Số công
```

Ví dụ:

· LCB 10tr + BC 2tr + TX 1tr = 13tr/tháng
· Tháng 10 (26 ngày) → Lương 1 công = 13tr / 26 = 500.000đ
· Bạn có 20 công → Tích lũy = 500k × 20 = 10.000.000đ

---

7. ĐỌC HIỂU DỮ LIỆU

🎯 Hero (tab T.Quan)

```
1.479 Điểm
Gốc:    +1.100 Điểm  (điểm từ đơn hàng)
Thưởng: +220 Điểm    (bonus theo hạng)
TN:     +159 Điểm    (thu nhập)
```

Bấm ⓘ Chi tiết để mở 3 metrics này.

📊 Hero Tiles

```
GIAO    LẤY    HOÀN
301     16     1
```

Tổng số đơn trong tháng đang xem.

📋 Bảng chi tiết (tab Giao/Lấy/Hoàn)

Cột Ý nghĩa
KG Dải khối lượng
SL Số đơn đã giao/lấy/hoàn
MỐC Mốc điểm hiện tại (VD: 200-300)
ĐIỂM Điểm được hưởng với mốc này
CẦN Cần thêm bao nhiêu đơn để lên mốc tiếp
ĐƯỢC Được thêm bao nhiêu điểm khi lên mốc

Ví dụ đọc bảng:

```
KG      SL    MỐC       ĐIỂM   CẦN   ĐƯỢC
>0-2    273   200-300   275    +27   +75 điểm
```

→ Bạn có 273 đơn dải >0-2 → hiện được 275 điểm
→ Thêm 27 đơn nữa → lên mốc tiếp → +75 điểm

🎯 Cơ hội tăng điểm

Liệt kê mọi dải bạn có thể tăng điểm — sắp xếp theo thứ tự:

```
🟧 G  >0-2 kg · 273 đơn
   Thêm +27 đơn đạt 300-400     +75 Điểm
```

Mẹo: Ưu tiên dải có + CẦN nhỏ mà + ĐƯỢC lớn → tăng điểm hiệu quả nhất.

---

8. CHỌN KỲ XEM (THÁNG)

🧭 Header cluster

```
[‹]  Tháng 10/2026  [›]
```

Nút Chức năng
‹ Lùi 1 tháng
Label giữa Chạm mở bộ chọn tháng
› Tiến 1 tháng
🕰 (góc phải) Nhảy về tháng có dữ liệu gần nhất
☰ (góc trái) Mở Menu

📅 Giới hạn

· Lùi tối đa: Tháng 1/2020
· Tiến tối đa: Tháng hiện tại (không vượt tương lai)

💡 Mẹo

· Muốn xem tháng 3 → bấm 🕰 để nhảy nhanh
· Muốn xem tháng xa → bấm label giữa → chọn từ picker
· Label hiển thị cả năm (VD: "Tháng 10/2026")

---

9. HẠNG THƯỞNG

🏆 5 hạng

Hạng Bonus Điều kiện (tham khảo)
Chuẩn +0% Chưa chọn
Đồng +10% Mới
Bạc +15% Trung bình
Vàng +20% Khá
B.Kim +22% Giỏi
K.Cương +26% Xuất sắc

🎯 Cách chọn

· Chạm 1 lần vào pill → chọn hạng đó
· Nhấn giữ 0.5s pill đang active → bỏ chọn (về Chuẩn)

💡 Công thức

```
Thưởng = Gốc × %hạng
```

VD: Gốc 1.100 điểm, hạng Vàng (+20%) → Thưởng = 220 điểm

---

10. NHẬT KÝ — SỬA/XÓA

📂 Truy cập

Menu ☰ → Nhật ký

Hoặc có thể mở từ bất kỳ đâu (không có tab riêng ở bottom nav).

🎛️ Bộ lọc

```
[Tất cả]  [Giao]  [Lấy]  [Hoàn]
```

· Tất cả — hiện tất cả bản ghi trong tháng
· Giao/Lấy/Hoàn — chỉ hiện loại tương ứng

✏️ Sửa bản ghi

1. Tìm bản ghi muốn sửa
2. Bấm nút Sửa
3. Modal mở với số liệu cũ
4. Sửa số → Bấm Lưu dữ liệu
5. Banner "Hoàn tác" hiện 5s — bấm để hủy nếu sửa nhầm

🗑️ Xóa bản ghi

1. Bấm nút Xóa
2. Xác nhận → Xóa
3. Banner "Hoàn tác" hiện 5s

🔄 Hoàn tác (Undo)

Sau khi Sửa/Xóa, banner đen hiện ở dưới:

```
Đã xóa bản ghi... [Hoàn tác]
```

Bấm "Hoàn tác" trong 5s → khôi phục lại. Sau 5s → mất.

---

11. BACKUP & CLOUD

☁️ Cloud Backup (GitHub Gist)

Tại sao cần: Reset máy / xóa cache → dữ liệu local sẽ mất. Cloud backup giúp khôi phục.

🔑 Setup lần đầu (5 phút)

Bước 1 — Lấy GitHub Token:

1. Vào github.com/settings/tokens (đăng nhập GitHub)
2. Bấm Generate new token (classic)
3. Note: spx-backup
4. Expiration: No expiration
5. Scope: Tích gist
6. Bấm Generate → Copy token (ghp_...)

Bước 2 — Nhập vào app:

1. Menu ☰ → Backup & Cloud
2. Dán token vào ô GitHub Token
3. Bấm 🔌 Kiểm tra → thấy "✅ OK — username"
4. Bấm ☁️ Backup → tạo Gist lần đầu
5. Gist ID tự động điền

Bước 3 — Bật auto:

1. Tích "Tự động backup sau mỗi thay đổi"
2. Từ giờ, mỗi lần nhập sản lượng → tự backup sau 10s

⬇️ Khôi phục từ Cloud

1. Menu ☰ → Backup & Cloud
2. Bấm ⬇️ Khôi phục từ Cloud
3. Xác nhận → app tải dữ liệu về
4. ⚠️ Sẽ GHI ĐÈ dữ liệu hiện tại

📁 Sao lưu cục bộ (file JSON)

· 💾 Lưu file — tải file SPX_Data_2026-10-03.json
· 📥 Nạp file — chọn file JSON đã lưu để khôi phục
· 📋 Chép — copy JSON vào clipboard
· 📝 Dán — dán JSON vào để khôi phục

🔄 Phục hồi tự động (Vault)

App tự lưu bản sao vào localStorage mỗi lần đổi data. Nếu mất data local → bấm 🔄 Phục hồi tự động.

---

12. CÀI ĐẶT KHÁC

🌙 Chế độ tối

Menu ☰ → Chế độ tối → chuyển sang giao diện tối

🧹 Dọn bản ghi trùng

Menu ☰ → Backup & Cloud → kéo xuống → Dọn bản ghi trùng lặp

→ Tìm và xóa các bản ghi cùng ngày + cùng số liệu.

⚠️ Xóa toàn bộ nhật ký

Menu ☰ → Backup & Cloud → kéo xuống đáy → Xóa toàn bộ nhật ký

⚠️ KHÔNG THỂ KHÔI PHỤC! Backup trước khi xóa.

📖 Hướng dẫn trong app

Menu ☰ → Hướng dẫn sử dụng → xem guide tại chỗ.

❤️ Ủng hộ tác giả

Menu ☰ → Ủng hộ tác giả → Viettinbank

---

13. XỬ LÝ SỰ CỐ

🐛 OCR đọc sai

Triệu chứng: Số trong ô không khớp ảnh gốc.

Cách xử lý:

1. Chụp lại ảnh rõ nét hơn (ánh sáng đủ, không rung)
2. Tránh chụp ảnh nghiêng, mờ, bị che
3. Nếu vẫn sai → mở ảnh gốc trong modal → sửa tay số bị sai
4. Màu viền ô cho biết độ tin cậy:
   · 🟢 Xanh — OK
   · 🟡 Vàng — cần xem lại
   · 🔴 Đỏ — chắc chắn phải sửa

🔄 App không cập nhật sau khi deploy

Triệu chứng: Bấm vào vẫn thấy giao diện cũ.

Cách xử lý:

1. Chạm 🔒 (ổ khóa) trên URL → Xóa dữ liệu trang
2. Nhấn nút □ → vuốt Chrome lên để kill hẳn
3. Mở lại URL → tải bản mới

💥 Mất dữ liệu

Nguyên nhân: Xóa cache Chrome / reset máy.

Cách khôi phục:

1. Mở app → Menu ☰ → Backup & Cloud
2. Bấm ⬇️ Khôi phục từ Cloud (nếu đã setup)
3. Hoặc 🔄 Phục hồi tự động (nếu vault còn)
4. Hoặc 📥 Nạp file (nếu có file JSON backup)

⚠️ Báo "Đã tồn tại bản ghi cùng số liệu"

Nguyên nhân: Ngày đó bạn đã nhập rồi với cùng số.

Cách xử lý:

· Nếu muốn sửa → vào Nhật ký → bấm Sửa bản ghi cũ
· Nếu số thực tế khác → sửa số liệu trước khi lưu

📷 Không thấy nút quét

Nguyên nhân: Có thể do tab đang bị lỗi.

Cách xử lý: Đóng app hoàn toàn → mở lại.

🎯 Điểm không đúng chính sách

Kiểm tra:

1. Khu vực đã đúng chưa? (Miền / HCM-HN)
2. Hạng thưởng đã chọn chưa?
3. Config lương của tháng đúng chưa?
4. Số liệu SL có bị nhập sai dải không?

Nếu vẫn sai → báo tác giả kèm screenshot.

---

14. CÂU HỎI THƯỜNG GẶP (FAQ)

❓ App có mất phí không?

Không. Miễn phí 100%, không quảng cáo.

❓ Dữ liệu lưu ở đâu?

Trên máy bạn (localStorage). Không gửi lên server. Cloud backup là tùy chọn.

❓ Xóa app có mất dữ liệu?

Xóa app khỏi màn hình chính → KHÔNG mất (chỉ mất icon). Xóa dữ liệu trình duyệt → MẤT.

❓ Có dùng trên nhiều máy không?

Chưa hỗ trợ sync đa thiết bị. Muốn dùng nhiều máy → dùng Cloud backup (backup máy A → restore máy B).

❓ Lương tháng cũ có bị đổi khi sửa tháng mới?

Không. Mỗi tháng lưu riêng biệt. Đây là tính năng v50.4.

❓ Có cần mạng để dùng không?

Chỉ cần mạng lần đầu (~15MB). Sau đó chạy offline hoàn toàn.

❓ Làm sao biết app đã cập nhật phiên bản mới?

· Xem số version ở đầu file này
· Hoặc xem tab T.Quan có tính năng mới không
· Nếu nghi ngờ → clear cache theo hướng dẫn ở mục 13

❓ Tôi có 2 tài khoản SPX, làm sao?

Hiện tại app chưa hỗ trợ nhiều tài khoản. Muốn tách → dùng 2 điện thoại hoặc 2 trình duyệt khác nhau.

❓ Có xem được nhiều tháng cạnh nhau không?

Chưa. Chỉ xem 1 tháng/lần. Muốn so sánh → export JSON 2 tháng rồi so tay.

❓ Điểm tính theo tháng hay năm?

Theo tháng. Điểm tổng ở Hero là của tháng đang xem.

❓ Có in báo cáo được không?

Chưa có tính năng in. Backup → mở file JSON.

❓ Gặp bug thì báo ai?

Nhắn tác giả qua Ủng hộ tác giả hoặc gửi screenshot + mô tả ngắn.

---

📞 LIÊN HỆ & ỦNG HỘ

· Viettinbank: 106879606835
· Chủ TK: LINH

App miễn phí — nếu giúp ích cho công việc, ủng hộ tác giả 1 ly cà phê ☕

---

🎯 MẸO SỬ DỤNG NHANH

Mẹo Cách làm
Nhập nhanh cuối ngày Chụp ảnh SPX → mở SPX Tracker → 📷 → chọn ảnh
Xem nhanh điểm tháng này Mở app → tab T.Quan (mặc định)
Kiểm tra có bị lỡ ngày nào Nhật ký → xem danh sách có dư ngày không
Xóa lương tháng cũ Chuyển về tháng đó → set 0 → Lưu
Nhập nhiều ảnh 1 lúc 📷 → chọn nhiều ảnh (Chrome cho ~10-20 ảnh)
Phục hồi nhanh Menu ☰ → Backup & Cloud → ⬇️ Khôi phục

---

Chúc bạn sử dụng hiệu quả! 🚀

SPX Tracker v50.4.1 — Made with ❤️ for SPX drivers