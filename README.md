# Project 3 Đa Phương Tiện

Frontend cho đồ án livestream Mini Twitch.

## Chạy local

```powershell
npm install
npm run dev
```

Mở:

```text
http://localhost:3000
```

## Cấu hình môi trường

Copy `.env.example` thành `.env.local`, rồi sửa URL backend:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_SAMPLE_HLS_URL=http://103.6.234.179/hls/minhhoang_live_key.m3u8
SERVER_VIDEO_URLS=
```

## Server streaming VPS

```text
IP VPS: 103.6.234.179
OBS Server: rtmp://103.6.234.179:1935/live
Stream Key: minhhoang_live_key
HLS live: http://103.6.234.179/hls/minhhoang_live_key.m3u8
Statistics: http://103.6.234.179/stat
```

## Ghi chú độ trễ live

Frontend đã cấu hình `hls.js` để bám sát mép live khi phát HLS. Tuy vậy Nginx RTMP + HLS vẫn là near-live, không phải realtime dưới 1 giây. Muốn giảm trễ với HLS, VPS nên dùng segment ngắn và OBS nên để keyframe interval 1 giây:

```nginx
hls_fragment 1s;
hls_playlist_length 3s;
hls_cleanup on;
```

Nếu yêu cầu realtime đúng nghĩa, cần đổi luồng phát sang WebRTC/LiveKit hoặc WHIP/WHEP thay vì chỉ dùng HLS.

## Lấy video từ VPS

Trang `/videos` sẽ thử lấy danh sách video theo thứ tự:

1. Backend API `/videos`.
2. Next proxy `/api/server-videos`, proxy này đọc `manifest.json` hoặc autoindex từ VPS.
3. Nếu VPS chưa bật danh sách, có thể khai báo trực tiếp URL HLS/MP4:

```env
SERVER_VIDEO_URLS=http://103.6.234.179/vod-hls/record-001/index.m3u8,http://103.6.234.179/video/demo.mp4
```

Không đưa link live `/hls/minhhoang_live_key.m3u8` vào `SERVER_VIDEO_URLS`; link đó chỉ dùng cho trang live và cần OBS đang publish. VOD/record phải là file xem lại được khi OBS đã tắt.

Nếu record đang nằm trong `/var/records`, Nginx cần expose file đã convert sang HLS/MP4, ví dụ:

```nginx
location /vod-hls/ {
    alias /var/www/vod-hls/;
    autoindex on;
    add_header Access-Control-Allow-Origin * always;
}
```

## Phạm vi thành viên 2

- Home page: live streams và VOD nổi bật.
- Login/register bằng JWT.
- Live page phát HLS bằng `hls.js`.
- Dashboard streamer: RTMP URL, Stream Key, HLS URL.
- VOD list/detail.
- Chat UI.
- Guide OBS/Larix.

Folder `pull/streamix` chỉ dùng để tham khảo, không code trực tiếp vào đó.
