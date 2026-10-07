import type { NewJob } from "../db";
import { extractTags, guessRemote, guessType, normalizeDate } from "./classify";
import { htmlToText } from "./html";
import { getJson, prettySlug } from "./http";

interface AshbyJob {
  title?: string;
  jobUrl?: string;
  location?: string;
  isRemote?: boolean;
  isListed?: boolean;
  employmentType?: string;
  descriptionPlain?: string;
  descriptionHtml?: string;
  publishedAt?: string;
}
export interface AshbyPayload {
  jobs?: AshbyJob[];
}

export function mapAshby(json: AshbyPayload, slug: string): NewJob[] {
  const out: NewJob[] = [];
  for (const j of json.jobs ?? []) {
    if (!j.title || !j.jobUrl || j.isListed === false) continue;
    const description = j.descriptionPlain?.trim() || htmlToText(j.descriptionHtml ?? "");
    const location = j.location ?? "";
    out.push({
      title: j.title.trim(),
      company: prettySlug(slug),
      location,
      remote: !!j.isRemote || guessRemote(`${location} ${j.title}`),
      url: j.jobUrl,
      source: "ashby",
      type: guessType(`${j.title} ${j.employmentType ?? ""}`, description),
      description,
      tags: extractTags(j.title, description),
      posted_at: normalizeDate(j.publishedAt),
      deadline: null,
    });
  }
  return out;
}

export async function scan(handle: string): Promise<{ jobs: NewJob[]; error?: string }> {
  const slug = handle.trim().toLowerCase();
  const { data, error } = await getJson<AshbyPayload>(
    `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}?includeCompensation=false`,
  );
  if (!data) return { jobs: [], error };
  return { jobs: mapAshby(data, slug) };
}
