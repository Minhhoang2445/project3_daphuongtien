"use client";

import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";

import { useAuth } from "@/components/auth-provider";

export function AuthStatus() {
  const { user, status, logout } = useAuth();

  if (status === "loading") {
    return (
      <span className="inline-flex h-9 items-center rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-500">
        Đang kiểm tra...
      </span>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="btn btn-secondary min-h-9 px-3">
          Đăng nhập
        </Link>
        <Link href="/register" className="btn btn-ink min-h-9 px-3">
          Đăng ký
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 sm:flex">
        <UserRound className="size-4" />
        <span className="font-bold">{user.username}</span>
      </div>
      <button type="button" onClick={logout} className="btn btn-secondary min-h-9 px-3">
        <LogOut className="size-4" />
        Đăng xuất
      </button>
    </div>
  );
}
