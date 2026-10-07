import type { Metadata } from "next";
import Link from "next/link";
import { Plus, MapPin, Wifi } from "lucide-react";
import { getDict } from "@/lib/i18n/server";
import { listJobs } from "@/lib/db";
import { JOB_TYPES } from "@/lib/types";
import { fmt } from "@/lib/i18n/dict";
import { Empty, PageHeader, ScoreRing, StateChip, VerdictChip, daysUntil, fmtDate, scoreLabel } from "@/components/ui";
import { loadDemoJobs } from "@/app/actions/jobs";

export const metadata: Metadata = { title: "Offers" };

export default async function JobsPage({ searchParams }: PageProps<"/app/jobs">) {
  const { t, locale } = await getDict();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const type = typeof sp.type === "string" ? sp.type : "";
  const archived = sp.archived === "1";
  const jobs = listJobs({ q, type, archived });

  return (
    <>
      <PageHeader
        title={t.jobs.title}
        lead={fmt(t.pipeline.count, { n: jobs.length })}
        actions={
          <Link href="/app/jobs/new" className="btn btn-primary">
            <Plus size={16} aria-hidden="true" /> {t.jobs.add}
          </Link>
        }
      />

      <form className="card p-3 mb-6 flex flex-wrap gap-2 items-center rise no-print" role="search" style={{ ["--i" as string]: 1 }}>
        <label className="sr-only" htmlFor="q">{t.common.search}</label>
        <input id="q" name="q" defaultValue={q} className="input flex-1 min-w-48" placeholder={t.jobs.searchPlaceholder} />
        <label className="sr-only" htmlFor="type">{t.jobs.type}</label>
        <select id="type" name="type" defaultValue={type} className="input w-auto">
          <option value="">{t.common.all}</option>
          {JOB_TYPES.map((ty) => (
            <option key={ty} value={ty}>{t.jobTypes[ty]}</option>
          ))}
        </select>
        <label className="chip cursor-pointer">
          <input type="checkbox" name="archived" value="1" defaultChecked={archived} /> {t.common.showArchived}
        </label>
        <button className="btn btn-secondary">{t.common.filter}</button>
      </form>

      {jobs.length === 0 ? (
        <Empty title={t.jobs.empty} hint={t.jobs.emptyHint}>
          <Link href="/app/jobs/new" className="btn btn-primary">{t.jobs.add}</Link>
          <form action={async () => { "use server"; await loadDemoJobs(); }}>
            <button className="btn btn-secondary">{t.jobs.loadDemo}</button>
          </form>
        </Empty>
      ) : (
        <ul className="grid gap-3">
          {jobs.map((j, i) => {
            const d = daysUntil(j.deadline);
            return (
              <li key={j.id} className="rise" style={{ ["--i" as string]: Math.min(i, 8) }}>
                <Link
                  href={`/app/jobs/${j.id}`}
                  className="card group grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-4 p-4 hover:border-line-strong transition-colors"
                >
                  {j.evaluation ? (
                    <ScoreRing value={j.evaluation.global} size={52} label={scoreLabel(t, j.evaluation.global)} animate={false} />
                  ) : (
                    <span className="size-[52px] rounded-full border border-dashed border-line-strong grid place-items-center text-muted text-xs" aria-label={t.jobs.notEvaluated}>
                      —
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide font-semibold text-muted truncate">{j.company}</p>
                    <p className="display text-lg leading-snug group-hover:text-accent transition-colors">{j.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                      <span className="chip">{t.jobTypes[j.type]}</span>
                      {j.location && (
                        <span className="inline-flex items-center gap-1"><MapPin size={14} aria-hidden="true" />{j.location}</span>
                      )}
                      {j.remote && (
                        <span className="inline-flex items-center gap-1"><Wifi size={14} aria-hidden="true" />{t.common.remote}</span>
                      )}
                      {j.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="mono text-xs">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex sm:flex-col items-center sm:items-end gap-2 text-sm">
                    {j.evaluation && <VerdictChip verdict={j.evaluation.verdict} t={t} />}
                    {j.application && <StateChip state={j.application.status} t={t} />}
                    <span className={`mono text-xs ${d !== null && d <= 7 ? "text-danger" : "text-muted"}`}>
                      {j.deadline ? `${t.common.deadline} ${fmtDate(j.deadline, locale)}` : fmtDate(j.posted_at ?? j.created_at, locale)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
