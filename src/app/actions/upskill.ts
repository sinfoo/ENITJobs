"use server";

import { revalidatePath } from "next/cache";
import { getProfile, kvSet, listJobs } from "@/lib/db";
import { buildUpskillPlan } from "@/lib/ai";
import { getLocale } from "@/lib/i18n/server";

export async function generateUpskillPlan() {
  const jobs = listJobs().filter((j) => !j.evaluation || j.evaluation.verdict !== "skip");
  const plan = await buildUpskillPlan(jobs, getProfile(), await getLocale());
  kvSet("upskill_plan", plan);
  revalidatePath("/app/upskill");
}
