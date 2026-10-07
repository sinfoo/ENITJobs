# ENITJobs

Local-first, AI-assisted job and internship search companion for ENIT students.

- Collect offers from public job boards (Greenhouse, Lever, Ashby, RSS) or paste any posting.
- Score each offer against your CV on five dimensions with a local model (Ollama), with an offline heuristic fallback.
- Tailor your CV and cover letter to the posting — French or English — without inventing facts.
- Track applications from evaluation to offer, prepare interviews, and get a skills plan.

Everything runs on your machine: Next.js + SQLite (`node:sqlite`), no account, no server.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. Optional: install [Ollama](https://ollama.com) and `ollama pull llama3.1` for AI features.

## Scripts

- `npm run dev` — development server
- `npm run build && npm start` — production
- `npm test` — unit tests
- `npm run typecheck` — TypeScript
