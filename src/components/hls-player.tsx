"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Hls from "hls.js";
import { AlertCircle, Loader2, Radio, Settings, Video } from "lucide-react";

type HlsPlayerProps = {
  src: string;
  title: string;
  poster?: string | null;
  autoPlay?: boolean;
  muted?: boolean;
  isLive?: boolean;
};

type PlayerStatus = "loading" | "ready" | "error";

type QualityLevel = {
  index: number;
  height: number;
  bitrate: number;
};

export function HlsPlayer(props: HlsPlayerProps) {
  if (!props.src) {
    return (
      <PlayerFrame>
        <div className="flex h-full flex-col items-center justify-center px-5 text-center text-white">
          <Video className="mb-3 size-10 text-white/70" />
          <p className="font-extrabold">Chưa có HLS URL</p>
          <p className="mt-1 text-sm text-white/70">
            Backend cần trả về trường hlsUrl.
          </p>
        </div>
      </PlayerFrame>
    );
  }

  return <HlsPlayerInner key={props.src} {...props} />;
}

function HlsPlayerInner({
  src,
  title,
  poster,
  autoPlay = false,
  muted = false,
  isLive = false,
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState("-1");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function markReady() {
      setStatus("ready");
      setError(null);

      if (autoPlay) {
        void video?.play().catch(() => {
          // Browser autoplay policy can block playback; native controls remain usable.
        });
      }
    }

    function markError(message: string) {
      setStatus("error");
      setError(message);
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: isLive,
        backBufferLength: isLive ? 30 : 90,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setQualityLevels(
          data.levels.map((level, index) => ({
            index,
            height: level.height || 0,
            bitrate: level.bitrate || 0,
          }))
        );
        markReady();
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setSelectedQuality(String(data.level));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          markError("Không tải được HLS playlist hoặc segment.");
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          markError("Lỗi media HLS, đang thử khôi phục.");
          hls.recoverMediaError();
          return;
        }

        markError("Không phát được HLS URL này.");
        hls.destroy();
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", markReady);
      video.addEventListener("error", () =>
        markError("Trình duyệt không phát được HLS URL này.")
      );

      return () => {
        video.removeEventListener("loadedmetadata", markReady);
      };
    }

    markError("Trình duyệt không hỗ trợ HLS.");
  }, [autoPlay, isLive, src]);

  function handleQualityChange(value: string) {
    setSelectedQuality(value);

    if (!hlsRef.current) return;

    const level = Number(value);
    hlsRef.current.currentLevel = level;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-900 bg-slate-950 shadow-xl shadow-slate-950/10">
      <PlayerFrame>
        <video
          ref={videoRef}
          poster={poster || undefined}
          controls
          muted={muted}
          playsInline
          className="h-full w-full bg-black object-contain"
        />

        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
            <Loader2 className="mb-3 size-9 animate-spin" />
            <p className="font-extrabold">Đang tải HLS...</p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-5 text-center text-white">
            <AlertCircle className="mb-3 size-10 text-red-300" />
            <p className="font-extrabold">{error}</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/70">
              Kiểm tra URL .m3u8, CORS của Nginx và các file segment trong
              Network.
            </p>
          </div>
        )}
      </PlayerFrame>

      <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-950 p-4 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="badge badge-live">
                <span className="size-1.5 rounded-full bg-white" />
                LIVE
              </span>
            ) : (
              <span className="badge bg-white/10 text-white">
                <Radio className="size-3.5" />
                HLS
              </span>
            )}
            <p className="truncate text-sm font-extrabold">{title}</p>
          </div>
          <p className="mt-1 truncate font-mono text-xs text-white/50">{src}</p>
        </div>

        {qualityLevels.length > 1 && (
          <label className="flex items-center gap-2 text-sm">
            <Settings className="size-4 text-white/70" />
            <span className="text-white/70">Chất lượng</span>
            <select
              value={selectedQuality}
              onChange={(event) => handleQualityChange(event.target.value)}
              className="h-9 rounded-lg border border-white/15 bg-slate-900 px-2 text-sm text-white outline-none"
            >
              <option value="-1">Auto</option>
              {qualityLevels.map((level) => (
                <option key={level.index} value={level.index}>
                  {level.height ? `${level.height}p` : `Level ${level.index + 1}`}
                  {level.bitrate
                    ? ` - ${Math.round(level.bitrate / 1000)} kbps`
                    : ""}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}

function PlayerFrame({ children }: { children: ReactNode }) {
  return <div className="relative aspect-video overflow-hidden bg-black">{children}</div>;
}
