import Link from "next/link";
import { Radio } from "lucide-react";

import { AuthStatus } from "@/components/auth-status";

const primaryRoutes = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/videos",
    label: "VOD",
  },
  {
    href: "/guide",
    label: "Guide",
  },
];

type SiteHeaderProps = {
  subtitle?: string;
};

export function SiteHeader({ subtitle = "Không gian frontend" }: SiteHeaderProps) {
  return (
    <header className="border-b border-[#dde1e7] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 flex-none items-center justify-center rounded-md bg-[#e12828] text-white">
            <Radio className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold">
              Mini Twitch
            </span>
            <span className="block truncate text-xs text-[#697282]">
              {subtitle}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {primaryRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[#4c5666] hover:bg-[#eef1f5] hover:text-[#14171f]"
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <AuthStatus />
      </div>
    </header>
  );
}
