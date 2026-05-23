"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  Eye,
  MessageSquareText,
  RefreshCw,
  Send,
  UserRound,
} from "lucide-react";

import { HlsPlayer } from "@/components/hls-player";
import { useAuth } from "@/components/auth-provider";
import {
  OfflineState,
  StreamStatusPill,
} from "@/components/state-feedback";
import {
  getStreamChatHistoryRequest,
  getStreamerDetailRequest,
  sendStreamChatMessageRequest,
} from "@/lib/live-api";
import type { ChatConnectionStatus, ChatMessage } from "@/types/chat";
import type { LiveStream } from "@/types/media";

type LivePageStatus = "loading" | "ready" | "error";

type LivePageState = {
  stream: LiveStream | null;
  messages: ChatMessage[];
  status: LivePageStatus;
  notice: string | null;
  chatNotice: string | null;
};

type LivePageClientProps = {
  username: string;
};

export function LivePageClient({ username }: LivePageClientProps) {
  const [state, setState] = useState<LivePageState | null>(null);

  const requestLivePageData = useCallback(async (): Promise<LivePageState> => {
    try {
      const streamResponse = await getStreamerDetailRequest(username);
      let messages: ChatMessage[] = [];
      let chatNotice: string | null = null;

      try {
        const chatResponse = await getStreamChatHistoryRequest(username);
        messages = chatResponse.data.messages;
      } catch (error) {
        chatNotice =
          error instanceof Error
            ? error.message
            : "Không tải được lịch sử chat.";
      }

      return {
        stream: streamResponse.data.streamer,
        messages,
        status: "ready",
        notice: null,
        chatNotice,
      };
    } catch (error) {
      return {
        stream: null,
        messages: [],
        status: "error",
        notice:
          error instanceof Error
            ? error.message
            : "Không tải được thông tin streamer từ VPS.",
        chatNotice: null,
      };
    }
  }, [username]);

  async function refreshLivePage() {
    setState(null);
    setState(await requestLivePageData());
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateLivePage() {
      const nextState = await requestLivePageData();

      if (!cancelled) {
        setState(nextState);
      }
    }

    void hydrateLivePage();

    return () => {
      cancelled = true;
    };
  }, [requestLivePageData]);

  if (!state) {
    return <LivePageSkeleton />;
  }

  if (state.status === "error" || !state.stream) {
    return (
      <section className="app-container py-8">
        <LivePageError
          message={state.notice}
          onRetry={() => void refreshLivePage()}
        />
      </section>
    );
  }

  const isLive = state.stream.status === "LIVE";
  const canPlay = isLive && Boolean(state.stream.hlsUrl);

  return (
    <section className="app-container py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StreamStatusPill isLive={isLive} />
            <span className="badge badge-muted">@{state.stream.username}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-normal text-slate-950">
            {state.stream.title || `Live của @${username}`}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
            {isLive
              ? "Streamer đang LIVE. Player dùng HLS URL thật từ backend."
              : "Streamer hiện đang offline."}
          </p>
        </div>

        <button type="button" onClick={() => void refreshLivePage()} className="btn btn-secondary">
          <RefreshCw className="size-4" />
          Làm mới
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
        <div className="min-w-0 space-y-4">
          {canPlay ? (
            <HlsPlayer
              src={state.stream.hlsUrl || ""}
              title={state.stream.title || `Live của @${state.stream.username}`}
              isLive
              muted
            />
          ) : (
            <OfflinePanel stream={state.stream} />
          )}

          <StreamInfo stream={state.stream} />
        </div>

        <LiveChatPanel
          key={`${state.stream.username}-${state.messages.length}`}
          streamUsername={state.stream.username}
          messages={state.messages}
          initialNotice={state.chatNotice}
        />
      </div>

      <Link href="/" className="btn btn-secondary mt-6">
        Quay lại trang chủ
      </Link>
    </section>
  );
}

function LivePageError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="surface-panel rounded-2xl p-8 text-center">
      <AlertCircle className="mx-auto mb-4 size-10 text-red-600" />
      <h1 className="text-lg font-extrabold text-slate-950">
        Không tải được live page
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {message || "Vui lòng kiểm tra API streamer trên VPS và thử lại."}
      </p>
      <button type="button" onClick={onRetry} className="btn btn-secondary mt-5">
        <RefreshCw className="size-4" />
        Thử lại
      </button>
    </div>
  );
}

function OfflinePanel({ stream }: { stream: LiveStream }) {
  return (
    <OfflineState
      username={stream.username}
      message={`@${stream.username} đang offline. Frontend sẽ không dùng HLS giả khi backend trả OFFLINE hoặc hlsUrl null.`}
    />
  );
}

function StreamInfo({ stream }: { stream: LiveStream }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <InfoTile
        icon={<UserRound className="size-4" />}
        label="Streamer"
        value={`@${stream.username}`}
      />
      <InfoTile
        icon={<Eye className="size-4" />}
        label="Viewers"
        value={`${stream.viewerCount ?? 0}`}
      />
      <InfoTile
        icon={<CalendarDays className="size-4" />}
        label="Started"
        value={formatDate(stream.startedAt) ?? "Chưa có ngày"}
      />
      <div className="surface-card rounded-xl p-4 md:col-span-3">
        <p className="text-sm font-extrabold text-slate-950">HLS URL</p>
        <p className="mt-2 break-all font-mono text-xs leading-5 text-slate-500">
          {stream.hlsUrl || "Backend trả hlsUrl null vì streamer đang OFFLINE"}
        </p>
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="surface-card rounded-xl p-4">
      <p className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm text-slate-500">{value}</p>
    </div>
  );
}

function LiveChatPanel({
  streamUsername,
  messages,
  initialNotice,
}: {
  streamUsername: string;
  messages: ChatMessage[];
  initialNotice: string | null;
}) {
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(messages);
  const [connectionStatus, setConnectionStatus] = useState<ChatConnectionStatus>(
    initialNotice ? "error" : "connected"
  );
  const [connectionNotice, setConnectionNotice] = useState<string | null>(
    initialNotice
  );

  const connectionLabel = useMemo(
    () => getChatConnectionLabel(connectionStatus),
    [connectionStatus]
  );

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = draft.trim();
    if (!message || !user) return;

    const clientId = `${streamUsername}-${user.id}-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      viewerId: user.id,
      username: user.username,
      message,
      clientId,
      createdAt: new Date().toISOString(),
    };

    setChatMessages((current) => mergeChatMessage(current, optimisticMessage));
    setDraft("");

    try {
      const response = await sendStreamChatMessageRequest(streamUsername, {
        viewerId: user.id,
        message,
      });

      setConnectionStatus("connected");
      setConnectionNotice(null);
      setChatMessages((current) =>
        mergeChatMessage(current, {
          ...response.data.message,
          clientId,
        })
      );
    } catch (error) {
      setConnectionStatus("error");
      setConnectionNotice(
        error instanceof Error ? error.message : "Không gửi được tin nhắn."
      );
    }
  }

  return (
    <aside className="surface-panel flex min-h-[520px] flex-col overflow-hidden rounded-2xl">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-5 text-red-600" />
            <h2 className="font-extrabold text-slate-950">Live chat</h2>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-extrabold ${connectionLabel.className}`}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {connectionLabel.text}
          </span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {connectionNotice || "Chat lấy và gửi tin nhắn qua REST API thật."}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {chatMessages.length === 0 ? (
          <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-500">
            Chưa có tin nhắn nào.
          </p>
        ) : (
          chatMessages.map((message) => (
            <ChatBubble
              key={`${message.id}-${message.clientId || "server"}`}
              message={message}
              isOwnMessage={message.viewerId === user?.id}
            />
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="border-t border-slate-200 p-4">
        {!user && (
          <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            Đăng nhập để gửi message vào chat.
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!user}
            placeholder={user ? "Nhập tin nhắn..." : "Cần đăng nhập"}
            className="field min-w-0 flex-1"
          />
          <button
            type="submit"
            disabled={!user || !draft.trim()}
            title="Send message"
            className="btn btn-primary min-h-11 px-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}

function ChatBubble({
  message,
  isOwnMessage,
}: {
  message: ChatMessage;
  isOwnMessage: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 ${
        isOwnMessage ? "bg-red-50" : "bg-slate-100"
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-slate-950">
            {message.username}
          </p>
        </div>
        <span className="flex-none text-xs font-medium text-slate-400">
          {formatTime(message.createdAt)}
        </span>
      </div>
      <p className="break-words text-sm leading-6 text-slate-700">
        {message.message}
      </p>
    </div>
  );
}

function getChatConnectionLabel(status: ChatConnectionStatus) {
  switch (status) {
    case "connected":
      return {
        text: "REST",
        className: "bg-emerald-50 text-emerald-800",
      };
    case "error":
      return {
        text: "Error",
        className: "bg-red-50 text-red-800",
      };
    case "connecting":
      return {
        text: "Connecting",
        className: "bg-slate-100 text-slate-600",
      };
    case "closed":
      return {
        text: "Closed",
        className: "bg-amber-50 text-amber-800",
      };
    case "local":
    default:
      return {
        text: "REST",
        className: "bg-slate-100 text-slate-600",
      };
  }
}

function mergeChatMessage(current: ChatMessage[], nextMessage: ChatMessage) {
  const withoutDuplicate = current.filter((message) => {
    if (nextMessage.clientId && message.clientId === nextMessage.clientId) {
      return false;
    }

    return message.id !== nextMessage.id;
  });

  return [...withoutDuplicate, nextMessage].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );
}

function LivePageSkeleton() {
  return (
    <section className="app-container py-8">
      <div className="mb-6 h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <div className="aspect-video animate-pulse rounded-2xl bg-slate-900" />
          <div className="grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        </div>
        <div className="h-[520px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </section>
  );
}

function formatDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
