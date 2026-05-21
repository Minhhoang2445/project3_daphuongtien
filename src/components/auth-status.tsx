"use client";

import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";

import { useAuth } from "@/components/auth-provider";

export function AuthStatus() {
  const { user, status, logout } = useAuth();

  if (status === "loading") {
    return (
      <span className="rounded-md bg-[#eef1f5] px-3 py-2 text-sm text-[#596273]">
        Đang kiểm tra...
      </span>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-md px-3 py-2 text-sm font-medium text-[#4c5666] hover:bg-[#eef1f5] hover:text-[#14171f]"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-[#14171f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2a303b]"
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-2 rounded-md bg-[#eef7f0] px-3 py-2 text-sm text-[#17653a] sm:flex">
        <UserRound className="size-4" />
        <span className="font-medium">{user.username}</span>
        <span className="text-xs uppercase">{user.role}</span>
      </div>
      <button
        type="button"
        onClick={logout}
        className="inline-flex items-center gap-2 rounded-md border border-[#dde1e7] bg-white px-3 py-2 text-sm font-medium text-[#4c5666] hover:bg-[#f6f7f9]"
      >
        <LogOut className="size-4" />
        Đăng xuất
      </button>
    </div>
  );
}
