"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Radio,
  RefreshCw,
  Save,
  Video,
} from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { LoadingBlock, StateNotice } from "@/components/state-feedback";
import {
  getStreamKeyRequest,
  regenerateStreamKeyRequest,
  updateStreamInfoRequest,
} from "@/lib/dashboard-api";
import {
  STREAMING_DEMO_CONNECTION,
  STREAMING_STAT_URL,
} from "@/lib/streaming-config";
import type { AuthUser } from "@/types/auth";
import type { StreamConnection, StreamInfoInput } from "@/types/dashboard";

type DashboardMode = "loading" | "ready" | "mock";

type DashboardState = {
  connection: StreamConnection;
  mode: DashboardMode;
  notice: string | null;
};

const mockConnection: StreamConnection = {
  ...STREAMING_DEMO_CONNECTION,
};

export function DashboardStreamerPanel({ user }: { user: AuthUser }) {
  const [state, setState] = useState<DashboardState | null>(null);
  const [title, setTitle] = useState("Demo livestream hệ thống Mini Twitch");
  const [description, setDescription] = useState(
    "Buổi demo OBS stream lên VPS Nginx RTMP"
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestDashboard = useCallback(async (): Promise<DashboardState> => {
    try {
      const connection = await getStreamKeyRequest();

      return {
        connection,
        mode: "ready",
        notice: null,
      };
    } catch (requestError) {
      return {
        connection: mockConnection,
        mode: "mock",
        notice:
          requestError instanceof Error
            ? requestError.message
            : "Backend chưa sẵn sàng, đang hiển thị cấu hình VPS demo",
      };
    }
  }, []);

  async function refreshDashboard() {
    setState(null);
    setMessage(null);
    setError(null);
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

  async function handleRegenerate() {
    setIsRegenerating(true);
    setMessage(null);
    setError(null);

    try {
      const connection = await regenerateStreamKeyRequest();
      setState({
        connection,
        mode: "ready",
        notice: "Stream Key đã được regenerate từ backend.",
      });
      setMessage("Đã tạo Stream Key mới.");
    } catch (requestError) {
      setState({
        connection: mockConnection,
        mode: "mock",
        notice:
          requestError instanceof Error
            ? requestError.message
            : "Regenerate API chưa sẵn sàng, đang giữ Stream Key VPS demo",
      });
      setMessage("Backend chưa sẵn sàng, VPS demo dùng Stream Key cố định stream.");
    } finally {
      setIsRegenerating(false);
    }
  }

  async function handleSaveInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input: StreamInfoInput = {
      title: title.trim(),
      description: description.trim(),
    };

    if (!input.title) {
      setError("Title không được để trống.");
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      await updateStreamInfoRequest(input);
      setMessage("Đã cập nhật title/description trên backend.");
    } catch (requestError) {
      setMessage(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không cập nhật được stream info"
      );
    } finally {
      setIsSaving(false);
    }
  }

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
              Vai trò hiện tại: <span className="font-extrabold">{user.role}</span>
            </p>
          </div>

          <button type="button" onClick={() => void refreshDashboard()} className="btn btn-secondary">
            <RefreshCw className="size-4" />
            Làm mới
          </button>
        </div>

        {state.mode === "mock" && (
          <div className="mt-5">
            <StateNotice
              tone="warning"
              title="Đang hiển thị dashboard mẫu"
              message={`${state.notice}. Khi backend chạy, dashboard sẽ dùng dữ liệu thật.`}
            />
          </div>
        )}
      </div>

      {(message || error) && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          {error ? (
            <AlertCircle className="mt-0.5 size-4 flex-none" />
          ) : (
            <CheckCircle2 className="mt-0.5 size-4 flex-none" />
          )}
          <p>{error || message}</p>
        </div>
      )}

      <section className="surface-panel rounded-2xl p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <KeyRound className="size-5 text-red-600" />
            <h2 className="text-lg font-extrabold text-slate-950">
              Thông tin kết nối
            </h2>
          </div>

          <button
            type="button"
            onClick={() => void handleRegenerate()}
            disabled={isRegenerating}
            className="btn btn-ink disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isRegenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Regenerate key
          </button>
        </div>

        <div className="grid gap-3">
          <CredentialRow label="RTMP Server" value={state.connection.rtmpServer} />
          <CredentialRow label="Stream Key" value={state.connection.streamKey} />
          <CredentialRow label="HLS URL" value={state.connection.hlsUrl} />
          <CredentialRow label="Statistics" value={STREAMING_STAT_URL} />
          <div className="soft-tile p-4">
            <p className="text-sm font-extrabold text-slate-950">Trạng thái</p>
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${
                state.connection.status === "LIVE"
                  ? "bg-red-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {state.connection.status}
            </span>
          </div>
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

        <form onSubmit={handleSaveInfo} className="surface-panel rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <Radio className="size-5 text-red-600" />
            <h2 className="text-lg font-extrabold text-slate-950">Stream info</h2>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="field mt-2"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                className="field mt-2 min-h-32 resize-none py-2"
              />
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Lưu stream info
            </button>
          </div>
        </form>
      </section>
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
