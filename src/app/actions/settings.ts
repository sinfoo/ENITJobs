"use server";

import { revalidatePath } from "next/cache";
import { db, getProfile, listApplications, listJobs, listSources } from "@/lib/db";
import { ollamaHealth } from "@/lib/ai/ollama";

export async function checkOllama(url: string) {
  return ollamaHealth(url.replace(/\/+$/, ""));
}

export async function exportAll(): Promise<string> {
  return JSON.stringify(
    { exported_at: new Date().toISOString(), profile: getProfile(), jobs: listJobs(), archived: listJobs({ archived: true }), applications: listApplications(), sources: listSources() },
    null,
    2,
  );
}

export async function resetData() {
  db().exec("DELETE FROM events; DELETE FROM applications; DELETE FROM evaluations; DELETE FROM jobs; DELETE FROM kv;");
  revalidatePath("/app", "layout");
}
