import Link from "next/link";
import { Radio } from "lucide-react";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  switchText: string;
  switchHref: string;
  switchLabel: string;
  children: ReactNode;
};

export function AuthCard({
  title,
  description,
  switchText,
  switchHref,
  switchLabel,
  children,
}: AuthCardProps) {
  return (
    <main className="app-page px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <Link href="/" className="mb-6 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm shadow-red-600/20">
            <Radio className="size-5" />
          </span>
          <span>
            <span className="block text-base font-extrabold">Mini Twitch</span>
            <span className="block text-xs font-medium text-slate-500">
              Không gian frontend
            </span>
          </span>
        </Link>

        <section className="surface-panel rounded-2xl p-6">
          <div className="mb-6">
            <p className="eyebrow mb-2">Tài khoản</p>
            <h1 className="text-2xl font-extrabold tracking-normal">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>

          {children}
        </section>

        <p className="mt-5 text-center text-sm text-slate-500">
          {switchText}{" "}
          <Link
            href={switchHref}
            className="font-extrabold text-red-600 hover:text-red-700"
          >
            {switchLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
