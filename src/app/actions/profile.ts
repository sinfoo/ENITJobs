"use server";

import { revalidatePath } from "next/cache";
import { getProfile, updateProfile } from "@/lib/db";
import { JOB_TYPES, type JobType } from "@/lib/types";

const list = (s: FormDataEntryValue | null) =>
  String(s ?? "")
    .split(/[\n,;]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x, i, a) => a.indexOf(x) === i)
    .slice(0, 200);

const str = (s: FormDataEntryValue | null, max: number) => String(s ?? "").slice(0, max);

export async function saveProfile(formData: FormData) {
  const types = formData.getAll("target_types").map(String).filter((t): t is JobType => (JOB_TYPES as string[]).includes(t));
  updateProfile({
    name: str(formData.get("name"), 120),
    email: str(formData.get("email"), 200),
    headline: str(formData.get("headline"), 300),
    cv_md: str(formData.get("cv_md"), 60_000),
    skills: list(formData.get("skills")),
    target_roles: list(formData.get("target_roles")),
    target_locations: list(formData.get("target_locations")),
    languages: list(formData.get("languages")),
    target_types: types,
  });
  revalidatePath("/app", "layout");
}

export async function saveSettings(formData: FormData) {
  const cur = getProfile().settings;
  updateProfile({
    settings: {
      ...cur,
      ollama_url: str(formData.get("ollama_url"), 300).replace(/\/+$/, "") || cur.ollama_url,
      ollama_model: str(formData.get("ollama_model"), 100) || cur.ollama_model,
    },
  });
  revalidatePath("/app", "layout");
}
