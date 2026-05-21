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
    <main className="min-h-screen bg-[#f6f7f9] px-5 py-8 text-[#14171f]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <Link href="/" className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-[#e12828] text-white">
            <Radio className="size-5" />
          </span>
          <span>
            <span className="block text-base font-semibold">Mini Twitch</span>
            <span className="block text-xs text-[#697282]">
              Không gian frontend
            </span>
          </span>
        </Link>

        <section className="rounded-lg border border-[#dde1e7] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-normal">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-[#596273]">
              {description}
            </p>
          </div>

          {children}
        </section>

        <p className="mt-5 text-center text-sm text-[#596273]">
          {switchText}{" "}
          <Link
            href={switchHref}
            className="font-semibold text-[#e12828] hover:text-[#b91f1f]"
          >
            {switchLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
