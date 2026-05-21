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
  AlertCircle,
  CalendarDays,
  Eye,
  MessageSquareText,
  Radio,
  Send,
  UserRound,
  VideoOff,
} from "lucide-react";

import { HlsPlayer } from "@/components/hls-player";
import { useAuth } from "@/components/auth-provider";
import { getAccessToken } from "@/lib/api-client";
import {
  getStreamChatHistoryRequest,
  getStreamDetailRequest,
} from "@/lib/live-api";
import {
  mockChatMessages,
  mockLiveStreams,
  sampleHlsUrl,
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
        mockLiveStreams[0];

      return {
        stream: stream ?? {
          id: 0,
          title: `Live page cua @${username}`,
          description: "Mock offline stream",
          status: "OFFLINE",
          hlsUrl: sampleHlsUrl,
          streamer: {
            id: 0,
            username,
          },
        },
        messages: mockChatMessages,
        status: "mock",
        notice:
          error instanceof Error
            ? error.message
            : "Backend chua san sang, dang hien thi mock live page",
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
        <div className="mb-6 flex items-start gap-3 rounded-md border border-[#f1c27a] bg-[#fff8ec] p-4 text-sm text-[#7a4a12]">
          <AlertCircle className="mt-0.5 size-4 flex-none" />
          <div>
            <p className="font-semibold">Dang hien thi mock live page</p>
            <p className="mt-1 leading-6">
              {state.notice}. Khi backend chay, page nay se dung du lieu that
              tu `GET /streams/:username`.
            </p>
          </div>
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
            {state.stream.title || `Live cua @${username}`}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#596273]">
            {state.stream.description ||
              "Trang live lay stream detail, phat HLS va hien thi chat panel."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refreshLivePage()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#ccd3dd] bg-white px-4 text-sm font-semibold text-[#3d4654] hover:bg-[#f6f7f9]"
        >
          <Radio className="size-4" />
          Refresh stream
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
          streamId={state.stream.id}
          messages={state.messages}
          isMock={state.status === "mock"}
        />
      </div>

      <Link
        href="/"
        className="mt-6 inline-block rounded-md border border-[#dde1e7] bg-white px-4 py-2 text-sm font-semibold text-[#4c5666] hover:bg-[#f6f7f9]"
      >
        Quay lai home
      </Link>
    </section>
  );
}

function StatusBadge({ isLive }: { isLive: boolean }) {
  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#e12828] px-2.5 py-1 text-xs font-bold text-white">
        <span className="size-1.5 rounded-full bg-white" />
        LIVE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#e8ebf0] px-2.5 py-1 text-xs font-bold text-[#596273]">
      OFFLINE
    </span>
  );
}

function OfflinePanel({ stream }: { stream: LiveStream }) {
  return (
    <div className="flex aspect-video flex-col items-center justify-center rounded-lg border border-[#dde1e7] bg-[#202530] px-5 text-center text-white">
      <VideoOff className="mb-3 size-12 text-white/70" />
      <h2 className="text-lg font-semibold">Stream dang offline</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/70">
        Khi backend tra `status = LIVE` va co `hlsUrl`, HLS player se tu hien
        tai day cho @{stream.streamer.username}.
      </p>
    </div>
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
        value={formatDate(stream.startedAt) ?? "No date"}
      />
      <div className="rounded-md border border-[#dde1e7] bg-white p-4 md:col-span-3">
        <p className="text-sm font-semibold text-[#14171f]">HLS URL</p>
        <p className="mt-2 break-all font-mono text-xs leading-5 text-[#596273]">
          {stream.hlsUrl || "Backend chua tra hlsUrl"}
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
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const renderedMessages = [...messages, ...localMessages];

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = draft.trim();
    if (!message || !user) return;

    setLocalMessages((current) => [
      ...current,
      {
        id: Date.now(),
        streamId,
        message,
        createdAt: new Date().toISOString(),
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    ]);
    setDraft("");
  }

  return (
    <aside className="flex min-h-[520px] flex-col rounded-lg border border-[#dde1e7] bg-white">
      <div className="border-b border-[#dde1e7] p-4">
        <div className="flex items-center gap-2">
          <MessageSquareText className="size-5 text-[#e12828]" />
          <h2 className="font-semibold">Live chat</h2>
        </div>
        <p className="mt-1 text-xs leading-5 text-[#697282]">
          {isMock
            ? "Dang dung mock chat. Buoc WebSocket se ket noi realtime."
            : "Chat history lay tu backend. WebSocket se lam o buoc tiep theo."}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {renderedMessages.length === 0 ? (
          <p className="rounded-md bg-[#f6f7f9] p-3 text-sm text-[#596273]">
            Chua co tin nhan nao.
          </p>
        ) : (
          renderedMessages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="border-t border-[#dde1e7] p-4">
        {!user && (
          <p className="mb-3 rounded-md bg-[#fff8ec] p-3 text-xs leading-5 text-[#7a4a12]">
            Dang nhap de thu gui message local tren UI.
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!user}
            placeholder={user ? "Nhap tin nhan..." : "Can dang nhap"}
            className="h-10 min-w-0 flex-1 rounded-md border border-[#ccd3dd] px-3 text-sm outline-none transition focus:border-[#e12828] focus:ring-2 focus:ring-[#e12828]/15 disabled:bg-[#f6f7f9]"
          />
          <button
            type="submit"
            disabled={!user || !draft.trim()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#e12828] px-3 text-white transition hover:bg-[#bf2222] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="rounded-md bg-[#f6f7f9] p-3">
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#14171f]">
          {message.user.username}
        </p>
        <span className="text-xs text-[#8a94a4]">
          {formatTime(message.createdAt)}
        </span>
      </div>
      <p className="text-sm leading-6 text-[#3d4654]">{message.message}</p>
    </div>
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
