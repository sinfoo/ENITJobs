"use client";

import Link from "next/link";
import { useOptimistic, useTransition, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { APP_STATES, type AppState } from "@/lib/types";
import type { ApplicationWithJob } from "@/lib/db";
import { moveApplication } from "@/app/actions/applications";
import { fmt } from "@/lib/i18n/dict";
import { ScoreRing, scoreLabel } from "./ui";

type Item = Pick<ApplicationWithJob, "id" | "status" | "updated_at" | "next_action_at"> & {
  title: string;
  company: string;
  score: number | null;
  job_id: number;
};

export function PipelineBoard({ items }: { items: Item[] }) {
  const { t } = useT();
  const [, start] = useTransition();
  const [optimistic, move] = useOptimistic(items, (state, { id, status }: { id: number; status: AppState }) =>
    state.map((x) => (x.id === id ? { ...x, status } : x)),
  );
  const [dragOver, setDragOver] = useState<AppState | null>(null);
  const [live, setLive] = useState("");

  const doMove = (item: Item, status: AppState) => {
    if (item.status === status) return;
    start(async () => {
      move({ id: item.id, status });
      await moveApplication(item.id, status);
      setLive(`${item.company}: ${t.application.changed} ${t.states[status]}`);
    });
  };

  return (
    <>
      <p className="sr-only" aria-live="polite">{live}</p>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x" role="list" aria-label={t.pipeline.board}>
        {APP_STATES.map((state) => {
          const col = optimistic.filter((x) => x.status === state);
          return (
            <section
              key={state}
              role="listitem"
              aria-labelledby={`col-${state}`}
              className={`snap-start shrink-0 w-[272px] rounded-2xl border p-2 transition-colors ${
                dragOver === state ? "border-accent bg-accent-soft/40" : "border-line bg-surface-2/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOver !== state) setDragOver(state);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const id = Number(e.dataTransfer.getData("text/plain"));
                const item = optimistic.find((x) => x.id === id);
                if (item) doMove(item, state);
              }}
            >
              <header className="flex items-center justify-between px-2 py-1.5">
                <h2 id={`col-${state}`} className="font-sans text-sm font-semibold tracking-wide uppercase text-ink-2">
                  {t.states[state]}
                </h2>
                <span className="mono text-xs text-muted" aria-label={fmt(t.pipeline.count, { n: col.length })}>
                  {col.length}
                </span>
              </header>
              <ul className="space-y-2 min-h-16">
                {col.map((item) => (
                  <li
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", String(item.id));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="card p-3 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-start gap-3">
                      {item.score !== null && <ScoreRing value={item.score} size={40} label={scoreLabel(t, item.score)} animate={false} />}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-wide font-semibold text-muted truncate">{item.company}</p>
                        <Link href={`/app/pipeline/${item.id}`} className="display text-base leading-snug hover:text-accent line-clamp-2">
                          {item.title}
                        </Link>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <label className="sr-only" htmlFor={`mv-${item.id}`}>
                        {t.pipeline.moveTo} — {item.company}
                      </label>
                      <select
                        id={`mv-${item.id}`}
                        className="input !py-1 !px-2 text-xs flex-1"
                        value={item.status}
                        onChange={(e) => doMove(item, e.target.value as AppState)}
                      >
                        {APP_STATES.map((s) => (
                          <option key={s} value={s}>{t.states[s]}</option>
                        ))}
                      </select>
                      <span className="mono text-[11px] text-muted shrink-0">
                        {fmt(t.pipeline.daysAgo, { n: Math.max(0, Math.round((Date.now() - new Date(item.updated_at + "Z").getTime()) / 86400000)) })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
