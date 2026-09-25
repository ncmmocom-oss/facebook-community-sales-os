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


## V1.4.0 - AI Opportunity Engine
Sau khi Import JSON, hệ thống có thể tự phân tích các bài chưa có kết quả và điền trực tiếp vào `CƠ HỘI`:

`Pain -> Intent -> Điểm -> Phân loại KH -> Giải pháp giá trị -> Comment gợi ý -> Hành động tiếp theo -> Follow-up`

### Cấu hình
Mở `SOCIAL AIO -> Import JSON`. Trong cùng cửa sổ có khu vực **AI phân tích cơ hội**:
- OpenAI API key
- Model (mặc định `gpt-6-luna`)
- Business context / sản phẩm đang bán
- Số bài tối đa mỗi lần
- Bật/tắt tự phân tích sau Import

API key chỉ được lưu trong Apps Script **Script Properties**, không ghi vào Sheet hay GitHub.

### Logic bảo vệ chất lượng
- Người bán/quảng cáo không tự động được coi là khách.
- Bài bán hàng có nhiều tương tác có thể được xếp thành `Nguồn hội thoại`.
- Comment gợi ý không được giả trải nghiệm, testimonial hay chèn link bán hàng vô cớ.
- Chỉ phân tích bài chưa có Pain / Intent / Score / Phân loại, nên không ghi đè phân tích thủ công.
- Sau AI, hệ thống tự đồng bộ `KHÁCH HÀNG TIỀM NĂNG` và `ĐIỀU PHỐI`.

## V1.4.1 - Pipeline Repair
- `NHẬP JSON` phản ánh đúng trạng thái `Chờ AI / Đã phân tích` theo dữ liệu thật trong `CƠ HỘI`.
- `NHÓM` được rebuild từ registry `QUÉT NHÓM`, nên mọi group active đều xuất hiện, kể cả khi chưa có lead.
- Sửa mapping group legacy bằng Post ID + Group ID/file context; slug group không còn bị rút gọn kiểu `Group 3`.
- Pipeline hiện tại: `JSON -> CƠ HỘI -> AI -> KHÁCH HÀNG TIỀM NĂNG -> ĐIỀU PHỐI`.


## V1.5.0 - Stable Menu + OpenAI / Gemini
### Vì sao trước đó chỉ thấy “Thử tải lại từ GitHub”?
`onOpen()` là simple trigger. Simple trigger không được phép tự gọi một service cần authorization như `UrlFetchApp`. Bootstrap cũ cố tải Runtime.js từ GitHub ngay trong `onOpen`, nên khi cache hết hạn nó rơi vào fallback menu.

### Bootstrap V2
`bootstrap/Code.gs` V2 chỉ dựng menu local khi Sheet mở. Runtime GitHub chỉ được tải sau khi người dùng chủ động bấm menu, lúc đó Apps Script có authorization context.

Menu cố định:
- Import JSON / Cấu hình AI
- AI PHÂN TÍCH BÀI CHỜ
- CẬP NHẬT DỮ LIỆU
- Đồng bộ KH tiềm năng
- Kiểm tra bài trùng
- Cập nhật runtime từ GitHub
- Thông tin phiên bản

### AI Provider
Có thể chọn:
- OpenAI — mặc định `gpt-5.6-luna`
- Google Gemini — mặc định `gemini-3.5-flash`

Google Sheets không cần API key riêng vì Apps Script sử dụng OAuth của Sheet. Chỉ nhập Gemini API key nếu muốn dùng Gemini làm AI provider.

API keys được lưu trong Apps Script Script Properties, không lưu trong Sheet và không commit lên GitHub.


## V1.5.1 - Gemini schema hotfix
Gemini `generateContent.responseSchema` uses a restricted Schema/OpenAPI representation rather than the full JSON Schema accepted by other structured-output APIs. V1.5.0 sent `additionalProperties`, causing HTTP 400.

V1.5.1 sanitizes the schema recursively for Gemini only. OpenAI keeps the stricter JSON Schema unchanged.

Expected retry after update:
- no more `Unknown name "additionalProperties"`
- backlog batches start populating Pain / Intent / Score / Classification
- after AI completes, KHÁCH HÀNG TIỀM NĂNG and ĐIỀU PHỐI refresh automatically
