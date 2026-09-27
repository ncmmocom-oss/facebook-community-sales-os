# Social AIO Worker Keeper — P1.5 V1.1.0

## Mục tiêu

Giữ một tab Social AIO APIs làm Worker W1, tự reconnect khi rớt WebSocket và cho phép gán URL/tab thủ công nếu extension chưa bắt được tab đã mở.

## Điểm mới V1.1.0

- Thêm ô **Worker URL**.
- Nút **MỞ & BẮT**: mở URL, lưu URL cho W1 và gán tab đó làm primary.
- Nút **BẮT TAB HIỆN TẠI**: dùng khi tab APIs đã mở nhưng popup vẫn báo NO_TAB.
- Background query toàn bộ tab rồi tự kiểm tra hash route `#/apis`.
- Thêm quyền `scripting` để inject `content.js` vào tab đã mở trước khi extension được cài.
- Có ping guard để không inject script trùng.
- Không tự reload trang, không tự đóng tab.

## Cài / cập nhật

1. Giải nén ZIP vào một thư mục cố định.
2. Mở `chrome://extensions`.
3. Developer mode = ON.
4. Nếu đang dùng V1.0.0:
   - Remove extension cũ hoặc chọn đúng folder mới rồi **Reload** extension.
5. **Load unpacked** → chọn folder chứa `manifest.json`.
6. Mở popup Keeper.

## Nếu popup báo NO_TAB

### Cách 1 — khuyến nghị

- Worker URL = `https://fbaio.org/#/apis`
- Bấm **MỞ & BẮT**.
- Chờ trang load.
- Mở popup lại sau 2–5 giây.

### Cách 2 — tab APIs đang mở sẵn

- Đứng tại tab `fbaio.org/#/apis`.
- Bấm icon extension.
- Bấm **BẮT TAB HIỆN TẠI**.
- Không cần F5.

## Acceptance

### A. Bind
- Trang Social AIO đang Connected.
- Bấm **BẮT TAB HIỆN TẠI**.
- Popup phải chuyển NO_TAB → ONLINE.

### B. URL Open
- Đóng tab APIs.
- Nhập `https://fbaio.org/#/apis`.
- Bấm **MỞ & BẮT**.
- Extension mở tab mới và sau vài giây popup = ONLINE.

### C. F5 Recovery
- Khi ONLINE, F5 tab APIs.
- Không bấm Connect.
- Keeper tự reconnect và trở lại ONLINE.

### D. WebSocket Error
- Nếu popup WebSocket error xuất hiện, Keeper tự đóng OK và retry Connect.

### E. Duplicate tab
- Mở thêm một tab APIs.
- Chỉ primary tab được phép reconnect chủ động.

## Safety

Keeper chỉ quản lý trạng thái browser connection. Không scrape Facebook, không thay scanner, pagination, AI hay Lead Gate.
