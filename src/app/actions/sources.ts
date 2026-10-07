"use server";

import { revalidatePath } from "next/cache";
import { addSource, deleteSource, getProfile, listSources, updateSource, upsertJob } from "@/lib/db";
import { SUGGESTED_SOURCES, scanSource } from "@/lib/sources";
import type { Source } from "@/lib/types";

const KINDS: Source["kind"][] = ["greenhouse", "lever", "ashby", "rss"];

export async function createSource(fd: FormData) {
  const kind = String(fd.get("kind") ?? "");
  const handle = String(fd.get("handle") ?? "").trim().slice(0, 500);
  const label = String(fd.get("label") ?? "").trim().slice(0, 100) || handle;
  if (!KINDS.includes(kind as Source["kind"]) || !handle) return;
  addSource({ kind: kind as Source["kind"], label, handle });
  revalidatePath("/app/sources");
}

export async function toggleSource(id: number, enabled: boolean) {
  updateSource(id, { enabled });
  revalidatePath("/app/sources");
}

export async function removeSource(id: number) {
  deleteSource(id);
  revalidatePath("/app/sources");
}

export async function loadSuggestedSources() {
  for (const s of SUGGESTED_SOURCES) addSource(s);
  revalidatePath("/app/sources");
}

export async function scanOne(id: number): Promise<{ added: number; total: number; error?: string }> {
  const src = listSources().find((s) => s.id === id);
  if (!src) return { added: 0, total: 0, error: "missing" };
  const profile = getProfile();
  const r = await scanSource(src, profile);
  let added = 0;
  for (const j of r.jobs) if (upsertJob(j).inserted) added++;
  updateSource(id, { last_scan: new Date().toISOString(), last_count: added });
  revalidatePath("/app", "layout");
  return { added, total: r.total, error: r.error };
}

export async function scanAll(): Promise<{ added: number }> {
  let added = 0;
  for (const s of listSources().filter((s) => s.enabled)) added += (await scanOne(s.id)).added;
  return { added };
}
