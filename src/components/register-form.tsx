"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, UserPlus } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import type { UserRole } from "@/types/auth";

const roles: Array<{ value: UserRole; label: string; detail: string }> = [
  {
    value: "VIEWER",
    label: "Viewer",
    detail: "Tài khoản xem live và chat.",
  },
  {
    value: "STREAMER",
    label: "Streamer",
    detail: "Tài khoản demo lấy Stream Key.",
  },
];

export function RegisterForm() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STREAMER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const data = await register({ username, email, password, role });
      setSuccess(
        data.accessToken
          ? "Đăng ký thành công và đã đăng nhập."
          : "Đăng ký thành công. Hãy đăng nhập bằng tài khoản vừa tạo."
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Đăng ký thất bại"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <AlertCircle className="mt-0.5 size-4 flex-none" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 flex-none" />
            <div>
              <p>{success}</p>
              <Link
                href="/login"
                className="mt-2 inline-block font-extrabold text-emerald-800 underline"
              >
                Đi đến trang đăng nhập
              </Link>
            </div>
          </div>
        </div>
      )}

      <label className="block">
        <span className="text-sm font-bold text-slate-700">Tên người dùng</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          autoComplete="username"
          placeholder="minhhoang"
          className="field mt-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          autoComplete="email"
          placeholder="minhhoang@example.com"
          className="field mt-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700">Mật khẩu</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          placeholder="Ít nhất 8 ký tự"
          className="field mt-2"
        />
      </label>

      <fieldset>
        <legend className="text-sm font-bold text-slate-700">Vai trò</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {roles.map((item) => (
            <label
              key={item.value}
              className={`cursor-pointer rounded-xl border p-3 text-sm transition ${
                role === item.value
                  ? "border-red-200 bg-red-50 text-red-950"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={item.value}
                checked={role === item.value}
                onChange={() => setRole(item.value)}
                className="sr-only"
              />
              <span className="block font-extrabold">{item.label}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {item.detail}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UserPlus className="size-4" />
        )}
        Đăng ký
      </button>
    </form>
  );
}
