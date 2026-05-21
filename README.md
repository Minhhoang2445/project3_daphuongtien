# Project 3 Da Phuong Tien

Frontend cho do an livestream mini Twitch.

## Chay local

```powershell
npm install
npm run dev
```

Mo:

```text
http://localhost:3000
```

## Cau hinh moi truong

Copy `.env.example` thanh `.env.local`, roi sua URL backend:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## Pham vi thanh vien 2

- Home page: live streams va VOD noi bat.
- Login/register bang JWT.
- Live page phat HLS bang `hls.js`.
- Dashboard streamer: RTMP URL, stream key, HLS URL.
- VOD list/detail.
- Chat UI.
- Guide OBS/Larix.

Folder `pull/streamix` chi dung de tham khao, khong code truc tiep vao do.
