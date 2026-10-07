"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteJob,
  ensureApplication,
  getJob,
  getProfile,
  insertEvaluation,
  updateJob,
  upsertJob,
  type NewJob,
} from "@/lib/db";
import { JOB_TYPES, type JobType } from "@/lib/types";
import { evaluateJob } from "@/lib/ai";
import { DEMO_JOBS, extractTags, guessType, importFromUrl } from "@/lib/sources";

const str = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

function jobFromForm(fd: FormData): NewJob | { error: string } {
  const title = str(fd.get("title"), 200);
  const company = str(fd.get("company"), 200);
  const description = str(fd.get("description"), 20_000);
  let url = str(fd.get("url"), 1000);
  if (!title || !company) return { error: "missing" };
  if (!url) url = `manual://${encodeURIComponent(company)}/${encodeURIComponent(title)}/${Date.now()}`;
  const typeRaw = str(fd.get("type"), 20);
  const type: JobType = (JOB_TYPES as string[]).includes(typeRaw) ? (typeRaw as JobType) : guessType(title, description);
  const tags = str(fd.get("tags"), 500)
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
  return {
    title,
    company,
    location: str(fd.get("location"), 200),
    remote: fd.get("remote") === "on",
    url,
    source: url.startsWith("manual://") ? "manual" : "url",
    type,
    description,
    tags: tags.length ? tags : extractTags(title, description),
    posted_at: null,
    deadline: str(fd.get("deadline"), 10) || null,
  };
}

export async function createJob(_prev: { error?: string } | null, fd: FormData) {
  const j = jobFromForm(fd);
  if ("error" in j) return { error: j.error };
  const { id } = upsertJob(j);
  revalidatePath("/app", "layout");
  redirect(`/app/jobs/${id}`);
}

export async function editJob(id: number, fd: FormData) {
  const j = jobFromForm(fd);
  if ("error" in j) return { error: j.error };
  updateJob(id, j);
  revalidatePath("/app", "layout");
  redirect(`/app/jobs/${id}`);
}

export async function fetchJobFromUrl(_prev: unknown, fd: FormData) {
  const url = str(fd.get("url"), 1000);
  if (!url) return { error: "missing" };
  const r = await importFromUrl(url);
  if (r.error || !r.job) return { error: r.error ?? "fetch" };
  return { job: r.job };
}

export async function runEvaluation(jobId: number) {
  const job = getJob(jobId);
  if (!job) return;
  const profile = getProfile();
  const ev = await evaluateJob(job, profile);
  insertEvaluation(ev);
  revalidatePath("/app", "layout");
}

export async function trackJob(jobId: number) {
  const app = ensureApplication(jobId);
  revalidatePath("/app", "layout");
  redirect(`/app/pipeline/${app.id}`);
}

export async function setArchived(jobId: number, archived: boolean) {
  updateJob(jobId, { archived });
  revalidatePath("/app", "layout");
}

export async function removeJob(jobId: number) {
  deleteJob(jobId);
  revalidatePath("/app", "layout");
  redirect("/app/jobs");
}

export async function loadDemoJobs() {
  let n = 0;
  for (const j of DEMO_JOBS) if (upsertJob(j).inserted) n++;
  revalidatePath("/app", "layout");
  return n;
}
