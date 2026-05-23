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
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
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
      className={`flex flex-col gap-3 rounded-xl border p-4 text-sm shadow-sm sm:flex-row sm:items-start sm:justify-between ${noticeStyles[tone]}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 size-4 flex-none" />
        <div>
          <p className="font-extrabold">{title}</p>
          <p className="mt-1 leading-6 opacity-90">{message}</p>
        </div>
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-9 flex-none items-center justify-center gap-2 rounded-lg border border-current/15 bg-white/80 px-3 text-sm font-bold hover:bg-white"
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
    <div className="surface-panel rounded-2xl p-8 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        {icon || <Radio className="size-6" />}
      </div>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {message}
      </p>
    </div>
  );
}

export function LoadingCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, item) => (
        <div key={item} className="surface-card overflow-hidden rounded-2xl">
          <div className="aspect-video animate-pulse bg-slate-200" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="surface-panel rounded-2xl p-6 text-slate-500">
      <div className="flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-red-600" />
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
    <div className="video-placeholder flex aspect-video flex-col items-center justify-center rounded-2xl border border-slate-900/10 px-5 text-center text-white shadow-sm">
      <VideoOff className="mb-3 size-12 text-white/75" />
      <h2 className="text-lg font-extrabold">Stream đang offline</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
        {message ||
          `Khi backend trả status LIVE và có hlsUrl, HLS player sẽ hiển thị tại đây cho @${username}.`}
      </p>
    </div>
  );
}

export function StreamStatusPill({ isLive }: { isLive: boolean }) {
  if (isLive) {
    return (
      <span className="badge badge-live">
        <span className="size-1.5 rounded-full bg-white" />
        LIVE
      </span>
    );
  }

  return <span className="badge badge-muted">OFFLINE</span>;
}
