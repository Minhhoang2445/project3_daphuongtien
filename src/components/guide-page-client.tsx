"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  MonitorUp,
  RefreshCw,
  Settings,
  Smartphone,
  Wrench,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { CopyButton } from "@/components/copy-button";
import { SiteHeader } from "@/components/site-header";
import { StateNotice } from "@/components/state-feedback";
import { getStreamKeyRequest } from "@/lib/dashboard-api";
import type { StreamConnection } from "@/types/dashboard";

type GuideMode = "loading" | "ready" | "mock" | "guest";

type GuideState = {
  connection: StreamConnection;
  mode: GuideMode;
  notice: string | null;
};

const mockGuideConnection: StreamConnection = {
  rtmpServer: "rtmp://IP_VPS:1935/live",
  streamKey: "mh_9x8a2k",
  hlsUrl: "http://IP_VPS/hls/mh_9x8a2k.m3u8",
  status: "OFFLINE",
};

const outputSettings = [
  ["Resolution", "1280x720"],
  ["FPS", "30"],
  ["Video bitrate", "2500 Kbps"],
  ["Audio bitrate", "128 Kbps"],
  ["Keyframe interval", "2 seconds"],
  ["Rate control", "CBR"],
];

export function GuidePageClient() {
  const { user, status } = useAuth();
  const [state, setState] = useState<GuideState | null>(null);

  const requestGuideState = useCallback(async (): Promise<GuideState> => {
    if (!user) {
      return {
        connection: mockGuideConnection,
        mode: "guest",
        notice:
          "Đang dùng cấu hình mẫu. Đăng nhập tài khoản STREAMER để lấy Stream Key thật từ dashboard.",
      };
    }

    try {
      const connection = await getStreamKeyRequest();

      return {
        connection,
        mode: "ready",
        notice: null,
      };
    } catch (requestError) {
      return {
        connection: mockGuideConnection,
        mode: "mock",
        notice:
          requestError instanceof Error
            ? requestError.message
            : "Backend chưa sẵn sàng, đang hiển thị cấu hình mẫu",
      };
    }
  }, [user]);

  async function refreshGuide() {
    setState(null);
    setState(await requestGuideState());
  }

  useEffect(() => {
    if (status === "loading") return;

    let cancelled = false;

    async function hydrateGuide() {
      const nextState = await requestGuideState();

      if (!cancelled) {
        setState(nextState);
      }
    }

    void hydrateGuide();

    return () => {
      cancelled = true;
    };
  }, [requestGuideState, status]);

  const isLoading = status === "loading" || !state;

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#14171f]">
      <SiteHeader subtitle="Guide OBS và Larix" />

      <section className="border-b border-[#dde1e7] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase text-[#16803c]">
                Hướng dẫn thiết lập stream
              </p>
              <h1 className="text-3xl font-bold tracking-normal">
                Hướng dẫn OBS và Larix
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#596273]">
                Cấu hình thiết bị đẩy RTMP lên server, sau đó frontend xem qua
                HLS URL trên live page.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void refreshGuide()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#ccd3dd] bg-white px-4 text-sm font-semibold text-[#3d4654] hover:bg-[#f6f7f9]"
            >
              <RefreshCw className="size-4" />
              Làm mới
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        {isLoading ? (
          <GuideSkeleton />
        ) : (
          <GuideContent state={state} isSignedIn={Boolean(user)} />
        )}
      </section>
    </main>
  );
}

function GuideContent({
  state,
  isSignedIn,
}: {
  state: GuideState;
  isSignedIn: boolean;
}) {
  const larixUrl = useMemo(
    () => buildLarixUrl(state.connection.rtmpServer, state.connection.streamKey),
    [state.connection.rtmpServer, state.connection.streamKey]
  );

  const showNotice = state.mode === "guest" || state.mode === "mock";

  return (
    <>
      {showNotice && (
        <StateNotice
          tone="warning"
          title={
            state.mode === "guest"
              ? "Đang hiển thị cấu hình mẫu"
              : "Đang hiển thị guide mẫu"
          }
          message={`${state.notice}. Khi backend và token sẵn sàng, trang này sẽ lấy dữ liệu thật từ GET /stream-key.`}
        />
      )}

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="size-5 text-[#16803c]" />
              <h2 className="text-lg font-semibold">Thông tin stream</h2>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                state.connection.status === "LIVE"
                  ? "bg-[#e12828] text-white"
                  : "bg-[#e8ebf0] text-[#596273]"
              }`}
            >
              {state.connection.status}
            </span>
          </div>

          <div className="space-y-3">
            <CopyRow label="RTMP Server" value={state.connection.rtmpServer} />
            <CopyRow label="Stream Key" value={state.connection.streamKey} />
            <CopyRow label="HLS URL" value={state.connection.hlsUrl} />
            <CopyRow label="Larix URL" value={larixUrl} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#14171f] px-4 text-sm font-semibold text-white hover:bg-[#2a303b]"
            >
              <Settings className="size-4" />
              Dashboard
            </Link>
            {!isSignedIn && (
              <Link
                href="/login"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-[#ccd3dd] bg-white px-4 text-sm font-semibold text-[#3d4654] hover:bg-[#f6f7f9]"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <MonitorUp className="size-5 text-[#e12828]" />
            <h2 className="text-lg font-semibold">OBS Studio</h2>
          </div>

          <StepList
            steps={[
              "Mở OBS > Settings > Stream.",
              "Service: Custom.",
              "Server: paste RTMP Server.",
              "Stream Key: paste Stream Key.",
              "Bấm Start Streaming, đợi backend cập nhật status LIVE.",
            ]}
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <Smartphone className="size-5 text-[#e12828]" />
            <h2 className="text-lg font-semibold">Larix Broadcaster</h2>
          </div>

          <StepList
            steps={[
              "Mở Larix > Connections > New connection.",
              "Name: Mini Twitch.",
              `URL: ${larixUrl}.`,
              "Mode: Audio + Video.",
              "Lưu connection và bấm Start broadcast.",
            ]}
          />
        </div>

        <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <ClipboardCheck className="size-5 text-[#16803c]" />
            <h2 className="text-lg font-semibold">Cài đặt đầu ra</h2>
          </div>

          <div className="grid gap-2">
            {outputSettings.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 rounded-md bg-[#f6f7f9] px-3 py-2 text-sm"
              >
                <span className="font-medium text-[#3d4654]">{label}</span>
                <span className="text-right font-semibold text-[#14171f]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#dde1e7] bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <Wrench className="size-5 text-[#e12828]" />
          <h2 className="text-lg font-semibold">Kiểm tra khi demo</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <CheckItem>Mở HLS URL trên browser, `.m3u8` phải trả về 200.</CheckItem>
          <CheckItem>
            Trong live page, player load được playlist và segment `.ts`.
          </CheckItem>
          <CheckItem>
            Nếu chạy web bằng HTTP, HLS URL cũng nên dùng HTTP để tránh mixed
            content.
          </CheckItem>
          <CheckItem>
            Nginx cần bật CORS cho `.m3u8` và `.ts` nếu frontend khác domain.
          </CheckItem>
          <CheckItem>
            HLS live có latency 5-20 giây, nên đợi một chút trước khi kết luận
            stream lỗi.
          </CheckItem>
          <CheckItem>
            Sau khi OBS/Larix đúng, vào `/live/username` để chụp minh chứng.
          </CheckItem>
        </div>
      </section>
    </>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-[#e2e6ec] bg-[#fafbfc] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 break-all font-mono text-sm text-[#596273]">
          {value}
        </p>
      </div>
      <CopyButton value={value} />
    </div>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3 text-sm text-[#596273]">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3 rounded-md bg-[#f6f7f9] p-3">
          <span className="flex size-6 flex-none items-center justify-center rounded-full bg-white text-xs font-bold text-[#e12828]">
            {index + 1}
          </span>
          <span className="pt-0.5 leading-6">{step}</span>
        </li>
      ))}
    </ol>
  );
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-[#f6f7f9] p-4 text-sm leading-6 text-[#3d4654]">
      <CheckCircle2 className="mt-0.5 size-4 flex-none text-[#16803c]" />
      <span>{children}</span>
    </div>
  );
}

function GuideSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-lg border border-[#dde1e7] bg-white p-6"
        >
          <div className="h-6 w-40 animate-pulse rounded bg-[#e5e9ef]" />
          <div className="mt-5 space-y-3">
            <div className="h-14 animate-pulse rounded bg-[#eef1f5]" />
            <div className="h-14 animate-pulse rounded bg-[#eef1f5]" />
            <div className="h-14 animate-pulse rounded bg-[#eef1f5]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function buildLarixUrl(rtmpServer: string, streamKey: string) {
  const cleanServer = rtmpServer.replace(/\/$/, "");
  return `${cleanServer}/${streamKey}`;
}
