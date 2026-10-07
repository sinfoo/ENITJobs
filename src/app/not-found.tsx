import Link from "next/link";
import { getDict } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getDict();
  return (
    <main id="main" className="relative z-10 flex-1 grid place-items-center p-8">
      <div className="text-center">
        <p className="mono text-accent">404</p>
        <h1 className="text-4xl mt-2">{t.common.unknown}</h1>
        <Link href="/app" className="btn btn-primary mt-6">{t.nav.dashboard}</Link>
      </div>
    </main>
  );
}
