import type { NewJob } from "../db";
import { extractTags, guessRemote, guessType, normalizeDate } from "./classify";
import { htmlToText } from "./html";
import { getJson, prettySlug } from "./http";

interface LeverPosting {
  text?: string;
  hostedUrl?: string;
  categories?: { location?: string; commitment?: string; team?: string };
  descriptionPlain?: string;
  description?: string;
  lists?: { text?: string; content?: string }[];
  additionalPlain?: string;
  createdAt?: number;
  workplaceType?: string;
}

export function mapLever(json: LeverPosting[], slug: string): NewJob[] {
  const out: NewJob[] = [];
  for (const p of json) {
    if (!p.text || !p.hostedUrl) continue;
    const parts = [p.descriptionPlain ?? htmlToText(p.description ?? "")];
    for (const l of p.lists ?? []) parts.push(`${l.text ?? ""}\n${htmlToText(l.content ?? "")}`.trim());
    if (p.additionalPlain) parts.push(p.additionalPlain);
    const description = parts.filter(Boolean).join("\n\n");
    const location = p.categories?.location ?? "";
    const titleAndCommitment = `${p.text} ${p.categories?.commitment ?? ""}`;
    out.push({
      title: p.text.trim(),
      company: prettySlug(slug),
      location,
      remote: p.workplaceType === "remote" || guessRemote(`${location} ${p.text}`),
      url: p.hostedUrl,
      source: "lever",
      type: guessType(titleAndCommitment, description),
      description,
      tags: extractTags(p.text, description),
      posted_at: normalizeDate(p.createdAt),
      deadline: null,
    });
  }
  return out;
}

export async function scan(handle: string): Promise<{ jobs: NewJob[]; error?: string }> {
  const slug = handle.trim().toLowerCase();
  const { data, error } = await getJson<LeverPosting[]>(`https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`);
  if (!data) return { jobs: [], error };
  if (!Array.isArray(data)) return { jobs: [], error: `Unexpected Lever response for ${slug}` };
  return { jobs: mapLever(data, slug) };
}
