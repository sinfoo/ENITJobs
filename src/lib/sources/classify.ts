import type { NewJob } from "../db";
import type { JobType, Profile } from "../types";

/** Lowercase, strip accents, unify dev/develop stems and a few FR/EN synonyms. */
export function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/d[ée]velop\w*/g, "dev")
    .replace(/\bdev\w*/g, "dev")
    .replace(/\blogiciel\w*/g, "software")
    .replace(/\bingenieur\w*|\bengineer\w*/g, "engineer")
    .replace(/\bdonnees\b/g, "data");
}

export function guessType(title: string, description = ""): JobType {
  const t = fold(title);
  const all = `${t} ${fold(description)}`;
  const pfe = /\bpfe\b|projet de fin d'?etudes?|fin d'?etudes?|final year project|graduation project/;
  if (pfe.test(t)) return "pfe";
  if (/\balternan|apprenti|apprenticeship|work-?study/.test(t)) return "alternance";
  if (/\bstage|\bstagiaire|\bintern(ship)?s?\b/.test(t)) return pfe.test(all) ? "pfe" : "stage";
  if (/\bfreelance|\bfreelancer|\bindependant/.test(t)) return "freelance";
  // Title was not decisive; look at the body with the same priorities.
  // Bare "stage" is skipped here: in English bodies it usually means "early-stage".
  if (pfe.test(all)) return "pfe";
  if (/\balternan|apprenti|apprenticeship/.test(all)) return "alternance";
  if (/\bstagiaire|\binternship\b|\bstage (d'?ete|d'?ingenieur|technicien|ouvrier|conventionne|remunere)|\b(offre|convention|periode|duree) de stage\b/.test(all)) return "stage";
  if (/\bfreelance/.test(all)) return "freelance";
  return "emploi";
}

export function guessRemote(text: string): boolean {
  return /\b(remote|teletravail|télétravail|full[- ]remote|work from home|a distance|à distance|anywhere)\b/i.test(text);
}

// Compact built-in tech list. Display name -> regex (word-ish boundaries, case-insensitive).
const TECH: [string, RegExp][] = [
  ["Java", /\bjava\b(?!script)/i], ["Spring", /\bspring( boot)?\b/i], ["Python", /\bpython\b/i], ["Django", /\bdjango\b/i],
  ["Flask", /\bflask\b/i], ["FastAPI", /\bfastapi\b/i], ["JavaScript", /\bjavascript\b|\bjs\b/i], ["TypeScript", /\btypescript\b|\bts\b/i],
  ["React", /\breact(\.?js)?\b/i], ["Next.js", /\bnext\.?js\b/i], ["Vue", /\bvue(\.?js)?\b/i], ["Angular", /\bangular\b/i],
  ["Node.js", /\bnode(\.?js)?\b/i], ["Flutter", /\bflutter\b/i], ["Dart", /\bdart\b/i], ["Kotlin", /\bkotlin\b/i],
  ["Android", /\bandroid\b/i], ["iOS", /\bios\b/i], ["Swift", /\bswift\b/i], ["C++", /\bc\+\+/i], ["C", /\bC\b(?![#+])|\blangage c\b/],
  ["C#", /\bc#|\bcsharp\b/i], [".NET", /\.net\b|\bdotnet\b/i], ["PHP", /\bphp\b/i], ["Laravel", /\blaravel\b/i], ["Symfony", /\bsymfony\b/i],
  ["Go", /\bgolang\b|\bgo\b(?= (developer|engineer|dev))/i], ["Rust", /\brust\b/i], ["SQL", /\bsql\b/i], ["PostgreSQL", /\bpostgres(ql)?\b/i],
  ["MySQL", /\bmysql\b/i], ["MongoDB", /\bmongo(db)?\b/i], ["Redis", /\bredis\b/i], ["Docker", /\bdocker\b/i], ["Kubernetes", /\bkubernetes\b|\bk8s\b/i],
  ["Linux", /\blinux\b/i], ["Git", /\bgit\b/i], ["CI/CD", /\bci\/cd\b|\bjenkins\b|\bgitlab ci\b|\bgithub actions\b/i], ["AWS", /\baws\b/i],
  ["Azure", /\bazure\b/i], ["GCP", /\bgcp\b|\bgoogle cloud\b/i], ["Terraform", /\bterraform\b/i], ["DevOps", /\bdevops\b/i],
  ["Machine Learning", /\bmachine learning\b|\bml\b|\bapprentissage automatique\b/i], ["Deep Learning", /\bdeep learning\b|\bpytorch\b|\btensorflow\b/i],
  ["Data Science", /\bdata scien/i], ["Data Engineering", /\bdata engineer|\bspark\b|\bairflow\b/i], ["NLP", /\bnlp\b|\bllm\b/i],
  ["Pandas", /\bpandas\b/i], ["Embedded", /\bembedded\b|\bembarqu/i], ["STM32", /\bstm32\b/i], ["Arduino", /\barduino\b/i], ["IoT", /\biot\b/i],
  ["RTOS", /\brtos\b|\bfreertos\b/i], ["Cybersecurity", /\bcybers[eé]cu|\bpentest|\bsiem\b|\binfosec|\bsecurity (engineer|analyst|operations)/i],
  ["Network", /\bnetworking\b|\br[eé]seaux? (informatique|ip|d'entreprise)|\bcisco\b|\btcp\/ip\b/i], ["REST API", /\brest(ful)? api|\bapi rest\b|\brestful\b/i], ["GraphQL", /\bgraphql\b/i], ["Microservices", /\bmicroservices?\b/i], ["Agile", /\bagile\b|\bscrum\b/i],
  ["Tailwind", /\btailwind\b/i], ["Figma", /\bfigma\b/i], ["Odoo", /\bodoo\b/i], ["SAP", /\bsap\b/i], ["Power BI", /\bpower ?bi\b/i],
  ["MATLAB", /\bmatlab\b/i], ["Unity", /\bunity\b/i], ["Blockchain", /\bblockchain\b|\bsolidity\b/i],
];

export function extractTags(title: string, description = ""): string[] {
  const text = `${title}\n${description}`;
  const out: string[] = [];
  for (const [name, re] of TECH) {
    if (re.test(text)) out.push(name);
    if (out.length >= 8) break;
  }
  return out;
}

/** Any date-ish input (ISO, RFC 2822, epoch ms) -> yyyy-mm-dd or null. */
export function normalizeDate(s?: string | number | null): string | null {
  if (s === undefined || s === null || s === "") return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export function matchesProfile(job: NewJob, profile: Profile): boolean {
  if (profile.target_types.length && !profile.target_types.includes(job.type)) return false;
  const roles = profile.target_roles.map((r) => r.trim()).filter(Boolean);
  if (!roles.length) return true;
  const title = fold(job.title);
  return roles.some((role) =>
    fold(role)
      .split(/[^a-z0-9#+.]+/)
      .filter((tok) => tok.length >= 4 || tok === "dev" || tok === "data")
      .some((tok) => title.includes(tok)),
  );
}
