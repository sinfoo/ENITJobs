// Thin client for a local Ollama server. No dependencies, no retries.

/** Thrown when the server cannot be reached at all (offline, timeout). */
export class OllamaUnavailable extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OllamaUnavailable";
  }
}

const base = (url: string) => url.replace(/\/+$/, "");

export async function ollamaHealth(url: string): Promise<{ ok: boolean; models: string[]; version?: string }> {
  try {
    const r = await fetch(`${base(url)}/api/tags`, { signal: AbortSignal.timeout(2000) });
    if (!r.ok) return { ok: false, models: [] };
    const data = (await r.json()) as { models?: { name: string }[] };
    const models = (data.models ?? []).map((m) => m.name);
    let version: string | undefined;
    try {
      const v = await fetch(`${base(url)}/api/version`, { signal: AbortSignal.timeout(2000) });
      if (v.ok) version = ((await v.json()) as { version?: string }).version;
    } catch {
      // version is optional
    }
    return { ok: true, models, version };
  } catch {
    return { ok: false, models: [] };
  }
}

export async function ollamaChatJSON<T>(opts: {
  url: string;
  model: string;
  system: string;
  user: string;
  schema: object;
  timeoutMs?: number;
}): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${base(opts.url)}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(opts.timeoutMs ?? 180_000),
      body: JSON.stringify({
        model: opts.model,
        stream: false,
        format: opts.schema,
        options: { temperature: 0.2 },
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
      }),
    });
  } catch (e) {
    throw new OllamaUnavailable(`Ollama unreachable at ${opts.url}: ${(e as Error).message}`);
  }
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`Ollama HTTP ${r.status}: ${body.slice(0, 300)}`);
  }
  const data = (await r.json()) as { message?: { content?: string } };
  const content = data.message?.content ?? "";
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error(`Ollama returned invalid JSON: ${content.slice(0, 300)}`);
  }
}
