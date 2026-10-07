import type { NewJob } from "../db";
import type { Profile, Source } from "../types";
import { matchesProfile } from "./classify";
import * as greenhouse from "./greenhouse";
import * as lever from "./lever";
import * as ashby from "./ashby";
import * as rss from "./rss";

export { importFromUrl } from "./url";
export { DEMO_JOBS } from "./demo";
export { guessType, extractTags, matchesProfile } from "./classify";

/** Public boards verified live on 2026-10-07 (all returned 200 with postings). */
export const SUGGESTED_SOURCES: Pick<Source, "kind" | "label" | "handle">[] = [
  { kind: "greenhouse", label: "Vercel", handle: "vercel" },
  { kind: "greenhouse", label: "GitLab", handle: "gitlab" },
  { kind: "greenhouse", label: "Doctolib", handle: "doctolib" },
  { kind: "lever", label: "Qonto", handle: "qonto" },
  { kind: "ashby", label: "Supabase", handle: "supabase" },
  { kind: "ashby", label: "Replit", handle: "replit" },
  { kind: "rss", label: "We Work Remotely – Programming", handle: "https://weworkremotely.com/categories/remote-programming-jobs.rss" },
  { kind: "rss", label: "Python.org Jobs", handle: "https://www.python.org/jobs/feed/rss/" },
];

const PROVIDERS: Record<Source["kind"], (handle: string) => Promise<{ jobs: NewJob[]; error?: string }>> = {
  greenhouse: greenhouse.scan,
  lever: lever.scan,
  ashby: ashby.scan,
  rss: rss.scan,
};

/** Scan one source, keep only jobs matching the profile, dedupe by url. `total` is the raw count before filtering. */
export async function scanSource(source: Source, profile: Profile): Promise<{ jobs: NewJob[]; total: number; error?: string }> {
  const provider = PROVIDERS[source.kind];
  if (!provider) return { jobs: [], total: 0, error: `Unknown source kind: ${source.kind}` };
  const { jobs, error } = await provider(source.handle);
  const seen = new Set<string>();
  const kept = jobs.filter((j) => {
    if (seen.has(j.url) || !matchesProfile(j, profile)) return false;
    seen.add(j.url);
    return true;
  });
  return { jobs: kept, total: jobs.length, error };
}
