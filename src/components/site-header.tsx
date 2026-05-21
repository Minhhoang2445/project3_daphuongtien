"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Radio, Video, Wrench } from "lucide-react";

import { AuthStatus } from "@/components/auth-status";

const primaryRoutes = [
  {
    href: "/",
    label: "Trang chủ",
    icon: Radio,
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/videos",
    label: "VOD",
    icon: Video,
  },
  {
    href: "/guide",
    label: "Guide",
    icon: Wrench,
  },
];

type SiteHeaderProps = {
  subtitle?: string;
};

export function SiteHeader({ subtitle = "Không gian frontend" }: SiteHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="app-container flex flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-red-600 text-white shadow-sm shadow-red-600/20">
            <Radio className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-extrabold tracking-normal">
              Mini Twitch
            </span>
            <span className="block truncate text-xs font-medium text-slate-500">
              {subtitle}
            </span>
          </span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1 md:order-2 md:w-auto">
          {primaryRoutes.map((route) => {
            const Icon = route.icon;
            const active =
              route.href === "/"
                ? pathname === route.href
                : pathname.startsWith(route.href);

            return (
              <Link
                key={route.href}
                href={route.href}
                className={`inline-flex h-9 flex-none items-center gap-2 rounded-lg px-3 text-sm font-bold transition ${
                  active
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
                }`}
              >
                <Icon className="size-4" />
                {route.label}
              </Link>
            );
          })}
        </nav>

        <div className="order-2 md:order-3">
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
