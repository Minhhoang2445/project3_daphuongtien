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
    detail: "Tai khoan xem live va chat.",
  },
  {
    value: "STREAMER",
    label: "Streamer",
    detail: "Tai khoan demo lay stream key.",
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
          ? "Dang ky thanh cong va da dang nhap."
          : "Dang ky thanh cong. Hay dang nhap bang tai khoan vua tao."
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Dang ky that bai"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-[#f1b4b4] bg-[#fff4f4] p-3 text-sm text-[#9b1c1c]">
          <AlertCircle className="mt-0.5 size-4 flex-none" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md border border-[#b7dfc4] bg-[#f1fbf4] p-3 text-sm text-[#17653a]">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 flex-none" />
            <div>
              <p>{success}</p>
              <Link
                href="/login"
                className="mt-2 inline-block font-semibold text-[#17653a] underline"
              >
                Di den trang dang nhap
              </Link>
            </div>
          </div>
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium text-[#2f3745]">Username</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          autoComplete="username"
          placeholder="minhhoang"
          className="mt-2 h-11 w-full rounded-md border border-[#ccd3dd] bg-white px-3 text-sm outline-none transition focus:border-[#e12828] focus:ring-2 focus:ring-[#e12828]/15"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-[#2f3745]">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          autoComplete="email"
          placeholder="minhhoang@example.com"
          className="mt-2 h-11 w-full rounded-md border border-[#ccd3dd] bg-white px-3 text-sm outline-none transition focus:border-[#e12828] focus:ring-2 focus:ring-[#e12828]/15"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-[#2f3745]">Password</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          placeholder="It nhat 8 ky tu"
          className="mt-2 h-11 w-full rounded-md border border-[#ccd3dd] bg-white px-3 text-sm outline-none transition focus:border-[#e12828] focus:ring-2 focus:ring-[#e12828]/15"
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-[#2f3745]">Role</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {roles.map((item) => (
            <label
              key={item.value}
              className={`cursor-pointer rounded-md border p-3 text-sm transition ${
                role === item.value
                  ? "border-[#e12828] bg-[#fff5f5]"
                  : "border-[#dde1e7] bg-white hover:bg-[#f6f7f9]"
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
              <span className="block font-semibold text-[#14171f]">
                {item.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[#596273]">
                {item.detail}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#e12828] px-4 text-sm font-semibold text-white transition hover:bg-[#bf2222] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UserPlus className="size-4" />
        )}
        Dang ky
      </button>
    </form>
  );
}
