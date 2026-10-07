import Link from "next/link";
import { getDict, getTheme } from "@/lib/i18n/server";
import { Wordmark } from "@/components/logo";
import { AppNav } from "@/components/app-nav";
import { LangToggle, ThemeToggle } from "@/components/prefs-toggles";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [{ t }, theme] = await Promise.all([getDict(), getTheme()]);
  return (
    <div className="relative z-10 flex-1 lg:grid lg:grid-cols-[240px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col gap-6 border-r border-line bg-surface/60 px-4 py-6 sticky top-0 h-dvh">
        <Link href="/" className="px-2 rounded-md w-fit" aria-label="ENITJobs">
          <Wordmark />
        </Link>
        <nav aria-label={t.a11y.navMain} className="flex-1">
          <AppNav variant="side" />
        </nav>
        <div className="flex items-center gap-1 px-1">
          <LangToggle />
          <ThemeToggle current={theme} />
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <div className="lg:hidden sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-line px-4 pt-3">
        <div className="flex items-center justify-between pb-2">
          <Link href="/" aria-label="ENITJobs" className="rounded-md">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-1">
            <LangToggle />
            <ThemeToggle current={theme} />
          </div>
        </div>
        <nav aria-label={t.a11y.navMain}>
          <AppNav variant="top" />
        </nav>
      </div>

      <main id="main" className="min-w-0 px-4 sm:px-8 py-8 lg:py-10 max-w-6xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
