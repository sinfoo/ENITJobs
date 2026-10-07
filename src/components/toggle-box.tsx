"use client";

import { useOptimistic, useTransition } from "react";
import { toggleSource } from "@/app/actions/sources";

export function ToggleBox({ id, enabled }: { id: number; enabled: boolean }) {
  const [pending, start] = useTransition();
  const [on, setOn] = useOptimistic(enabled);
  return (
    <input
      type="checkbox"
      checked={on}
      disabled={pending}
      className="accent-[var(--accent)]"
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
