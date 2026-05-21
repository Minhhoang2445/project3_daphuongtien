"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, LogIn } from "lucide-react";

import { useAuth } from "@/components/auth-provider";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Đăng nhập thất bại"
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
        <span className="text-sm font-medium text-[#2f3745]">Mật khẩu</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          autoComplete="current-password"
          placeholder="12345678"
          className="mt-2 h-11 w-full rounded-md border border-[#ccd3dd] bg-white px-3 text-sm outline-none transition focus:border-[#e12828] focus:ring-2 focus:ring-[#e12828]/15"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#e12828] px-4 text-sm font-semibold text-white transition hover:bg-[#bf2222] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogIn className="size-4" />
        )}
        Đăng nhập
      </button>
    </form>
  );
}
