"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
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
import { getObsConfigRequest } from "@/lib/dashboard-api";
import type { ObsConfig } from "@/types/dashboard";

type GuideMode = "loading" | "ready" | "error";

type GuideState = {
  connection: ObsConfig | null;
  mode: GuideMode;
  notice: string | null;
};

const outputSettings = [
  ["Resolution", "1280x720"],
  ["FPS", "30"],
  ["Video bitrate", "2500 Kbps"],
  ["Audio bitrate", "128 Kbps"],
  ["Keyframe interval", "1 second"],
  ["Rate control", "CBR"],
];

export function GuidePageClient() {
  const { user, status } = useAuth();
  const [state, setState] = useState<GuideState | null>(null);

  const requestGuideState = useCallback(async (): Promise<GuideState> => {
    try {
      const response = await getObsConfigRequest(user?.username || "minhhoang");

      return {
        connection: response.data,
        mode: "ready",
        notice: null,
      };
    } catch (error) {
      return {
        connection: null,
        mode: "error",
        notice:
          error instanceof Error
            ? error.message
            : "Không tải được OBS config từ VPS.",
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
    <main className="app-page">
      <SiteHeader subtitle="Guide OBS và Larix" />

      <section className="page-hero">
        <div className="app-container py-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow mb-2 text-emerald-700">Thiết lập stream</p>
              <h1 className="text-3xl font-extrabold tracking-normal text-slate-950 sm:text-4xl">
                Hướng dẫn OBS và Larix
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Cấu hình thiết bị đẩy RTMP lên server, sau đó xem bằng HLS trên
                live page.
              </p>
            </div>

            <button type="button" onClick={() => void refreshGuide()} className="btn btn-secondary">
              <RefreshCw className="size-4" />
              Làm mới
            </button>
          </div>
        </div>
      </section>

      <section className="app-container space-y-6 py-8">
        {isLoading ? (
          <GuideSkeleton />
        ) : state.mode === "error" || !state.connection ? (
          <GuideError message={state.notice} onRetry={() => void refreshGuide()} />
        ) : (
          <GuideContent connection={state.connection} isSignedIn={Boolean(user)} />
        )}
      </section>
    </main>
  );
}

function GuideContent({
  connection,
  isSignedIn,
}: {
  connection: ObsConfig;
  isSignedIn: boolean;
}) {
  const larixUrl = useMemo(
    () => buildLarixUrl(connection.rtmpServer, connection.streamKey),
    [connection.rtmpServer, connection.streamKey]
  );

  return (
    <>
      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-panel rounded-2xl p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="size-5 text-emerald-700" />
              <h2 className="text-lg font-extrabold text-slate-950">
                Thông tin stream
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            <CopyRow label="RTMP Server" value={connection.rtmpServer} />
            <CopyRow label="Stream Key" value={connection.streamKey} />
            <CopyRow label="HLS URL" value={connection.hlsUrl} />
            <CopyRow label="Channel URL" value={connection.channelUrl} />
            <CopyRow label="Larix URL" value={larixUrl} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/dashboard" className="btn btn-ink">
              <Settings className="size-4" />
              Dashboard
            </Link>
            {!isSignedIn && (
              <Link href="/login" className="btn btn-secondary">
                Login
              </Link>
            )}
          </div>
        </div>

        <div className="surface-panel rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <MonitorUp className="size-5 text-red-600" />
            <h2 className="text-lg font-extrabold text-slate-950">OBS Studio</h2>
          </div>

          <StepList
            steps={[
              "Mở OBS > Settings > Stream.",
              "Service: Custom.",
              "Server: paste RTMP Server.",
              "Stream Key: paste Stream Key.",
              "Bấm Start Streaming và đợi status chuyển LIVE.",
            ]}
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="surface-panel rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <Smartphone className="size-5 text-red-600" />
            <h2 className="text-lg font-extrabold text-slate-950">
              Larix Broadcaster
            </h2>
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

        <div className="surface-panel rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <ClipboardCheck className="size-5 text-emerald-700" />
            <h2 className="text-lg font-extrabold text-slate-950">
              Cài đặt đầu ra
            </h2>
          </div>

          <div className="grid gap-2">
            {outputSettings.map(([label, value]) => (
              <div
                key={label}
                className="soft-tile flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <span className="font-bold text-slate-600">{label}</span>
                <span className="text-right font-extrabold text-slate-950">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-panel rounded-2xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <Wrench className="size-5 text-red-600" />
          <h2 className="text-lg font-extrabold text-slate-950">
            Kiểm tra khi demo
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <CheckItem>Mở HLS URL trên browser, file .m3u8 trả về 200.</CheckItem>
          <CheckItem>Trong live page, player load được playlist và segment.</CheckItem>
          <CheckItem>Web HTTP nên dùng HLS HTTP để tránh mixed content.</CheckItem>
          <CheckItem>Nginx bật CORS cho .m3u8 và segment nếu khác domain.</CheckItem>
          <CheckItem>HLS live thường có latency 5-20 giây.</CheckItem>
          <CheckItem>Vào /live/username để chụp minh chứng sau khi stream chạy.</CheckItem>
        </div>
      </section>
    </>
  );
}

function GuideError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="surface-panel rounded-2xl p-8 text-center">
      <AlertCircle className="mx-auto mb-4 size-10 text-red-600" />
      <h2 className="text-lg font-extrabold text-slate-950">
        Không tải được OBS config
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {message || "Vui lòng kiểm tra API /streamers/:username/obs-config."}
      </p>
      <button type="button" onClick={onRetry} className="btn btn-secondary mt-5">
        <RefreshCw className="size-4" />
        Thử lại
      </button>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="soft-tile flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-slate-950">{label}</p>
        <p className="mt-1 break-all font-mono text-sm text-slate-500">
          {value}
        </p>
      </div>
      <CopyButton value={value} />
    </div>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3 text-sm text-slate-600">
      {steps.map((step, index) => (
        <li key={step} className="soft-tile flex gap-3 p-3">
          <span className="flex size-6 flex-none items-center justify-center rounded-full bg-white text-xs font-extrabold text-red-600">
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
    <div className="soft-tile flex items-start gap-3 p-4 text-sm leading-6 text-slate-600">
      <CheckCircle2 className="mt-0.5 size-4 flex-none text-emerald-700" />
      <span>{children}</span>
    </div>
  );
}

function GuideSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="surface-card rounded-2xl p-6">
          <div className="h-6 w-40 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-5 space-y-3">
            <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
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
