# Social AIO Worker Keeper — P1.5 V1.2.0 Production Hardening

## Mục tiêu

Giữ W1 ổn định cho pilot 50–200 Facebook Groups mà không để tab Social AIO khác cướp Worker, đồng thời phát hiện lỗi trên trang và tạo log đủ để chẩn đoán.

## V1.2.0

### Sticky W1 binding

- Chỉ **MỞ & GẮN** hoặc **GẮN TAB HIỆN TẠI** mới đổi W1.
- Một tab `#/apis` mới mở KHÔNG được tự trở thành primary.
- W1 được pin.
- Nếu W1 bị đóng, tùy chọn **Tự khôi phục W1 tab** sẽ mở lại đúng Worker URL.
- Popup mở ở tab nào cũng đọc trạng thái của W1 đã bind, không phụ thuộc tab hiện tại.
- Có **BỎ GẮN** để dừng cơ chế sticky/auto restore có chủ đích.

### Colored extension icon + status badge

Static icon có màu. Badge runtime:

- `ON` xanh = ONLINE
- `...` cam = CONNECTING
- `?` vàng = STALE
- `!` đỏ = ERROR
- `OFF` đỏ = OFFLINE
- `R` xanh dương = RESTORING
- `—` xám = NO_TAB

### Error Watcher

Keeper dò các lỗi/banner chính:

- `E_WS_ERROR` — WebSocket error → dismiss + reconnect
- `E_CLIENT_NOT_CONNECTED` → reconnect
- `E_AUTH_EXPIRED` → yêu cầu operator đăng nhập lại, không click login tự động
- `E_CONNECT_MISSING` → UI/site thay đổi hoặc Connect chưa render
- `E_CLIENT_ID_CHANGED` → chặn guard, không tự ghi đè baseline
- `E_TAB_NAVIGATED` → W1 rời trang APIs
- `E_CONTENT_DEAD` → content script không phản hồi
- `E_SITE_UPDATE` → chỉ cảnh báo, không auto reload

### Client ID Guard

Không lưu full Client ID trong Keeper log. Extension lưu fingerprint + dạng masked. Client mới khác baseline sẽ chuyển Guard = MISMATCH; operator phải bấm **XÁC NHẬN CLIENT HIỆN TẠI** nếu thực sự muốn nhận Client mới.

### Operations

- SELF TEST
- QUÉT LỖI
- Health log 100 event
- COPY LOG
- Uptime hiện tại
- Reconnect count 1h / 24h

## Cài/cập nhật

1. Giải nén ZIP vào thư mục cố định.
2. Mở `chrome://extensions`.
3. Developer mode = ON.
4. Remove bản cũ hoặc trỏ Load unpacked sang folder V1.2.0.
5. Load unpacked folder chứa `manifest.json`.
6. Mở Social AIO APIs và dùng **GẮN TAB HIỆN TẠI** một lần.

## Acceptance V1.2.0

1. Bind W1 → ONLINE.
2. Mở 5 tab thường → W1 không đổi.
3. Mở thêm tab Social AIO `#/apis` → W1 không đổi.
4. F5 W1 → tự về ONLINE.
5. WebSocket error → auto dismiss + reconnect.
6. Đóng W1 → nếu Auto Restore ON, tab đúng URL tự mở lại.
7. Client ID thay đổi → Guard = MISMATCH, không tự accept.
8. SELF TEST → PASS.
9. COPY LOG → clipboard có event timeline.
10. Soak 30–60 phút → không reconnect storm.

## Safety boundaries

Keeper KHÔNG:
- scrape Facebook;
- thay đổi scanner/pagination;
- sửa Apps Script business logic;
- tự reload site khi có update;
- tự accept Client ID mới;
- tự thao tác trên tab ngoài bound W1.
