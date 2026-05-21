"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
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
  StateNotice,
  StreamStatusPill,
} from "@/components/state-feedback";
import { getAccessToken } from "@/lib/api-client";
import {
  getStreamChatHistoryRequest,
  getStreamDetailRequest,
} from "@/lib/live-api";
import { mockChatMessages, mockLiveStreams } from "@/lib/mock-data";
import type { ChatConnectionStatus, ChatMessage } from "@/types/chat";
import type { LiveStream } from "@/types/media";

type LivePageStatus = "loading" | "ready" | "mock";

type LivePageState = {
  stream: LiveStream;
  messages: ChatMessage[];
  status: LivePageStatus;
  notice: string | null;
};

type LivePageClientProps = {
  username: string;
};

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

export function LivePageClient({ username }: LivePageClientProps) {
  const [state, setState] = useState<LivePageState | null>(null);

  const requestLivePageData = useCallback(async (): Promise<LivePageState> => {
    try {
      const streamData = await getStreamDetailRequest(username);
      let messages: ChatMessage[] = [];

      try {
        const chatData = await getStreamChatHistoryRequest(streamData.stream.id);
        messages = chatData.messages;
      } catch {
        messages = [];
      }

      return {
        stream: streamData.stream,
        messages,
        status: "ready",
        notice: null,
      };
    } catch (error) {
      const stream =
        mockLiveStreams.find((item) => item.streamer.username === username) ||
        null;

      return {
        stream: stream ?? {
          id: 0,
          title: `Live page của @${username}`,
          description: "Mock offline stream để demo trạng thái offline.",
          status: "OFFLINE",
          hlsUrl: "",
          viewerCount: 0,
          streamer: {
            id: 0,
            username,
          },
        },
        messages: stream ? mockChatMessages : [],
        status: "mock",
        notice:
          error instanceof Error
            ? error.message
            : "Backend chưa sẵn sàng, đang hiển thị live page mẫu",
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

  const isLive = state.stream.status === "LIVE";
  const canPlay = isLive && Boolean(state.stream.hlsUrl);

  return (
    <section className="app-container py-8">
      {state.status === "mock" && (
        <div className="mb-6">
          <StateNotice
            tone="warning"
            title="Đang hiển thị live page mẫu"
            message={`${state.notice}. Khi backend sẵn sàng, trang sẽ dùng dữ liệu thật của streamer.`}
            actionLabel="Thử lại"
            onAction={() => void refreshLivePage()}
          />
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StreamStatusPill isLive={isLive} />
            <span className="badge badge-muted">@{state.stream.streamer.username}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-normal text-slate-950">
            {state.stream.title || `Live của @${username}`}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
            {state.stream.description ||
              "Không có mô tả cho buổi live này."}
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
              src={state.stream.hlsUrl}
              title={state.stream.title}
              poster={state.stream.thumbnailUrl}
              isLive
              muted
            />
          ) : (
            <OfflinePanel stream={state.stream} />
          )}

          <StreamInfo stream={state.stream} />
        </div>

        <LiveChatPanel
          key={`${state.status}-${state.stream.id}`}
          streamId={state.stream.id}
          messages={state.messages}
          isMock={state.status === "mock"}
        />
      </div>

      <Link href="/" className="btn btn-secondary mt-6">
        Quay lại trang chủ
      </Link>
    </section>
  );
}

function OfflinePanel({ stream }: { stream: LiveStream }) {
  return (
    <OfflineState
      username={stream.streamer.username}
      message={`Khi @${stream.streamer.username} bắt đầu live và backend trả hlsUrl, player sẽ hiển thị tại đây.`}
    />
  );
}

function StreamInfo({ stream }: { stream: LiveStream }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <InfoTile
        icon={<UserRound className="size-4" />}
        label="Streamer"
        value={`@${stream.streamer.username}`}
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
          {stream.hlsUrl || "Backend chưa trả hlsUrl"}
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
  streamId,
  messages,
  isMock,
}: {
  streamId: number;
  messages: ChatMessage[];
  isMock: boolean;
}) {
  const { user } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const [draft, setDraft] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(messages);
  const [connectionStatus, setConnectionStatus] =
    useState<ChatConnectionStatus>(isMock || !streamId ? "local" : "connecting");
  const [connectionNotice, setConnectionNotice] = useState<string | null>(
    isMock || !streamId
      ? "Chat đang chạy local trên UI để demo khi backend realtime chưa sẵn sàng."
      : null
  );

  const connectionLabel = useMemo(
    () => getChatConnectionLabel(connectionStatus),
    [connectionStatus]
  );

  useEffect(() => {
    if (isMock || !streamId) {
      return;
    }

    let closedByClient = false;

    const socketUrl = buildChatSocketUrl(streamId);
    let socket: WebSocket;

    try {
      socket = new WebSocket(socketUrl);
    } catch {
      window.setTimeout(() => {
        setConnectionStatus("error");
        setConnectionNotice("Không khởi tạo được WebSocket.");
      }, 0);
      return;
    }

    socketRef.current = socket;

    socket.addEventListener("open", () => {
      if (closedByClient) return;

      setConnectionStatus("connected");
      setConnectionNotice("Đã kết nối WebSocket.");
      socket.send(
        JSON.stringify({
          event: "join_stream",
          data: {
            streamId,
          },
        })
      );
    });

    socket.addEventListener("message", (event) => {
      const nextMessage = parseChatSocketMessage(event.data, streamId);

      if (!nextMessage) return;

      setChatMessages((current) => mergeChatMessage(current, nextMessage));
    });

    socket.addEventListener("close", () => {
      if (closedByClient) return;

      setConnectionStatus("closed");
      setConnectionNotice("WebSocket đã đóng. Lịch sử chat vẫn được giữ lại.");
    });

    socket.addEventListener("error", () => {
      if (closedByClient) return;

      setConnectionStatus("error");
      setConnectionNotice(
        "Không kết nối được WebSocket. Kiểm tra NEXT_PUBLIC_WS_URL và backend realtime."
      );
    });

    return () => {
      closedByClient = true;
      socketRef.current = null;

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    };
  }, [isMock, streamId]);

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = draft.trim();
    if (!message || !user) return;

    const clientId = `${streamId}-${user.id}-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      streamId,
      message,
      clientId,
      createdAt: new Date().toISOString(),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
    const socket = socketRef.current;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          event: "send_message",
          data: {
            streamId,
            message,
            clientId,
          },
        })
      );
    } else if (!isMock) {
      setConnectionNotice(
        "WebSocket chưa sẵn sàng, tin nhắn được thêm local để không đứt demo."
      );
    }

    setChatMessages((current) => mergeChatMessage(current, optimisticMessage));
    setDraft("");
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
          {connectionNotice || "Chat realtime nhận tin nhắn mới qua WebSocket."}
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
              isOwnMessage={message.user.id === user?.id}
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
            {message.user.username}
          </p>
          <p className="text-[11px] font-extrabold uppercase text-slate-400">
            {message.user.role}
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
        text: "Realtime",
        className: "bg-emerald-50 text-emerald-800",
      };
    case "connecting":
      return {
        text: "Connecting",
        className: "bg-slate-100 text-slate-600",
      };
    case "error":
      return {
        text: "WS error",
        className: "bg-red-50 text-red-800",
      };
    case "closed":
      return {
        text: "Closed",
        className: "bg-amber-50 text-amber-800",
      };
    case "local":
    default:
      return {
        text: "Local",
        className: "bg-slate-100 text-slate-600",
      };
  }
}

function buildChatSocketUrl(streamId: number) {
  const token = getAccessToken();

  try {
    const url = new URL(WS_BASE_URL);
    url.searchParams.set("streamId", String(streamId));

    if (token) {
      url.searchParams.set("token", token);
    }

    return url.toString();
  } catch {
    return WS_BASE_URL;
  }
}

function parseChatSocketMessage(data: unknown, fallbackStreamId: number) {
  if (typeof data !== "string") return null;

  try {
    const parsed = JSON.parse(data) as {
      event?: string;
      type?: string;
      data?: Partial<ChatMessage>;
      payload?: Partial<ChatMessage>;
      message?: string;
      streamId?: number;
      id?: number;
      createdAt?: string;
      user?: ChatMessage["user"];
      clientId?: string;
    };

    const eventName = parsed.event || parsed.type;
    const payload = parsed.data || parsed.payload || parsed;

    if (eventName && eventName !== "new_message" && eventName !== "message") {
      return null;
    }

    if (!payload.message) return null;

    return {
      id: Number(payload.id ?? Date.now()),
      streamId: Number(payload.streamId ?? fallbackStreamId),
      message: String(payload.message),
      clientId: payload.clientId,
      createdAt: payload.createdAt || new Date().toISOString(),
      user: payload.user || {
        id: 0,
        username: "server",
        role: "VIEWER",
      },
    } satisfies ChatMessage;
  } catch {
    return null;
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
