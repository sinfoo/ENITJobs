"use server";

import { revalidatePath } from "next/cache";
import { addEvent, getApplication, getJob, getProfile, updateApplication } from "@/lib/db";
import { APP_STATES, type AppState } from "@/lib/types";
import { prepareInterview, tailorCv, writeCoverLetter } from "@/lib/ai";
import { getLocale } from "@/lib/i18n/server";

const str = (v: FormDataEntryValue | null, max: number) => String(v ?? "").slice(0, max);

export async function moveApplication(id: number, status: string) {
  if (!(APP_STATES as readonly string[]).includes(status)) return;
  updateApplication(id, { status: status as AppState });
  revalidatePath("/app", "layout");
}

export async function saveApplicationMeta(id: number, fd: FormData) {
  const status = str(fd.get("status"), 20);
  updateApplication(id, {
    notes: str(fd.get("notes"), 10_000),
    next_action_at: str(fd.get("next_action_at"), 10) || null,
    ...((APP_STATES as readonly string[]).includes(status) ? { status: status as AppState } : {}),
  });
  revalidatePath("/app", "layout");
}

export async function saveDoc(id: number, kind: "cv" | "letter", md: string) {
  updateApplication(id, kind === "cv" ? { cv_md: md.slice(0, 60_000) } : { cover_letter_md: md.slice(0, 20_000) });
  addEvent(id, "doc", kind);
  revalidatePath("/app", "layout");
}

async function ctx(id: number) {
  const app = getApplication(id);
  const job = app && getJob(app.job_id);
  if (!app || !job) return null;
  return { app, job, profile: getProfile(), locale: await getLocale() };
}

export async function generateCv(id: number) {
  const c = await ctx(id);
  if (!c) return;
  const { md } = await tailorCv(c.job, c.profile, c.locale);
  updateApplication(id, { cv_md: md });
  addEvent(id, "doc", "cv");
  revalidatePath("/app", "layout");
}

export async function generateLetter(id: number) {
  const c = await ctx(id);
  if (!c) return;
  const { md } = await writeCoverLetter(c.job, c.profile, c.locale);
  updateApplication(id, { cover_letter_md: md });
  addEvent(id, "doc", "letter");
  revalidatePath("/app", "layout");
}

export async function generatePrep(id: number) {
  const c = await ctx(id);
  if (!c) return;
  const prep = await prepareInterview(c.job, c.profile, c.locale);
  updateApplication(id, { interview_prep: prep });
  addEvent(id, "doc", "interview");
  revalidatePath("/app", "layout");
}

export async function addNote(id: number, fd: FormData) {
  const text = str(fd.get("text"), 2000).trim();
  if (!text) return;
  addEvent(id, "note", text);
  revalidatePath("/app", "layout");
}
