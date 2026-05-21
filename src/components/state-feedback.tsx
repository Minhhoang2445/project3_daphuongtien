import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Radio,
  VideoOff,
} from "lucide-react";

type NoticeTone = "warning" | "error" | "success" | "info";

type StateNoticeProps = {
  tone?: NoticeTone;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

const noticeStyles: Record<NoticeTone, string> = {
  warning: "border-[#f1c27a] bg-[#fff8ec] text-[#7a4a12]",
  error: "border-[#f1b4b4] bg-[#fff4f4] text-[#9b1c1c]",
  success: "border-[#b7dfc4] bg-[#f1fbf4] text-[#17653a]",
  info: "border-[#c5d4e8] bg-[#f3f7fc] text-[#315274]",
};

export function StateNotice({
  tone = "info",
  title,
  message,
  actionLabel,
  onAction,
}: StateNoticeProps) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`flex flex-col gap-3 rounded-md border p-4 text-sm sm:flex-row sm:items-start sm:justify-between ${noticeStyles[tone]}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 size-4 flex-none" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 leading-6">{message}</p>
        </div>
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-9 flex-none items-center justify-center gap-2 rounded-md border border-current/20 bg-white/75 px-3 text-sm font-semibold hover:bg-white"
        >
          <RefreshCw className="size-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
}: {
  icon?: ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-lg border border-[#dde1e7] bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-[#eef1f5] text-[#8a94a4]">
        {icon || <Radio className="size-6" />}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#596273]">
        {message}
      </p>
    </div>
  );
}

export function LoadingCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, item) => (
        <div
          key={item}
          className="overflow-hidden rounded-lg border border-[#dde1e7] bg-white"
        >
          <div className="aspect-video animate-pulse bg-[#d8dee8]" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-[#e5e9ef]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[#e5e9ef]" />
            <div className="h-4 w-full animate-pulse rounded bg-[#e5e9ef]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-[#dde1e7] bg-white p-6 text-[#596273]">
      <div className="flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-[#e12828]" />
        {label}
      </div>
    </div>
  );
}

export function OfflineState({
  username,
  message,
}: {
  username: string;
  message?: string;
}) {
  return (
    <div className="flex aspect-video flex-col items-center justify-center rounded-lg border border-[#dde1e7] bg-[#202530] px-5 text-center text-white">
      <VideoOff className="mb-3 size-12 text-white/70" />
      <h2 className="text-lg font-semibold">Stream đang offline</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/70">
        {message ||
          `Khi backend trả status LIVE và có hlsUrl, HLS player sẽ hiện tại đây cho @${username}.`}
      </p>
    </div>
  );
}

export function StreamStatusPill({ isLive }: { isLive: boolean }) {
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
