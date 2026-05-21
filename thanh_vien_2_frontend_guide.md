# Hướng Dẫn Công Việc Thành Viên 2 - Frontend

Nguồn: `project3_plan.pdf`, các mục 4, 5.2, 16, 17, 18, 19. Trong PDF, **thành viên 2 = Frontend**.

Bạn không phải người chính làm RTMP/HLS server, VOD adaptive 360p/480p/720p, FFmpeg hay báo cáo tổng hợp. Phần đó thuộc người 4. Việc của bạn là làm web mini Twitch gọi được API, phát được HLS, có dashboard streamer, VOD UI, chat UI, guide OBS/Larix và các trạng thái loading/error/offline/live rõ ràng.

## 1. Đầu Ra Cần Bàn Giao

- Home page hiển thị danh sách stream đang live và VOD nổi bật.
- Login/register gọi API auth và lưu token.
- Live page có HLS player bằng `hls.js`, thông tin streamer, trạng thái live/offline và chat UI.
- Dashboard streamer hiển thị RTMP URL, Stream Key, HLS URL, nút sao chép, nút regenerate và form sửa title/description.
- VOD list/detail, detail phát được HLS URL của VOD.
- Chat UI có history và WebSocket realtime nếu backend hỗ trợ.
- Guide page hướng dẫn cấu hình OBS/Larix.
- Loading, error, empty, offline, live state rõ ràng.
- Ảnh minh chứng: home, login, dashboard, live player, chat, VOD player, guide, loading/error/offline state.

## 2. Thư Mục Làm Việc Đúng

Thư mục làm bài của bạn là:

```powershell
cd ".\git\project3_daphuongtien"
```

Lưu ý: folder `pull/streamix` **chỉ để tham khảo**, không code trực tiếp vào đó. Nếu cần xem cách họ làm UI/player/chat/dashboard thì đọc file trong `pull/streamix`, sau đó tự implement vào `project3_daphuongtien`.

## 3. Route Cần Làm Theo PDF

| Route | Mục đích | API |
| --- | --- | --- |
| `/` | Trang chủ: live streams và VOD nổi bật | `GET /streams/live`, `GET /videos` |
| `/login` | Đăng nhập | `POST /auth/login` |
| `/register` | Đăng ký | `POST /auth/register` |
| `/live/:username` | Xem live: player, chat, thông tin streamer | `GET /streams/:username`, `GET /streams/:streamId/chat`, WebSocket |
| `/dashboard` | Dashboard streamer | `GET /stream-key`, `POST /stream-key/regenerate`, `PUT /streams/me` |
| `/videos` | Danh sách VOD | `GET /videos` |
| `/videos/:id` | Xem chi tiết VOD bằng HLS player | `GET /videos/:id` |
| `/guide` | Hướng dẫn OBS/Larix | static hoặc `GET /stream-key` nếu đã đăng nhập |

Khi implement trong `project3_daphuongtien`, đặt route đúng với PDF: `/login`, `/register`, `/live/[username]`, `/dashboard`, `/videos`, `/videos/[id]`, `/guide`.

## 4. Bước 1 - Chuẩn Hóa API Client

Tạo file gọi API riêng để frontend dùng lại ở nhiều page:

```text
src/lib/api-client.ts
```

API client nên:

- Đọc `NEXT_PUBLIC_API_BASE_URL`.
- Tự gắn `Authorization: Bearer ...` nếu có token.
- Parse response wrapper `{ success, message, data, error }`.
- Ném lỗi rõ ràng khi backend không kết nối được.

Ví dụ `.env`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_SAMPLE_HLS_URL=https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
```

Nếu backend chưa xong, dùng mock data tạm để làm giao diện trước. Khi backend xong chỉ thay hàm gọi API.

## 5. Bước 2 - Login/Register

Cần làm:

- Form login: email, password.
- Form register: username, email, password, role.
- Sau login, lưu `accessToken` vào `localStorage`.
- Lưu user vào state/context hoặc gọi `GET /auth/me`.
- Nếu sai mật khẩu hoặc API lỗi, hiển thị message.

API trong PDF:

```text
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/auth/me
```

Checklist test:

- Đăng ký tài khoản `STREAMER`.
- Đăng nhập thành công.
- Reload trang vẫn lấy lại được user bằng token.
- Đăng xuất xóa token.

## 6. Bước 3 - Home Page

Home page cần có 2 khu vực:

- `Live now`: danh sách stream đang live từ `GET /streams/live`.
- `VOD`: danh sách video từ `GET /videos`.

Mỗi live card nên có thumbnail, title, streamer username, badge `LIVE`, viewer count và link đến `/live/{username}`.

Mỗi VOD card nên có thumbnail, title, duration, createdAt, streamer và link đến `/videos/{id}`.

Trạng thái cần có:

- Loading skeleton.
- Empty state: chưa có stream đang live hoặc chưa có VOD.
- Error/mock state: không kết nối được backend nhưng vẫn có dữ liệu mẫu để demo.

## 7. Bước 4 - HLS Player Cho Live Và VOD

Theo PDF, player phải phát HLS bằng `VideoJS` hoặc `hls.js`.

Nên tách thành component chung:

```text
src/components/hls-player.tsx
```

Nguồn HLS sẽ có dạng:

```text
Live: http://IP_VPS/hls/{streamKey}.m3u8
VOD:  http://IP_VPS/vod-hls/sample/index.m3u8
```

Lưu ý khi test:

- Nếu web chạy `http://localhost:3000`, HLS URL cũng nên là `http://...` để tránh mixed content.
- Nginx cần bật CORS cho `.m3u8` và `.ts`.
- Nếu player không load, mở DevTools > Network để xem `.m3u8` và `.ts` có trả `200` không.
- Nếu URL là adaptive master playlist, player phải hiện Auto/360p/480p/720p nếu `hls.js` đọc được levels.

## 8. Bước 5 - Live Page `/live/:username`

Đây là màn hình demo quan trọng nhất.

Cần hiển thị:

- HLS player.
- Tên stream, title, description.
- Streamer username/avatar.
- Trạng thái `LIVE` hoặc `OFFLINE`.
- Viewer count nếu API có.
- Chat panel bên phải hoặc bên dưới trên mobile.

API:

```text
GET /api/v1/streams/:username
GET /api/v1/streams/:streamId/chat
WebSocket join_stream, send_message, new_message
```

Logic:

1. Lấy stream detail theo username.
2. Nếu `status = LIVE` và có `hlsUrl`, render HLS player.
3. Nếu offline, hiện offline state, không để player báo lỗi thô.
4. Lấy chat history.
5. Kết nối WebSocket và join room theo `streamId`.

## 9. Bước 6 - Chat UI

Chat UI tối thiểu:

- List message.
- Input message.
- Nút send.
- Disable input nếu chưa đăng nhập.
- Khi gửi thành công, message hiện lên ngay.

WebSocket event trong PDF:

```json
{
  "event": "join_stream",
  "data": {
    "streamId": 10
  }
}
```

```json
{
  "event": "send_message",
  "data": {
    "streamId": 10,
    "message": "Hello mọi người"
  }
}
```

```json
{
  "event": "new_message",
  "data": {
    "id": 12,
    "streamId": 10,
    "message": "Hello mọi người",
    "createdAt": "2026-05-20T22:56:00Z",
    "user": {
      "id": 2,
      "username": "viewer01",
      "role": "VIEWER"
    }
  }
}
```

Nếu backend chưa có WebSocket, làm UI + mock/local message trước, rồi ghi rõ trong báo cáo: "chat UI đã sẵn sàng, realtime phụ thuộc backend".

## 10. Bước 7 - Dashboard Streamer

Dashboard là nơi streamer lấy thông tin để nhập vào OBS.

Cần hiển thị:

- RTMP Server: `rtmp://IP_VPS:1935/live`
- Stream Key: ví dụ `mh_9x8a2k`
- HLS URL: `http://IP_VPS/hls/mh_9x8a2k.m3u8`
- Status: `OFFLINE` hoặc `LIVE`
- Nút sao chép từng trường.
- Nút regenerate Stream Key.
- Form update title/description.

API:

```text
GET  /api/v1/stream-key
POST /api/v1/stream-key/regenerate
PUT  /api/v1/streams/me
```

Checklist test:

- Sao chép RTMP URL được.
- Sao chép Stream Key được.
- Regenerate xong UI cập nhật key mới.
- Update title/description xong home/live page hiện title mới.

## 11. Bước 8 - VOD List/Detail

Bạn không cần convert video. Người 4 sẽ tạo VOD HLS và thêm data qua backend.

Việc của bạn:

- `/videos`: gọi `GET /videos`, hiện list.
- `/videos/:id`: gọi `GET /videos/:id`, đưa `video.hlsUrl` vào HLS player.
- Nếu VOD là adaptive master playlist, player phải hiện Auto/360p/480p/720p nếu `hls.js` đọc được levels.

VOD URL mẫu:

```text
http://IP_VPS/vod-hls/record-001/index.m3u8
```

## 12. Bước 9 - Guide Page `/guide`

Trang guide dùng cho demo và người dùng streamer.

Nội dung cần có:

- OBS > Settings > Stream.
- Service: Custom.
- Server: `rtmp://IP_VPS:1935/live`.
- Stream Key: lấy trong dashboard.
- Output settings gợi ý:
  - Resolution: 1280x720.
  - FPS: 30.
  - Video bitrate: 2500 Kbps.
  - Audio bitrate: 128 Kbps.
- Larix:
  - New connection.
  - URL: `rtmp://IP_VPS:1935/live/{streamKey}` hoặc theo cách server nhận key.
  - Start broadcast.

Có thể hiển thị thông tin Stream Key nếu user đã đăng nhập.

## 13. Bước 10 - Loading/Error/Offline/Live State

PDF có checklist riêng cho phần này, nên đừng bỏ qua.

Cần có:

- Loading: skeleton/card shimmer khi đang fetch.
- Error: "Không kết nối được server" + nút retry.
- Offline: player placeholder khi stream offline.
- Live: badge live, viewer count.
- Empty: "Chưa có VOD" hoặc "Chưa có stream đang live".

Đây là phần dễ mất điểm nếu web chỉ chạy lúc dữ liệu đẹp.

## 14. Thứ Tự Làm Để Demo Được Sớm

1. Chạy được project Next.js.
2. Tạo API client và mock data nếu backend chưa xong.
3. Làm home page với live cards và VOD cards.
4. Làm HLS player phát URL `.m3u8` mẫu.
5. Làm live page `/live/:username`.
6. Làm login/register và token.
7. Làm dashboard streamer.
8. Làm VOD list/detail.
9. Làm chat UI.
10. Làm guide OBS/Larix.
11. Thêm loading/error/offline states.
12. Chụp ảnh minh chứng và quay demo.

## 15. Test Với HLS Thật

Hỏi người 3/4 hoặc người phụ trách server các URL sau:

```text
Live HLS: http://IP_VPS/hls/{streamKey}.m3u8
VOD HLS:  http://IP_VPS/vod-hls/sample/index.m3u8
Adaptive: http://IP_VPS/vod-hls/adaptive/master.m3u8
```

Test nhanh:

1. Mở URL `.m3u8` trên trình duyệt, phải thấy nội dung text playlist hoặc download file.
2. Mở DevTools > Network khi player chạy.
3. Kiểm tra `.m3u8` và `.ts` trả về status `200`.
4. Nếu adaptive, trong player phải có Auto/360p/480p/720p.
5. Nếu live, cho phép trễ 5-20 giây vì HLS có latency.

## 16. Checklist Trước Khi Nộp

- [ ] Home page có live list và VOD list.
- [ ] Login/register gọi API được.
- [ ] Token được lưu và gửi bằng `Authorization: Bearer ...`.
- [ ] Live page phát được HLS khi `status = LIVE`.
- [ ] Offline state hiện đúng khi stream offline.
- [ ] Dashboard hiện RTMP URL, Stream Key, HLS URL.
- [ ] Nút sao chép hoạt động.
- [ ] Regenerate Stream Key cập nhật UI.
- [ ] VOD list/detail phát được VOD HLS.
- [ ] Chat UI có history và gửi message.
- [ ] Guide OBS/Larix có thông tin đúng với server nhóm.
- [ ] Có loading/error/empty state.
- [ ] Có ảnh minh chứng cho từng màn hình.

## 17. Phần Cần Phối Hợp Với Thành Viên Khác

Với Backend:

- Thống nhất `NEXT_PUBLIC_API_BASE_URL`.
- Thống nhất response wrapper `{ success, message, data }`.
- Thống nhất token JWT và role.
- Thống nhất WebSocket URL/event.

Với Streaming tester:

- Lấy Stream Key đang live để test player.
- Lấy ảnh OBS/Larix nếu cần đưa vào guide.
- Xác nhận latency HLS và status live/offline.

Với VOD + Adaptive:

- Lấy URL VOD HLS.
- Lấy URL adaptive master playlist.
- Xác nhận player hiện quality selector.

## 18. Câu Nói Khi Demo Phần Của Bạn

> Em phụ trách frontend. Web của em gọi API backend để hiển thị stream/VOD, xử lý đăng nhập bằng JWT, dashboard streamer để lấy RTMP URL và Stream Key, live page phát HLS bằng `hls.js`, có chat UI và các trạng thái loading/error/offline. Phần VOD/adaptive do thành viên khác tạo playlist, frontend của em đọc `hlsUrl` và phát trên player, nếu là master playlist thì hiện quality selector.
