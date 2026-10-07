"use client";

import { useActionState, useState } from "react";
import { Loader2, Link2 } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { JOB_TYPES, type Job } from "@/lib/types";
import type { NewJob } from "@/lib/db";
import { fetchJobFromUrl } from "@/app/actions/jobs";

type FetchResult = { error?: string; job?: NewJob };
type FormValues = Partial<Pick<Job, "title" | "company" | "location" | "url" | "type" | "description" | "deadline" | "remote" | "tags">>;

export function JobForm({
  initial,
  action,
  submitLabel,
}: {
  initial?: FormValues;
  action: (prev: { error?: string } | null, fd: FormData) => Promise<{ error?: string } | void>;
  submitLabel: string;
}) {
  const { t } = useT();
  const [values, setValues] = useState<FormValues>(initial ?? {});
  const [fetchState, fetchAction, fetching] = useActionState(
    async (_p: FetchResult | null, fd: FormData): Promise<FetchResult> => {
      const r: FetchResult = await fetchJobFromUrl(null, fd);
      if (r.job) setValues(fromNew(r.job));
      return r;
    },
    null as FetchResult | null,
  );
  const [state, formAction, pending] = useActionState(
    async (p: { error?: string } | null, fd: FormData) => (await action(p, fd)) ?? null,
    null as { error?: string } | null,
  );
  const set = (k: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
      <div className="space-y-6">
        {!initial && (
          <form action={fetchAction} className="card p-5 rise" style={{ ["--i" as string]: 1 }}>
            <h2 className="text-xl">{t.jobs.importUrl}</h2>
            <p id="fetch-hint" className="hint mb-3">{t.jobs.importUrlHint}</p>
            <label className="sr-only" htmlFor="fetch-url">{t.jobs.fields.url}</label>
            <div className="flex gap-2">
              <input id="fetch-url" name="url" type="url" className="input" placeholder="https://…" required aria-describedby="fetch-hint" aria-invalid={!!fetchState?.error} />
              <button className="btn btn-secondary" disabled={fetching} aria-busy={fetching}>
                {fetching ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
                {fetching ? t.jobs.fetching : t.jobs.fetch}
              </button>
            </div>
            {fetchState?.error && (
              <p role="alert" className="mt-2 text-sm text-danger">{t.common.error}: {fetchState.error}</p>
            )}
          </form>
        )}
        <p className="text-sm text-muted px-1">{t.jobs.importPaste} ↓</p>
      </div>

      <form action={formAction} className="card p-5 space-y-4 rise" style={{ ["--i" as string]: 2 }}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="title">{t.jobs.fields.title} <span aria-hidden="true">*</span></label>
            <input id="title" name="title" className="input" required aria-required="true" aria-invalid={!!state?.error} aria-describedby={state?.error ? "job-error" : undefined} value={values.title ?? ""} onChange={set("title")} />
          </div>
          <div>
            <label className="label" htmlFor="company">{t.jobs.fields.company} <span aria-hidden="true">*</span></label>
            <input id="company" name="company" className="input" required aria-required="true" aria-invalid={!!state?.error} aria-describedby={state?.error ? "job-error" : undefined} value={values.company ?? ""} onChange={set("company")} />
          </div>
          <div>
            <label className="label" htmlFor="location">{t.jobs.fields.location}</label>
            <input id="location" name="location" className="input" value={values.location ?? ""} onChange={set("location")} />
          </div>
          <div>
            <label className="label" htmlFor="type">{t.jobs.fields.type}</label>
            <select id="type" name="type" className="input" value={values.type ?? ""} onChange={set("type")}>
              <option value="">— {t.common.unknown}</option>
              {JOB_TYPES.map((ty) => (
                <option key={ty} value={ty}>{t.jobTypes[ty]}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="url">{t.jobs.fields.url}</label>
            <input id="url" name="url" type="url" className="input" value={values.url ?? ""} onChange={set("url")} />
          </div>
          <div>
            <label className="label" htmlFor="deadline">{t.jobs.fields.deadline}</label>
            <input id="deadline" name="deadline" type="date" className="input" value={values.deadline ?? ""} onChange={set("deadline")} />
          </div>
          <div className="flex items-end pb-2">
            <label className="inline-flex items-center gap-2 text-sm min-h-6">
              <input type="checkbox" name="remote" checked={!!values.remote} onChange={set("remote")} className="accent-[var(--accent)] size-4" />
              {t.jobs.fields.remote}
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="tags">{t.jobs.fields.tags}</label>
            <input id="tags" name="tags" className="input" value={(values.tags ?? []).join(", ")} onChange={(e) => setValues((v) => ({ ...v, tags: e.target.value.split(",").map((s) => s.trim()) }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="description">{t.jobs.fields.description}</label>
            <textarea id="description" name="description" className="input !min-h-64" value={values.description ?? ""} onChange={set("description")} />
          </div>
        </div>
        {state?.error && <p id="job-error" role="alert" className="text-sm text-danger">{t.common.error} ({state.error})</p>}
        <div className="flex justify-end">
          <button className="btn btn-primary" disabled={pending} aria-busy={pending}>
            {pending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function fromNew(j: NewJob): FormValues {
  return {
    title: j.title,
    company: j.company,
    location: j.location,
    url: j.url,
    type: j.type,
    description: j.description,
    deadline: j.deadline ?? "",
    remote: j.remote,
    tags: j.tags,
  };
}
