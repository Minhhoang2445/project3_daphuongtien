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
import { sampleHlsUrl } from "@/lib/mock-data";
import type { AuthUser } from "@/types/auth";
import type { StreamConnection, StreamInfoInput } from "@/types/dashboard";

type DashboardMode = "loading" | "ready" | "mock";

type DashboardState = {
  connection: StreamConnection;
  mode: DashboardMode;
  notice: string | null;
};

const mockConnection: StreamConnection = {
  rtmpServer: "rtmp://IP_VPS:1935/live",
  streamKey: "mh_9x8a2k",
  hlsUrl: sampleHlsUrl,
  status: "OFFLINE",
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
            : "Backend chưa sẵn sàng, đang hiển thị Stream Key mẫu",
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
      const suffix = Math.random().toString(36).slice(2, 8);
      const nextKey = `${user.username}_${suffix}`;
      setState({
        connection: {
          ...mockConnection,
          streamKey: nextKey,
          hlsUrl: `${sampleHlsUrl}?key=${nextKey}`,
        },
        mode: "mock",
        notice:
          requestError instanceof Error
            ? requestError.message
            : "Regenerate API chưa sẵn sàng, đang tạo mock key",
      });
      setMessage("Backend chưa sẵn sàng, đã tạo Stream Key mẫu trên UI.");
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
      <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#16803c]">
              Streamer dashboard
            </p>
            <h1 className="text-2xl font-bold">Xin chào, {user.username}</h1>
            <p className="mt-2 text-sm text-[#596273]">
              Vai trò hiện tại: <span className="font-semibold">{user.role}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshDashboard()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#ccd3dd] bg-white px-4 text-sm font-semibold text-[#3d4654] hover:bg-[#f6f7f9]"
          >
            <RefreshCw className="size-4" />
            Làm mới
          </button>
        </div>

        {state.mode === "mock" && (
          <div className="mt-5">
            <StateNotice
              tone="warning"
              title="Đang hiển thị dashboard mẫu"
              message={`${state.notice}. Khi backend chạy, dashboard sẽ dùng dữ liệu thật từ GET /stream-key.`}
            />
          </div>
        )}
      </div>

      {(message || error) && (
        <div
          className={`flex items-start gap-3 rounded-md border p-4 text-sm ${
            error
              ? "border-[#f1b4b4] bg-[#fff4f4] text-[#9b1c1c]"
              : "border-[#b7dfc4] bg-[#f1fbf4] text-[#17653a]"
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

      <section className="rounded-lg border border-[#dde1e7] bg-white p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <KeyRound className="size-5 text-[#e12828]" />
            <h2 className="text-lg font-semibold">Thông tin streamer</h2>
          </div>

          <button
            type="button"
            onClick={() => void handleRegenerate()}
            disabled={isRegenerating}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#14171f] px-4 text-sm font-semibold text-white hover:bg-[#2a303b] disabled:cursor-not-allowed disabled:opacity-70"
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
          <div className="rounded-md border border-[#e2e6ec] bg-[#fafbfc] p-4">
            <p className="text-sm font-semibold">Trạng thái</p>
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                state.connection.status === "LIVE"
                  ? "bg-[#e12828] text-white"
                  : "bg-[#e8ebf0] text-[#596273]"
              }`}
            >
              {state.connection.status}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <Video className="size-5 text-[#e12828]" />
            <h2 className="text-lg font-semibold">Cấu hình OBS</h2>
          </div>

          <ol className="space-y-3 text-sm text-[#596273]">
            <li className="rounded-md bg-[#f6f7f9] p-3">
              OBS &gt; Settings &gt; Stream &gt; Service: Custom.
            </li>
            <li className="rounded-md bg-[#f6f7f9] p-3">
              Server: sao chép RTMP Server bên trên.
            </li>
            <li className="rounded-md bg-[#f6f7f9] p-3">
              Stream Key: sao chép Stream Key bên trên.
            </li>
            <li className="rounded-md bg-[#f6f7f9] p-3">
              Bấm Start Streaming, sau đó mở live page để xem HLS.
            </li>
          </ol>
        </div>

        <form
          onSubmit={handleSaveInfo}
          className="rounded-lg border border-[#dde1e7] bg-white p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <Radio className="size-5 text-[#e12828]" />
            <h2 className="text-lg font-semibold">Stream info</h2>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-[#2f3745]">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-[#ccd3dd] bg-white px-3 text-sm outline-none transition focus:border-[#e12828] focus:ring-2 focus:ring-[#e12828]/15"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#2f3745]">
                Description
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                className="mt-2 w-full resize-none rounded-md border border-[#ccd3dd] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#e12828] focus:ring-2 focus:ring-[#e12828]/15"
              />
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#e12828] px-4 text-sm font-semibold text-white hover:bg-[#bf2222] disabled:cursor-not-allowed disabled:opacity-70"
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
