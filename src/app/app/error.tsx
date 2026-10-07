"use client";

import { useT } from "@/lib/i18n/client";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useT();
  return (
    <div role="alert" className="card p-8 max-w-xl">
      <h1 className="text-2xl">{t.common.error}</h1>
      <p className="mono text-xs text-muted mt-2 break-all">{error.message}</p>
      <button type="button" className="btn btn-primary mt-5" onClick={reset}>
        {t.common.back}
      </button>
    </div>
  );
}
