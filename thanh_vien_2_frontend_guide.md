# Huong dan cong viec thanh vien 2 - Frontend

Nguon: `project3_plan.pdf`, muc 4, 5.2, 16, 17, 18, 19. Trong PDF, **thanh vien 2 = Frontend**.

Ban khong phai nguoi chinh lam VOD RTMP/HLS, adaptive 360p/480p/720p, FFmpeg hay bao cao tong hop. Phan do nam o nguoi 4. Viec cua ban la lam web mini Twitch goi duoc API, phat duoc HLS, co dashboard streamer, VOD UI, chat UI va trang guide.

## 1. Dau ra can ban giao

Cuoi cung ban can co:

- Home page hien thi danh sach stream dang live va VOD noi bat.
- Login/register goi API auth va luu token.
- Live page co player HLS bang `VideoJS` hoac `HLS.js`, thong tin streamer, trang thai live/offline va chat UI.
- Dashboard streamer hien thi RTMP URL, stream key, HLS URL, nut copy, nut regenerate, form sua title/description.
- VOD list/detail, detail phat duoc HLS URL cua VOD.
- Chat UI co history va WebSocket realtime neu backend ho tro.
- Guide page huong dan cau hinh OBS/Larix.
- Loading, error, offline, live state ro rang.
- Anh minh chung: home, login, dashboard, live player, chat, VOD player, guide, loading/error/offline state.

## 2. Thu muc lam viec dung

Thu muc lam bai cua ban la:

```powershell
cd ".\git\project3_daphuongtien"
```

Luu y: folder `pull/streamix` **chi de tham khao**, khong code truc tiep vao do. Neu can xem cach ho lam UI/player/chat/dashboard thi doc file trong `pull/streamix`, sau do tu implement vao `project3_daphuongtien`.

Hien tai repo `project3_daphuongtien` moi chi co `.git`, chua co source code app. Buoc dau tien cua ban la thong nhat voi nhom se dung framework nao cho frontend. De lam nhanh va hop voi project tham khao, nen dung Next.js hoac React + Vite.

Neu lenh tao app bao folder khong trong vi dang co file guide nay, tao source app truoc roi dat file guide vao `docs/`, hoac tao app trong folder tam va chuyen source vao `project3_daphuongtien` sau.

Neu chon Next.js, tao app trong chinh folder nay:

```powershell
cd ".\git\project3_daphuongtien"
npx create-next-app@latest . --ts --eslint --app --src-dir
npm install hls.js lucide-react
npm run dev
```

Neu chon React + Vite:

```powershell
cd ".\git\project3_daphuongtien"
npm create vite@latest . -- --template react-ts
npm install
npm install hls.js lucide-react react-router-dom
npm run dev
```

Sau khi chay dev server, mo trinh duyet tai:

```text
http://localhost:3000
```

Neu dung Vite, URL thuong la:

```text
http://localhost:5173
```

Tu `pull/streamix`, phan nen tham khao nhat la:

- `src/components/stream-player/vod-player.tsx`: cach dung `hls.js` va quality selector.
- `src/app/(browse)/(home)`: cach lam home/list stream.
- `src/app/(dashboard)/u/[username]/keys`: cach hien RTMP URL va stream key.
- `src/components/stream-player/chat*`: cach chia chat UI.

## 3. Route can lam theo PDF

PDF yeu cau cac route sau:

| Route | Muc dich | API |
| --- | --- | --- |
| `/` | Trang chu: live streams va VOD noi bat | `GET /streams/live`, `GET /videos` |
| `/login` | Dang nhap | `POST /auth/login` |
| `/register` | Dang ky | `POST /auth/register` |
| `/live/:username` | Xem live: player, chat, thong tin streamer | `GET /streams/:username`, `GET /streams/:streamId/chat`, WebSocket |
| `/dashboard` | Dashboard streamer | `GET /stream-key`, `POST /stream-key/regenerate`, `PUT /streams/me` |
| `/videos` | Danh sach VOD | `GET /videos` |
| `/videos/:id` | Xem chi tiet VOD bang HLS player | `GET /videos/:id` |
| `/guide` | Huong dan OBS/Larix | static hoac `GET /stream-key` neu da dang nhap |

Trong `pull/streamix` tham khao, ten route hoi khac:

| PDF | Repo hien co |
| --- | --- |
| `/login` | `src/app/(auth)/sign-in/page.tsx` |
| `/register` | `src/app/(auth)/sign-up/page.tsx` |
| `/live/:username` | `src/app/(browse)/[username]/page.tsx` |
| `/dashboard` | `src/app/(dashboard)/u/[username]/...` |
| VOD player | `src/components/stream-player/vod-player.tsx` |

Khi implement trong `project3_daphuongtien`, nen dat route dung voi PDF: `/login`, `/register`, `/live/[username]`, `/dashboard`, `/videos`, `/videos/[id]`, `/guide`.

## 4. Buoc 1 - Chuan hoa API client

Tao file goi API rieng, vi frontend se dung lai o nhieu page.

De xuat file:

```text
src/lib/api-client.ts
```

Noi dung mau:

```ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://IP_VPS/api/v1";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: string;
  };
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new Error(body.message || "API request failed");
  }

  return body.data as T;
}
```

Them `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://IP_VPS/api/v1
NEXT_PUBLIC_WS_URL=ws://IP_VPS
```

Neu backend chua xong, ban tao mock data tam de lam giao dien truoc. Khi backend xong chi thay ham goi API.

## 5. Buoc 2 - Login/register

Can lam:

- Form login: email, password.
- Form register: username, email, password, role.
- Sau login, luu `accessToken` vao `localStorage`.
- Luu user vao state/context hoac goi `GET /auth/me`.
- Neu sai mat khau hoac API loi, hien message.

API trong PDF:

```text
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/auth/me
```

Checklist test:

- Dang ky tai khoan `STREAMER`.
- Dang nhap thanh cong.
- Reload trang van lay lai duoc user bang token.
- Dang xuat xoa token.

## 6. Buoc 3 - Home page

Home page can co 2 khu vuc:

- `Live now`: danh sach stream dang live tu `GET /streams/live`.
- `VOD`: danh sach video tu `GET /videos`.

Moi live card nen co:

- Thumbnail neu co.
- Ten live, streamer username.
- Badge `LIVE`.
- Viewer count.
- Link den `/live/{username}`.

Moi VOD card nen co:

- Thumbnail neu co.
- Title, duration, createdAt.
- Streamer.
- Link den `/videos/{id}`.

Trang thai can co:

- Loading skeleton.
- Empty state: chua co stream dang live.
- Error state: khong ket noi duoc backend.

## 7. Buoc 4 - HLS player cho live va VOD

Theo PDF, player phai phat HLS bang `VideoJS/HLS.js`.

Repo da co player HLS kha tot:

```text
src/components/stream-player/vod-player.tsx
```

File nay da dung:

- `hls.js`
- `.m3u8`
- quality levels
- Auto quality
- Play/pause/volume/fullscreen

Ban co the tach thanh component chung:

```text
src/components/hls-player.tsx
```

Hoac dung lai `VodPlayer` cho ca live va VOD neu can demo nhanh.

Nguon HLS se co dang:

```text
Live: http://IP_VPS/hls/{streamKey}.m3u8
VOD:  http://IP_VPS/vod-hls/sample/index.m3u8
```

Luu y khi test:

- Neu web chay `http://localhost:3000`, HLS URL cung nen la `http://...`, tranh loi mixed content.
- Nginx can bat CORS cho `.m3u8` va `.ts`.
- Neu player khong load, mo DevTools > Network de xem `.m3u8` va `.ts` co 200 khong.

## 8. Buoc 5 - Live page `/live/:username`

Page nay la man hinh demo quan trong nhat cua ban.

Can hien thi:

- HLS player o tren.
- Ten stream, title, description.
- Streamer username/avatar.
- Trang thai `LIVE` hoac `OFFLINE`.
- Viewer count neu API co.
- Chat panel ben phai hoac ben duoi tren mobile.

API:

```text
GET /api/v1/streams/:username
GET /api/v1/streams/:streamId/chat
WebSocket join_stream, send_message, new_message
```

Logic:

1. Lay stream detail theo username.
2. Neu `status = LIVE` va co `hlsUrl`, render HLS player.
3. Neu offline, hien offline state, khong de player bao loi tho.
4. Lay chat history.
5. Ket noi WebSocket va join room theo `streamId`.

## 9. Buoc 6 - Chat UI

Chat UI toi thieu:

- List message.
- Input message.
- Nut send.
- Disable input neu chua dang nhap.
- Khi gui thanh cong, message hien len ngay.

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
    "message": "Hello moi nguoi"
  }
}
```

```json
{
  "event": "new_message",
  "data": {
    "id": 12,
    "streamId": 10,
    "message": "Hello moi nguoi",
    "createdAt": "2026-05-20T22:56:00Z",
    "user": {
      "id": 2,
      "username": "viewer01",
      "role": "VIEWER"
    }
  }
}
```

Neu backend chua co WebSocket, ban lam UI + mock message truoc, roi ghi ro trong bao cao: "chat UI da san sang, realtime phu thuoc backend".

## 10. Buoc 7 - Dashboard streamer

Dashboard la noi streamer lay thong tin de nhap vao OBS.

Can hien thi:

- RTMP Server: `rtmp://IP_VPS:1935/live`
- Stream Key: vi du `mh_9x8a2k`
- HLS URL: `http://IP_VPS/hls/mh_9x8a2k.m3u8`
- Status: `OFFLINE` hoac `LIVE`
- Nut copy tung truong.
- Nut regenerate stream key.
- Form update title/description.

API:

```text
GET  /api/v1/stream-key
POST /api/v1/stream-key/regenerate
PUT  /api/v1/streams/me
```

Checklist test:

- Copy RTMP URL duoc.
- Copy stream key duoc.
- Regenerate xong UI cap nhat key moi.
- Update title/description xong home/live page hien title moi.

## 11. Buoc 8 - VOD list/detail

Ban khong can convert video. Nguoi 4 se tao VOD HLS va them data qua backend.

Viec cua ban:

- `/videos`: goi `GET /videos`, hien list.
- `/videos/:id`: goi `GET /videos/:id`, dua `video.hlsUrl` vao HLS player.
- Neu VOD la adaptive master playlist, player phai hien Auto/360p/480p/720p neu HLS.js doc duoc levels.

API:

```text
GET /api/v1/videos
GET /api/v1/videos/:id
```

VOD URL mau:

```text
http://IP_VPS/vod-hls/record-001/index.m3u8
```

## 12. Buoc 9 - Guide page `/guide`

Trang guide nen ngan gon, dung cho demo va nguoi dung streamer.

Noi dung can co:

- OBS > Settings > Stream.
- Service: Custom.
- Server: `rtmp://IP_VPS:1935/live`.
- Stream Key: lay trong dashboard.
- Output settings goi y:
  - Resolution: 1280x720.
  - FPS: 30.
  - Video bitrate: 2500 Kbps.
  - Audio bitrate: 128 Kbps.
- Larix:
  - New connection.
  - URL: `rtmp://IP_VPS:1935/live/{streamKey}` hoac theo cach server nhan key.
  - Start broadcast.

Co the hien thong tin stream key neu user da dang nhap.

## 13. Buoc 10 - Loading/error/offline/live state

PDF co checklist rieng cho phan nay, nen dung bo qua.

Can co:

- Loading: skeleton/card shimmer khi dang fetch.
- Error: "Khong ket noi duoc server" + nut retry.
- Offline: player placeholder khi stream offline.
- Live: badge live, viewer count.
- Empty: "Chua co VOD" hoac "Chua co stream dang live".

Day la phan de mat diem neu web chi chay luc du lieu dep.

## 14. Thu tu lam de demo duoc som

Lam theo thu tu nay:

1. Chay duoc project Next.js.
2. Tao API client va mock data neu backend chua xong.
3. Lam home page voi live cards va VOD cards.
4. Lam HLS player phat URL `.m3u8` mau.
5. Lam live page `/live/:username`.
6. Lam login/register va token.
7. Lam dashboard streamer.
8. Lam VOD list/detail.
9. Lam chat UI.
10. Lam guide OBS/Larix.
11. Them loading/error/offline states.
12. Chup anh minh chung va quay demo.

## 15. Test voi HLS that

Hoi nguoi 3/4 hoac nguoi phu trach server cac URL sau:

```text
Live HLS: http://IP_VPS/hls/{streamKey}.m3u8
VOD HLS:  http://IP_VPS/vod-hls/sample/index.m3u8
Adaptive: http://IP_VPS/vod-hls/adaptive/master.m3u8
```

Test nhanh:

1. Mo URL `.m3u8` tren trinh duyet, phai thay noi dung text playlist hoac download file.
2. Mo DevTools > Network khi player chay.
3. Kiem tra `.m3u8` va `.ts` tra ve status `200`.
4. Neu adaptive, trong player phai co Auto/360p/480p/720p.
5. Neu live, cho phep tre 5-20 giay vi HLS co latency.

## 16. Bang viec hang ngay

| Ngay | Viec | Ket qua |
| --- | --- | --- |
| Ngay 1 | Chay project, doc route, tao API client, mock data | Home render duoc live/VOD fake |
| Ngay 2 | Login/register, token, auth state | Dang nhap va goi `/auth/me` duoc |
| Ngay 3 | HLS player + live page | Phat duoc `.m3u8` mau |
| Ngay 4 | Dashboard streamer | Copy RTMP/key, regenerate, update title |
| Ngay 5 | VOD list/detail + guide | Phat VOD HLS, co guide OBS/Larix |
| Ngay 6 | Chat UI + loading/error/offline | UI day du state |
| Ngay 7 | Tich hop server that, chup minh chung | San sang demo |

## 17. Checklist truoc khi nop

- [ ] Home page co live list va VOD list.
- [ ] Login/register goi API duoc.
- [ ] Token duoc luu va gui bang `Authorization: Bearer ...`.
- [ ] Live page phat duoc HLS khi `status = LIVE`.
- [ ] Offline state hien dung khi stream offline.
- [ ] Dashboard hien RTMP URL, stream key, HLS URL.
- [ ] Nut copy hoat dong.
- [ ] Regenerate stream key cap nhat UI.
- [ ] VOD list/detail phat duoc VOD HLS.
- [ ] Chat UI co history va gui message.
- [ ] Guide OBS/Larix co thong tin dung voi server nhom.
- [ ] Co loading/error/empty state.
- [ ] Co anh minh chung cho tung man hinh.

## 18. Phan can phoi hop voi thanh vien khac

Voi Backend:

- Thong nhat `NEXT_PUBLIC_API_BASE_URL`.
- Thong nhat response wrapper `{ success, message, data }`.
- Thong nhat token JWT va role.
- Thong nhat WebSocket URL/event.

Voi Streaming tester:

- Lay stream key dang live de test player.
- Lay anh OBS/Larix neu can dua vao guide.
- Xac nhan latency HLS va status live/offline.

Voi VOD + Adaptive:

- Lay URL VOD HLS.
- Lay URL adaptive master playlist.
- Xac nhan player hien quality selector.

## 19. Cau noi khi demo phan cua ban

Ban co the noi ngan gon:

> Em phu trach frontend. Web cua em goi API backend de hien thi stream/VOD, xu ly dang nhap bang JWT, dashboard streamer de lay RTMP URL va stream key, live page phat HLS bang HLS.js, co chat UI va cac trang thai loading/error/offline. Phan VOD/adaptive do thanh vien khac tao playlist, frontend cua em doc `hlsUrl` va phat tren player, neu la master playlist thi hien quality selector.
