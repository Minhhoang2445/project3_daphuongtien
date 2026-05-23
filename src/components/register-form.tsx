"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, UserPlus } from "lucide-react";

import { useAuth } from "@/components/auth-provider";

export function RegisterForm() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await register({ username, password });
      setSuccess("Đăng ký thành công. Hãy đăng nhập bằng tài khoản vừa tạo.");
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
        <span className="text-sm font-bold text-slate-700">Mật khẩu</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          minLength={6}
          required
          autoComplete="new-password"
          placeholder="Ít nhất 6 ký tự"
          className="field mt-2"
        />
      </label>

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
