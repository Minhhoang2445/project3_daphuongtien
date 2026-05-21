"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { DashboardStreamerPanel } from "@/components/dashboard-streamer-panel";
import { LoadingBlock } from "@/components/state-feedback";
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
    return <LoadingBlock label="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!user) {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
          <LockKeyhole className="mb-4 size-8 text-[#e12828]" />
          <h1 className="text-2xl font-bold">Cần đăng nhập</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596273]">
            Dashboard streamer cần JWT token để gọi API lấy RTMP URL và Stream
            Key. Hãy đăng nhập bằng tài khoản role STREAMER.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-md bg-[#e12828] px-4 py-2 text-sm font-semibold text-white hover:bg-[#bf2222]"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-[#dde1e7] bg-white px-4 py-2 text-sm font-semibold text-[#4c5666] hover:bg-[#f6f7f9]"
            >
              Đăng ký
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-[#ccd3dd] bg-[#fafbfc] p-4">
          <p className="text-sm font-semibold text-[#3d4654]">
            Preview giao diện dashboard khi backend/auth chưa sẵn sàng
          </p>
          <p className="mt-1 text-sm leading-6 text-[#697282]">
            Khung dưới đây dùng mock data để bạn kiểm tra layout, nút sao chép,
            regenerate key và form stream info. Khi đăng nhập thật, dashboard sẽ
            dùng user/token của backend.
          </p>
        </div>

        <DashboardStreamerPanel user={previewUser} />
      </div>
    );
  }

  return <DashboardStreamerPanel user={user} />;
}
