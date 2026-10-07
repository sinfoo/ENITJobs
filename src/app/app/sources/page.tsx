import type { Metadata } from "next";
import { RefreshCw, Trash2 } from "lucide-react";
import { getDict } from "@/lib/i18n/server";
import { listSources } from "@/lib/db";
import { fmt } from "@/lib/i18n/dict";
import { Empty, PageHeader, fmtDate } from "@/components/ui";
import { ActionButton } from "@/components/action-button";
import { SaveButton } from "@/components/save-button";
import { createSource, loadSuggestedSources, removeSource, scanAll, scanOne } from "@/app/actions/sources";

export const metadata: Metadata = { title: "Sources" };

export default async function SourcesPage() {
  const { t, locale } = await getDict();
  const sources = listSources();

  return (
    <>
      <PageHeader
        title={t.sources.title}
        lead={`${t.sources.intro} ${t.sources.filterHint}`}
        actions={
          sources.length > 0 && (
            <ActionButton action={scanAll} pendingLabel={t.sources.scanning} className="btn btn-primary">
              <RefreshCw size={16} aria-hidden="true" /> {t.sources.scanAll}
            </ActionButton>
          )
        }
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div>
          {sources.length === 0 ? (
            <Empty title={t.sources.empty}>
              <ActionButton action={loadSuggestedSources} className="btn btn-primary">{t.sources.loadSuggested}</ActionButton>
            </Empty>
          ) : (
            <ul className="grid gap-3">
              {sources.map((s, i) => (
                <li key={s.id} className="card p-4 flex flex-wrap items-center gap-3 rise" style={{ ["--i" as string]: i }}>
                  <span className="chip mono">{s.kind}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{s.label}</p>
                    <p className="mono text-xs text-muted truncate">{s.handle}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {t.sources.lastScan}: {s.last_scan ? `${fmtDate(s.last_scan, locale)} · ${fmt(t.sources.found, { n: s.last_count })}` : t.sources.never}
                    </p>
                  </div>
                  <label className="chip cursor-pointer">
                    <ToggleBox id={s.id} enabled={s.enabled} /> {t.sources.enabled}
                  </label>
                  <ActionButton action={scanOne.bind(null, s.id)} pendingLabel={t.sources.scanning} className="btn btn-secondary btn-sm">
                    <RefreshCw size={14} aria-hidden="true" /> {t.sources.scan}
                  </ActionButton>
                  <ActionButton action={removeSource.bind(null, s.id)} confirm={t.common.confirmDelete} className="btn btn-danger btn-sm">
                    <Trash2 size={14} aria-hidden="true" /> <span className="sr-only">{t.common.delete} {s.label}</span>
                  </ActionButton>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form action={createSource} className="card p-5 space-y-4 rise" style={{ ["--i" as string]: 2 }}>
          <h2 className="text-xl">{t.sources.add}</h2>
          <div>
            <label className="label" htmlFor="kind">{t.sources.kind}</label>
            <select id="kind" name="kind" className="input" defaultValue="greenhouse">
              <option value="greenhouse">Greenhouse</option>
              <option value="lever">Lever</option>
              <option value="ashby">Ashby</option>
              <option value="rss">RSS / Atom</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="label">{t.sources.label}</label>
            <input id="label" name="label" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="handle">{t.sources.handle}</label>
            <input id="handle" name="handle" className="input" required />
            <p className="hint">{t.sources.handleHint}</p>
          </div>
          <div className="flex justify-end"><SaveButton label={t.common.add} savedLabel={t.common.saved} /></div>
        </form>
      </div>
    </>
  );
}

import { ToggleBox } from "@/components/toggle-box";
