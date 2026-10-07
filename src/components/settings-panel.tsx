"use client";

import { useState, useTransition } from "react";
import { Download, Loader2, Plug, Trash2 } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { checkOllama, exportAll, resetData } from "@/app/actions/settings";

export function OllamaCheck({ url }: { url: string }) {
  const { t } = useT();
  const [pending, start] = useTransition();
  const [res, setRes] = useState<{ ok: boolean; models: string[]; version?: string } | null>(null);
  return (
    <div>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={pending}
        aria-busy={pending}
        onClick={() => start(async () => setRes(await checkOllama((document.getElementById("ollama_url") as HTMLInputElement)?.value || url)))}
      >
        {pending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Plug size={14} aria-hidden="true" />} {t.settings.check}
      </button>
      {res && (
        <div role="status" className="mt-3 text-sm">
          <span className={`chip ${res.ok ? "chip-success" : "chip-danger"}`}>{res.ok ? `${t.settings.online}${res.version ? ` · v${res.version}` : ""}` : t.settings.offline}</span>
          {res.ok && res.models.length > 0 && (
            <p className="mt-2 text-muted">
              {t.settings.models}: <span className="mono text-ink">{res.models.join(", ")}</span>
            </p>
          )}
          {res.ok && res.models.length === 0 && (
            <pre className="mt-2 mono text-xs bg-surface-2 rounded-md p-2">ollama pull llama3.1</pre>
          )}
          {!res.ok && (
            <>
              <p className="mt-2 text-muted">{t.settings.install}</p>
              <pre className="mt-1 mono text-xs bg-surface-2 rounded-md p-2">ollama pull llama3.1</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function DataTools() {
  const { t } = useT();
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const json = await exportAll();
            const blob = new Blob([json], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `enitjobs-export-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
          })
        }
      >
        <Download size={14} aria-hidden="true" /> {t.settings.exportJson}
      </button>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        disabled={pending}
        onClick={() => {
          if (window.confirm(t.settings.resetConfirm)) start(() => resetData());
        }}
      >
        <Trash2 size={14} aria-hidden="true" /> {t.settings.reset}
      </button>
    </div>
  );
}
