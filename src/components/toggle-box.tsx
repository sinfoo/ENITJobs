"use client";

import { useOptimistic, useTransition } from "react";
import { toggleSource } from "@/app/actions/sources";

export function ToggleBox({ id, enabled, label }: { id: number; enabled: boolean; label: string }) {
  const [pending, start] = useTransition();
  const [on, setOn] = useOptimistic(enabled);
  return (
    <input
      type="checkbox"
      checked={on}
      disabled={pending}
      aria-label={label}
      className="accent-[var(--accent)] size-5"
      onChange={(e) => {
        const v = e.target.checked;
        start(async () => {
          setOn(v);
          await toggleSource(id, v);
        });
      }}
    />
  );
}
