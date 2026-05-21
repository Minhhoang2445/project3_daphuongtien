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
  Radio,
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
import {
  mockChatMessages,
  mockLiveStreams,
} from "@/lib/mock-data";
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
          description: "Mock offline stream để demo offline state.",
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
            : "Backend chưa sẵn sàng, đang hiển thị mock live page",
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
    <section className="mx-auto max-w-6xl px-5 py-8">
      {state.status === "mock" && (
        <div className="mb-6">
          <StateNotice
            tone="warning"
            title="Đang hiển thị mock live page"
            message={`${state.notice}. Khi backend chạy, page này sẽ dùng dữ liệu thật từ GET /streams/:username.`}
            actionLabel="Thử lại stream"
            onAction={() => void refreshLivePage()}
          />
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge isLive={isLive} />
            <span className="rounded-full bg-[#eef1f5] px-2.5 py-1 text-xs font-semibold text-[#596273]">
              @{state.stream.streamer.username}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-normal">
            {state.stream.title || `Live của @${username}`}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#596273]">
            {state.stream.description ||
              "Trang live lấy stream detail, phát HLS và hiển thị chat panel."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refreshLivePage()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#ccd3dd] bg-white px-4 text-sm font-semibold text-[#3d4654] hover:bg-[#f6f7f9]"
        >
          <Radio className="size-4" />
          Làm mới stream
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="space-y-4">
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

      <Link
        href="/"
        className="mt-6 inline-block rounded-md border border-[#dde1e7] bg-white px-4 py-2 text-sm font-semibold text-[#4c5666] hover:bg-[#f6f7f9]"
      >
        Quay lại home
      </Link>
    </section>
  );
}

function StatusBadge({ isLive }: { isLive: boolean }) {
  return <StreamStatusPill isLive={isLive} />;
}

function OfflinePanel({ stream }: { stream: LiveStream }) {
  return (
    <OfflineState
      username={stream.streamer.username}
      message={`Khi backend trả status LIVE và có hlsUrl, HLS player sẽ tự hiện tại đây cho @${stream.streamer.username}.`}
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
      <div className="rounded-md border border-[#dde1e7] bg-white p-4 md:col-span-3">
        <p className="text-sm font-semibold text-[#14171f]">HLS URL</p>
        <p className="mt-2 break-all font-mono text-xs leading-5 text-[#596273]">
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
    <div className="rounded-md border border-[#dde1e7] bg-white p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-[#14171f]">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm text-[#596273]">{value}</p>
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
      ? "Backend đang là mock nên chat chạy local trên UI. Khi có backend thật, WebSocket sẽ join room theo streamId."
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
      setConnectionNotice("Đã kết nối WebSocket và join stream room.");
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
      setConnectionNotice(
        "WebSocket đã đóng. Chat vẫn giữ history và có thể gửi local nếu cần demo."
      );
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
    <aside className="flex min-h-[520px] flex-col rounded-lg border border-[#dde1e7] bg-white">
      <div className="border-b border-[#dde1e7] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-5 text-[#e12828]" />
            <h2 className="font-semibold">Live chat</h2>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${connectionLabel.className}`}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {connectionLabel.text}
          </span>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#697282]">
          {connectionNotice ||
            "Chat history lấy từ backend, realtime nhận `new_message` qua WebSocket."}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {chatMessages.length === 0 ? (
          <p className="rounded-md bg-[#f6f7f9] p-3 text-sm text-[#596273]">
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

      <form onSubmit={handleSend} className="border-t border-[#dde1e7] p-4">
        {!user && (
          <p className="mb-3 rounded-md bg-[#fff8ec] p-3 text-xs leading-5 text-[#7a4a12]">
            Đăng nhập để gửi message vào chat.
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!user}
            placeholder={user ? "Nhập tin nhắn..." : "Cần đăng nhập"}
            className="h-10 min-w-0 flex-1 rounded-md border border-[#ccd3dd] px-3 text-sm outline-none transition focus:border-[#e12828] focus:ring-2 focus:ring-[#e12828]/15 disabled:bg-[#f6f7f9]"
          />
          <button
            type="submit"
            disabled={!user || !draft.trim()}
            title="Send message"
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#e12828] px-3 text-white transition hover:bg-[#bf2222] disabled:cursor-not-allowed disabled:opacity-60"
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
      className={`rounded-md p-3 ${
        isOwnMessage ? "bg-[#fff0f0]" : "bg-[#f6f7f9]"
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#14171f]">
            {message.user.username}
          </p>
          <p className="text-[11px] font-semibold uppercase text-[#8a94a4]">
            {message.user.role}
          </p>
        </div>
        <span className="flex-none text-xs text-[#8a94a4]">
          {formatTime(message.createdAt)}
        </span>
      </div>
      <p className="break-words text-sm leading-6 text-[#3d4654]">
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
        className: "bg-[#eef7f0] text-[#16803c]",
      };
    case "connecting":
      return {
        text: "Connecting",
        className: "bg-[#eef1f5] text-[#596273]",
      };
    case "error":
      return {
        text: "WS error",
        className: "bg-[#fff4f4] text-[#9b1c1c]",
      };
    case "closed":
      return {
        text: "Closed",
        className: "bg-[#fff8ec] text-[#7a4a12]",
      };
    case "local":
    default:
      return {
        text: "Local",
        className: "bg-[#eef1f5] text-[#596273]",
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
    <section className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 h-8 w-64 animate-pulse rounded bg-[#dde1e7]" />
      <div className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="space-y-4">
          <div className="aspect-video animate-pulse rounded-lg bg-[#d8dee8]" />
          <div className="grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-md border border-[#dde1e7] bg-white"
              />
            ))}
          </div>
        </div>
        <div className="h-[520px] animate-pulse rounded-lg border border-[#dde1e7] bg-white" />
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
