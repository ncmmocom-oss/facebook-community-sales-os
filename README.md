# Facebook Community Sales OS - Social AIO GitHub Runtime V1.2.0

## Mục tiêu
- GitHub là **source of truth** cho code.
- Apps Script chỉ giữ một file `bootstrap/Code.gs` ổn định.
- Mỗi lần chạy, bootstrap tải runtime mới nhất từ GitHub (cache 60 giây).
- Từ lần cài bootstrap đầu tiên, ChatGPT/GitHub Connector chỉ cần cập nhật repo; không phải copy/paste Code.gs lại.

## Repo cần tạo một lần
Tạo public repo:

`ncmmocom-oss/facebook-community-sales-os`

Sau đó cho GitHub connector quyền truy cập repo này.

> Public là cách đơn giản nhất vì Apps Script có thể tải raw file mà không cần lưu GitHub token. Không đặt secret/API key trong repo.

## Cấu trúc repo
- `bootstrap/Code.gs` - file duy nhất cần dán một lần vào Apps Script.
- `apps-script/Runtime.js` - logic production được Apps Script tải từ GitHub.
- `apps-script/ImportDialog.html` - giao diện import được tải từ GitHub.
- `apps-script/manifest.json` - version metadata.

## Cài lần cuối
1. Tạo repo đúng tên ở trên.
2. Upload toàn bộ package lên repo, branch `main`.
3. Trong Apps Script hiện tại, thay `Code.gs` bằng nội dung `bootstrap/Code.gs`.
4. Có thể xóa `ImportDialog.html` cũ vì dialog mới được tải từ GitHub.
5. Save -> reload Google Sheet.

Từ đây về sau không cần copy code thủ công.

## Menu mới
`SOCIAL AIO`
- Import JSON
- **CẬP NHẬT DỮ LIỆU**
- Đồng bộ KH tiềm năng
- Kiểm tra bài trùng
- Cập nhật phiên bản từ GitHub
- Thông tin phiên bản

## CẬP NHẬT DỮ LIỆU làm gì?
- sửa Post ID bị scientific notation bằng URL nguồn;
- ép Post ID về text;
- loại duplicate trong `NHẬP JSON` và `CƠ HỘI`;
- khi có duplicate ở `CƠ HỘI`, ưu tiên record có nhiều dữ liệu hơn để giữ Pain/Intent/Score/Action;
- đồng bộ `KHÁCH HÀNG TIỀM NĂNG`;
- cập nhật `NHÓM` (số KH, top KH, đã bán);
- rebuild `ĐIỀU PHỐI` từ Score/Classification/Follow-up hiện có.

Nút này **không tự gọi AI** để sinh Pain/Intent/Score. Phần AI sẽ được tích hợp sau nếu cần.

## V1.3.0 - Daily Ops
Luồng vận hành hằng ngày được rút gọn thành:

`QUÉT NHÓM -> Social AIO Export JSON -> Import JSON -> tự lọc trùng -> tự remap group -> tự đồng bộ KH -> tự rebuild ĐIỀU PHỐI`

### Tự sửa QUÉT NHÓM
V1.3.0 tự điền từ URL group khi ô còn trống:
- Hoạt động = Có
- Tên nhóm tạm = Group <id/slug>
- Group ID/slug
- Trạng thái = Thử nghiệm
- Số lần quét/ngày = 3
- Số bài/lần = 100
- Công thức Quét tiếp theo / Cần quét?

### Import JSON
Sau khi import xong, runtime tự chạy CẬP NHẬT DỮ LIỆU nên không cần bấm thêm lần hai. Các bản ghi cũ có tên group sai như `Group không rõ` được remap theo URL bài viết và registry QUÉT NHÓM.
