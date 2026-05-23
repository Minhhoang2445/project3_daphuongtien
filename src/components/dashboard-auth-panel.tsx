"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { DashboardStreamerPanel } from "@/components/dashboard-streamer-panel";
import { LoadingBlock } from "@/components/state-feedback";
import type { AuthUser } from "@/types/auth";

const previewUser: AuthUser = {
  id: 1,
  username: "minhhoang",
};

export function DashboardAuthPanel() {
  const { user, status } = useAuth();

  if (status === "loading") {
    return <LoadingBlock label="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!user) {
    return (
      <div className="space-y-5">
        <div className="surface-panel rounded-2xl p-6">
          <LockKeyhole className="mb-4 size-9 text-red-600" />
          <h1 className="text-2xl font-extrabold text-slate-950">
            Cần đăng nhập
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Dashboard dùng username trong localStorage để lấy OBS/Larix config
            từ backend thật trên VPS.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/login" className="btn btn-primary">
              Đăng nhập
            </Link>
            <Link href="/register" className="btn btn-secondary">
              Đăng ký
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
          <p className="text-sm font-extrabold text-slate-700">
            Preview dashboard
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Khung dưới đây dùng dữ liệu mẫu để kiểm tra layout, copy key,
            regenerate key và form stream info.
          </p>
        </div>

        <DashboardStreamerPanel user={previewUser} />
      </div>
    );
  }

  return <DashboardStreamerPanel user={user} />;
}
