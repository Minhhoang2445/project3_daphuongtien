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
