"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, KanbanSquare, UserRound, Sparkles, Rss, Settings } from "lucide-react";
import { useT } from "@/lib/i18n/client";

const ITEMS = [
  { href: "/app", key: "dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/app/jobs", key: "jobs", Icon: Briefcase },
  { href: "/app/pipeline", key: "pipeline", Icon: KanbanSquare },
  { href: "/app/profile", key: "profile", Icon: UserRound },
  { href: "/app/upskill", key: "upskill", Icon: Sparkles },
  { href: "/app/sources", key: "sources", Icon: Rss },
  { href: "/app/settings", key: "settings", Icon: Settings },
] as const;

export function AppNav({ variant }: { variant: "side" | "top" }) {
  const path = usePathname();
  const { t } = useT();
  return (
    <ul className={variant === "side" ? "flex flex-col gap-1" : "flex gap-1 overflow-x-auto px-4 pb-2 -mx-4"}>
      {ITEMS.map(({ href, key, Icon, ...rest }) => {
        const active = "exact" in rest && rest.exact ? path === href : path.startsWith(href);
        return (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-accent-soft text-accent-strong" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <Icon size={18} aria-hidden="true" className={active ? "" : "text-muted group-hover:text-ink"} />
              {t.nav[key]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
