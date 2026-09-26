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


## V1.5.2 - Gemini Resilience
Gemini 503/429 được coi là lỗi tạm thời. Runtime mới:
- retry cùng model tối đa 3 lần với exponential backoff + jitter;
- gọi `models.list` bằng chính Gemini API key để chỉ chọn model có `generateContent`;
- nếu vẫn bận, tự chuyển qua stable model khác;
- mặc định `gemini-auto`.

Fallback hiện tại:
`3.5 Flash-Lite -> 3.8 Flash -> 3.6 Flash -> 3.5 Flash -> 3.1 Flash-Lite`.

Gemini 2.5 không còn nằm trong selector mặc định vì Google đang giới hạn 2.5 cho các project/tài khoản đã dùng trước đó. Dữ liệu chưa xử lý vẫn giữ `Chờ AI` nếu mọi model đều thất bại.


## V1.5.3 - Live Progress + AI Log
- Cửa sổ AI hiển thị tiến độ live: Run ID, Batch x/y, số bài đã phân tích/tổng, %, model thực tế, số lỗi.
- Poll tiến độ mỗi 2 giây trong khi AI chạy.
- Sheet `NHẬT KÝ AI` ghi START / BATCH_OK / BATCH_ERROR / DONE.
- Dùng ScriptLock để chặn chạy AI song song do double-click hoặc nhiều cửa sổ.
- Runtime version được bump đúng lên 1.5.3.


## V1.6.0 - Comment Intelligence + Person Timeline

### Mục tiêu
Đưa chiến thuật Community Sales từ cấp **bài viết** xuống đúng nơi có buyer intent mạnh hơn: **bình luận và hội thoại**.

### Import
Cùng một cửa sổ Import JSON nhận:
- `posts*.json` → NHẬP JSON + CƠ HỘI
- `comments*.json` / `replies*.json` → BÌNH LUẬN + CƠ HỘI

Runtime tự nhận diện loại file. Comment được chống trùng riêng bằng Comment ID / comment permalink. Khi comment không có ID, runtime tạo stable SHA-256 key từ post + author + content + time.

### BÌNH LUẬN
Lưu bằng chứng gốc:
`Post ID | Comment ID | URL comment | Parent Comment | Người comment | FB URL | Nội dung | Reaction | Reply | Pain | Intent | Score | Phân loại | Reply gợi ý | Next Action`.

### CƠ HỘI
Cột B đổi từ `Post ID` thành `Source ID`:
- bài viết: giữ Post ID
- bình luận: `C:<comment_id>`

Nhờ vậy cùng một URL bài có thể chứa nhiều comment opportunity mà không bị dedupe nhầm.

### Person Timeline
Tab `LỊCH SỬ KH` được rebuild từ toàn bộ CƠ HỘI:
`Person Key | Người | FB URL | Thời gian | Group | Source | Evidence | Intent | Score | Action | Follow-up | Conversion`.

Một người xuất hiện nhiều bài/comment sẽ có nhiều evidence trong timeline nhưng vẫn được gộp thành một dòng ở `KHÁCH HÀNG TIỀM NĂNG`.

### AI
Nếu `sourceType = Bình luận`, AI:
- đánh giá chính người comment;
- ưu tiên hỏi giá / hỏi mua / hỏi giải pháp / phản đối / cần gấp;
- soạn `suggested_comment` như một **reply nối tiếp thread**, không phải comment quảng cáo độc lập.

### Acceptance
Vì cấu trúc JSON comment của Social AIO có thể thay đổi theo exporter, cần test bằng **1 file comment JSON thực tế**. Parser V1.6.0 hỗ trợ các field phổ biến: `comment_id/id`, `post_id`, `author/actor/user/commenter`, `message/text/body`, `comment_url/permalink_url`, `replies/children`.


## V1.7.0 - Daily Ops + Performance Hardening

### Import telemetry
Hai sheet mới:
- `NHẬT KÝ IMPORT`: mỗi run/group ghi số record đọc, post/comment đọc, post/comment mới, duplicate, duration và lỗi.
- `THỐNG KÊ NGÀY`: mỗi ngày/group ghi lượt cập nhật, tổng JSON đọc, post/comment quét, dữ liệu mới, max bài/lần, tổng dữ liệu đang lưu, KH mới và lần cập nhật cuối.

`QUÉT NHÓM` có thêm Q:V: lượt cập nhật hôm nay, bản ghi lần cuối, bài quét lần cuối, bài/comment mới hôm nay và KH mới hôm nay.

### Newest-first
Dữ liệu mới được insert lên đầu:
- NHẬP JSON: từ row 5
- BÌNH LUẬN: từ row 2
- CƠ HỘI: từ row 2

### Comment intake
Posts JSON được scan cả nested comments/replies. Parent post có thể trùng nhưng comment mới vẫn được import. Parser hỗ trợ các container key có tên chứa comment/reply/children và các wrapper `data` / `items`.

### Media
Runtime thu Media CDN URL từ attachment/image/video/thumbnail/playable URL. Chỉ lưu URL; không dùng `IMAGE()` hàng loạt để tránh làm chậm Sheet.

### Consistency audit
Trong Import Dialog có nút `KIỂM TRA ĐỒNG NHẤT` kiểm tra:
raw post ↔ opportunity, comment ↔ opportunity, group registry và lead evidence.

### Token saver + speed
- AI evidence: post tối đa khoảng 2600 ký tự; comment khoảng 1800 ký tự.
- AI batch: 25 record/batch.
- AI write: một batch Sheet write thay vì nhiều setValue theo từng dòng.
- Normal import/AI dùng FAST refresh; full dedupe/remap chỉ chạy khi người dùng bấm Đồng bộ Sheet.
- Row height cố định + CLIP để content dài không phá layout.


## V1.8.0-POC — Social AIO API Bridge

POC này bỏ bước tải JSON thủ công cho luồng thử nghiệm.

### Contract chính thức dùng trong POC

Social AIO cung cấp relay HTTP:

```
POST https://api.fbaio.org/call
Content-Type: application/json

{
  "id": "<CLIENT_ID>",
  "apiname": "get_list_fb_group_posts",
  "apiparams": {
    "url": "https://www.facebook.com/groups/...",
    "sorting": "Newest Posts",
    "cursor": ""
  }
}
```

CLIENT_ID lấy tại **Social AIO → Automation → APIs → Connect**. Tab APIs phải giữ trạng thái Connected vì browser/extension là worker thực thi Facebook API bằng phiên đang đăng nhập.

### POC Gates

1. **TEST KẾT NỐI** — gọi `get_ext_version` và thử `get_my_profile_lite`.
2. **GROUP API** — gọi `get_list_fb_group_posts` cho page đầu rồi đẩy trực tiếp vào pipeline NHẬP JSON → CƠ HỘI.
3. **COMMENT API** — gọi `get_list_fb_comment` cho page đầu rồi đẩy vào BÌNH LUẬN → CƠ HỘI.
4. Chỉ sau khi cả 3 gate PASS mới triển khai cursor pagination + scheduler 15–30 Group/Profile.

### Bảo mật

Không lưu Facebook cookie, access token hoặc CLIENT_ID trong GitHub hay ô Sheet. CLIENT_ID được giữ trong Apps Script Document Properties. Raw Facebook access token không được dùng trong POC.

## V1.8.1-POC — QUÉT NHÓM điều khiển trực tiếp trong Sheet

Sau khi mở **SOCIAL AIO → Import JSON / Cấu hình AI**, Control Center chuyển sang modeless để có thể thao tác Sheet đồng thời.

Trong sheet **QUÉT NHÓM**, runtime tự thêm control ở W:Z:

- **W — Chọn API**: checkbox chọn nhiều Group.
- **X — API Quét / Dừng**: dropdown `SẴN SÀNG / ▶ QUÉT / ĐANG QUÉT… / ■ DỪNG`.
- **Y — API trạng thái**: SẴN SÀNG / ĐANG QUÉT / XONG / DỪNG / LỖI.
- **Z — API chi tiết**: số post, số mới, số trùng, cursor, thời gian hoặc lỗi.

Các cột thống kê Q:V không bị xóa; chỉ ẩn khỏi operator view để W:Z nằm sát phần registry hiện tại. Dữ liệu tương đương vẫn có tại **THỐNG KÊ NGÀY**.

### Single Group

Chọn `▶ QUÉT` tại cột X của đúng dòng Group. Runtime dùng URL ở cột D và Social AIO HTTP Relay đã cấu hình. Trong lúc chạy X đổi thành `ĐANG QUÉT…`; có thể chọn `■ DỪNG`. Lệnh dừng được kiểm tra sau API call/page hiện tại.

### Multi Group

Tick W cho các Group cần chạy. Control Center hiển thị số Group đã chọn và cung cấp:

- `▶ QUÉT CÁC GROUP ĐÃ CHỌN`
- `■ DỪNG CÁC GROUP ĐÃ CHỌN`
- `BỎ CHỌN`

Batch có execution budget 230 giây; nếu chưa xử lý hết, các dòng còn lại giữ checkbox để bấm tiếp, tránh Apps Script hard-timeout.

### Không cần thay bootstrap Code.gs

V1.8.1-POC tái sử dụng global wrapper `importJsonFiles` hiện có để làm installable onEdit handler. Control Center tự cài trigger khi được mở, vì vậy không cần paste lại bootstrap Code.gs.

### Comment URL guard

`get_list_fb_comment` yêu cầu URL post/permalink cụ thể. Nếu nhập URL root của Group, runtime chặn trước và báo rõ thay vì để Social AIO trả `Cannot get post ID from URL`.


## V1.8.2-POC — Triggerless Google Sheets Control Center

V1.8.1 attempted to create an installable onEdit trigger at runtime. With the production manifest using explicit narrow scopes, `ScriptApp.getProjectTriggers()` requires the additional `script.scriptapp` OAuth scope and therefore failed before the trigger could be created.

V1.8.2 removes that dependency entirely.

### Operator flow

- Open the modeless Social AIO Control Center.
- Single Group: click any cell on the Group row in **QUÉT NHÓM** → click **QUÉT DÒNG ĐANG CHỌN**.
- Multi Group: tick **Chọn API** for multiple rows → click **QUÉT CÁC GROUP ĐÃ CHỌN**.
- Stop requests are issued from the Control Center and take effect after the current relay/API call returns.

### Sheet controls

W:Z:
- **W Chọn API**
- **X API trạng thái**
- **Y API chi tiết**
- **Z API Run**

No onEdit trigger, no `ScriptApp`, no extra Apps Script OAuth scope.

### Why

Long-running network work should not be tied directly to a cell edit. The modeless sidebar/dialog gives explicit operator intent, visible progress and better error handling while keeping the narrow existing scopes: current spreadsheet, container UI and external requests.


## V1.8.3-POC — Operator Simple

Mục tiêu: người vận hành không cần hiểu API/Apps Script.

### Luồng mặc định

1. Tick **Chọn** cho các Group cần quét.
2. Chọn **10 / 15 / 20 / 25 bài mỗi Group** nếu không dùng mặc định 25.
3. Bấm **QUÉT ĐÃ CHỌN**.

Nếu giữ mặc định 25 bài, thực tế chỉ còn 2 thao tác: tick Group → QUÉT.

### QUÉT NHÓM

- Cột I: **Số bài/lần**, dropdown 10/15/20/25.
- W: **Chọn**.
- X: **Trạng thái** — CHỜ / ĐANG QUÉT / XONG / THIẾU / LỖI / DỪNG.
- Y: **Tiến độ** — ví dụ `18/25 bài • 6 mới • 12 trùng • 2 page • 8.4s`.
- Z: **Lỗi / Ghi chú**.

### Control Center

Hiển thị bộ đếm:
- Đã chọn
- Số bài yêu cầu
- Đang quét
- Xong
- Lỗi
- Thiếu / Dừng

Nút vận hành chính:
- **QUÉT ĐÃ CHỌN**
- **DỪNG**
- **RETRY LỖI / THIẾU**

### Target-aware pagination

`get_list_fb_group_posts` không có tham số limit, nên runtime dùng cursor để lấy thêm page cho tới target 10/15/20/25. Nếu API hết cursor trước target, trạng thái là **THIẾU** chứ không ghi XONG giả.

Các phần Import JSON, AI và Bridge cấu hình được giữ làm fallback nhưng thu gọn dưới mục **Cấu hình nâng cao**.
