"use client";

import Link from "next/link";
import { Loader2, LockKeyhole } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { DashboardStreamerPanel } from "@/components/dashboard-streamer-panel";
import type { AuthUser } from "@/types/auth";

const previewUser: AuthUser = {
  id: 1,
  username: "preview_streamer",
  email: "preview@example.com",
  role: "STREAMER",
  avatarUrl: null,
};

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
      <div className="space-y-5">
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

        <div className="rounded-lg border border-dashed border-[#ccd3dd] bg-[#fafbfc] p-4">
          <p className="text-sm font-semibold text-[#3d4654]">
            Preview giao dien dashboard khi backend/auth chua san sang
          </p>
          <p className="mt-1 text-sm leading-6 text-[#697282]">
            Khung duoi day dung mock data de ban kiem tra layout, copy button,
            regenerate key va form stream info. Khi dang nhap that, dashboard se
            dung user/token cua backend.
          </p>
        </div>

        <DashboardStreamerPanel user={previewUser} />
      </div>
    );
  }

  return <DashboardStreamerPanel user={user} />;
}
