# Livestream Mini Twitch Backend

Backend API riêng cho dự án Livestream Mini Twitch phiên bản tối giản.

## Công nghệ

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- MySQL
- bcrypt
- cors
- dotenv
- tsx

## Cài đặt

```bash
npm install
```

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Tạo database MySQL:

```sql
CREATE DATABASE livestream_mini_twitch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Chạy migration:

```bash
npx prisma migrate dev --name init
```

Seed dữ liệu mẫu:

```bash
npx prisma db seed
```

Chạy dev server:

```bash
npm run dev
```

Mặc định backend chạy tại:

```txt
http://localhost:3000
```

## Biến môi trường

```env
DATABASE_URL="mysql://root:password@localhost:3306/livestream_mini_twitch"
PORT=3000
APP_URL="http://localhost"
RTMP_SERVER_URL="rtmp://localhost:1935/live"
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN="http://localhost:5173"
```

## Test API bằng curl

Register viewer:

```bash
curl -X POST http://localhost:8080/api/v1/viewer/register \
  -H "Content-Type: application/json" \
  -d '{"username":"viewer01","password":"123456"}'
```

Login viewer:

```bash
curl -X POST http://localhost:8080/api/v1/viewer/login \
  -H "Content-Type: application/json" \
  -d '{"username":"viewer01","password":"123456"}'
```

Lấy stream LIVE:

```bash
curl http://localhost:8080/api/v1/streams/live
```

Lấy chi tiết streamer:

```bash
curl http://localhost:8080/api/v1/streamers/minhhoang
```

Lấy OBS/Larix config:

```bash
curl http://localhost:8080/api/v1/streamers/minhhoang/obs-config
```

Gửi chat:

```bash
curl -X POST http://localhost:8080/api/v1/streamers/minhhoang/chat \
  -H "Content-Type: application/json" \
  -d '{"viewerId":1,"message":"Live mượt quá"}'
```

Lấy chat:

```bash
curl http://localhost:8080/api/v1/streamers/minhhoang/chat
```

Lấy danh sách VOD:

```bash
curl http://localhost:8080/api/v1/videos
```

Lấy chi tiết VOD:

```bash
curl http://localhost:8080/api/v1/videos/1
```

Test callback on_publish:

```bash
curl -X POST http://localhost:8080/api/v1/rtmp/on-publish \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "app=live&name=minhhoang_live_key&addr=113.161.xxx.xxx"
```

Test callback on_done:

```bash
curl -X POST http://localhost:8080/api/v1/rtmp/on-done \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "app=live&name=minhhoang_live_key&addr=113.161.xxx.xxx"
```

## Cấu hình frontend

Vite:

```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
```

Create React App:

```env
REACT_APP_API_BASE_URL="http://localhost:3000/api/v1"
```

## Cấu hình Nginx RTMP

```nginx
application live {
    live on;

    on_publish http://127.0.0.1:3000/api/v1/rtmp/on-publish;
    on_done http://127.0.0.1:3000/api/v1/rtmp/on-done;

    hls on;
    hls_path /var/www/hls;
    hls_fragment 3;
    hls_playlist_length 15;

    record all;
    record_path /var/records;
    record_unique on;
}
```

## Stream mẫu

- OBS/Larix server: `rtmp://localhost:1935/live`
- Stream key: `minhhoang_live_key`
- HLS URL: `http://localhost/hls/minhhoang_live_key.m3u8`
