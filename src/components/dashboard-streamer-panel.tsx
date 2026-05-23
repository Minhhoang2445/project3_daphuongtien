"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, KeyRound, Radio, RefreshCw, Video } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { LoadingBlock } from "@/components/state-feedback";
import { getObsConfigRequest } from "@/lib/dashboard-api";
import type { AuthUser } from "@/types/auth";
import type { ObsConfig } from "@/types/dashboard";

type DashboardMode = "loading" | "ready" | "error";

type DashboardState = {
  connection: ObsConfig | null;
  mode: DashboardMode;
  notice: string | null;
};

export function DashboardStreamerPanel({ user }: { user: AuthUser }) {
  const [state, setState] = useState<DashboardState | null>(null);

  const requestDashboard = useCallback(async (): Promise<DashboardState> => {
    try {
      const response = await getObsConfigRequest(user.username || "minhhoang");

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
  }, [user.username]);

  async function refreshDashboard() {
    setState(null);
    setState(await requestDashboard());
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateDashboard() {
      const nextState = await requestDashboard();

      if (!cancelled) {
        setState(nextState);
      }
    }

    void hydrateDashboard();

    return () => {
      cancelled = true;
    };
  }, [requestDashboard]);

  if (!state) {
    return <LoadingBlock label="Đang tải dashboard streamer..." />;
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel rounded-2xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-extrabold uppercase text-emerald-700">
              Streamer dashboard
            </p>
            <h1 className="text-2xl font-extrabold text-slate-950">
              Xin chào, {user.username}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Đang lấy OBS config thật theo username từ backend VPS.
            </p>
          </div>

          <button type="button" onClick={() => void refreshDashboard()} className="btn btn-secondary">
            <RefreshCw className="size-4" />
            Làm mới
          </button>
        </div>
      </div>

      {state.mode === "error" || !state.connection ? (
        <DashboardError message={state.notice} onRetry={() => void refreshDashboard()} />
      ) : (
        <>
          <section className="surface-panel rounded-2xl p-6">
            <div className="mb-5 flex items-center gap-3">
              <KeyRound className="size-5 text-red-600" />
              <h2 className="text-lg font-extrabold text-slate-950">
                Thông tin kết nối
              </h2>
            </div>

            <div className="grid gap-3">
              <CredentialRow label="RTMP Server" value={state.connection.rtmpServer} />
              <CredentialRow label="Stream Key" value={state.connection.streamKey} />
              <CredentialRow label="HLS URL" value={state.connection.hlsUrl} />
              <CredentialRow label="Channel URL" value={state.connection.channelUrl} />
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="surface-panel rounded-2xl p-6">
              <div className="mb-5 flex items-center gap-3">
                <Video className="size-5 text-red-600" />
                <h2 className="text-lg font-extrabold text-slate-950">
                  Cấu hình OBS
                </h2>
              </div>

              <ol className="space-y-3 text-sm text-slate-600">
                <li className="soft-tile p-3">OBS &gt; Settings &gt; Stream &gt; Service: Custom.</li>
                <li className="soft-tile p-3">Server: sao chép RTMP Server bên trên.</li>
                <li className="soft-tile p-3">Stream Key: sao chép Stream Key bên trên.</li>
                <li className="soft-tile p-3">Bấm Start Streaming, sau đó mở live page để xem HLS.</li>
              </ol>
            </div>

            <div className="surface-panel rounded-2xl p-6">
              <div className="mb-5 flex items-center gap-3">
                <Radio className="size-5 text-red-600" />
                <h2 className="text-lg font-extrabold text-slate-950">
                  Backend tối giản
                </h2>
              </div>

              <p className="text-sm leading-6 text-slate-500">
                Backend hiện không có route regenerate stream key hoặc cập nhật
                stream info, nên frontend chỉ lấy OBS/Larix config theo tài liệu.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function DashboardError({
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
        {message || "Vui lòng kiểm tra route /streamers/:username/obs-config."}
      </p>
      <button type="button" onClick={onRetry} className="btn btn-secondary mt-5">
        <RefreshCw className="size-4" />
        Thử lại
      </button>
    </div>
  );
}

function CredentialRow({ label, value }: { label: string; value: string }) {
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
