// Shared fetch wrapper: 10s timeout, app User-Agent, never throws.

export const USER_AGENT = "ENITJobs/0.1 (+https://github.com/sinfoo/ENITJobs)";

export async function getText(
  url: string,
  accept = "application/json, text/*;q=0.9, */*;q=0.8",
): Promise<{ text: string; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: accept },
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });
    if (!res.ok) return { text: "", error: `HTTP ${res.status} for ${url}` };
    return { text: await res.text() };
  } catch (e) {
    return { text: "", error: `${(e as Error).name === "TimeoutError" ? "Timeout" : "Network error"} for ${url}: ${(e as Error).message}` };
  }
}

export async function getJson<T>(url: string): Promise<{ data?: T; error?: string }> {
  const { text, error } = await getText(url, "application/json");
  if (error) return { error };
  try {
    return { data: JSON.parse(text) as T };
  } catch {
    return { error: `Invalid JSON from ${url}` };
  }
}

/** "acme-corp_eu" -> "Acme Corp Eu" */
export function prettySlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
