"use client";

import Link from "next/link";
import { Copy, KeyRound, Loader2, LockKeyhole, Radio } from "lucide-react";

import { useAuth } from "@/components/auth-provider";

const dashboardFields = [
  {
    label: "RTMP Server",
    value: "rtmp://IP_VPS:1935/live",
  },
  {
    label: "Stream Key",
    value: "Se lay tu GET /stream-key",
  },
  {
    label: "HLS URL",
    value: "http://IP_VPS/hls/{streamKey}.m3u8",
  },
];

export function DashboardAuthPanel() {
  const { user, status } = useAuth();

  if (status === "loading") {
    return (
      <div className="rounded-lg border border-[#dde1e7] bg-white p-6 text-[#596273]">
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin text-[#e12828]" />
          Dang kiem tra phien dang nhap...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
        <LockKeyhole className="mb-4 size-8 text-[#e12828]" />
        <h1 className="text-2xl font-bold">Can dang nhap</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596273]">
          Dashboard streamer can JWT token de goi API lay RTMP URL va stream
          key. Hay dang nhap bang tai khoan role STREAMER.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-md bg-[#e12828] px-4 py-2 text-sm font-semibold text-white hover:bg-[#bf2222]"
          >
            Dang nhap
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-[#dde1e7] bg-white px-4 py-2 text-sm font-semibold text-[#4c5666] hover:bg-[#f6f7f9]"
          >
            Dang ky
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#16803c]">
              Authenticated
            </p>
            <h1 className="text-2xl font-bold">Xin chao, {user.username}</h1>
            <p className="mt-2 text-sm text-[#596273]">
              Role hien tai: <span className="font-semibold">{user.role}</span>
            </p>
          </div>
          <Radio className="size-8 text-[#e12828]" />
        </div>
      </div>

      <section className="rounded-lg border border-[#dde1e7] bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <KeyRound className="size-5 text-[#e12828]" />
          <h2 className="text-lg font-semibold">Streamer credentials</h2>
        </div>

        <div className="grid gap-3">
          {dashboardFields.map((field) => (
            <div
              key={field.label}
              className="flex flex-col gap-2 rounded-md border border-[#e2e6ec] bg-[#fafbfc] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold">{field.label}</p>
                <p className="mt-1 break-all font-mono text-sm text-[#596273]">
                  {field.value}
                </p>
              </div>
              <button
                type="button"
                disabled
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#dde1e7] px-3 text-sm font-medium text-[#8a94a4]"
                title="Se bat copy khi ket noi API stream-key"
              >
                <Copy className="size-4" />
                Copy
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
