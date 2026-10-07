"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

/** Button that runs a server action with pending state and optional confirm. */
export function ActionButton({
  action,
  children,
  pendingLabel,
  confirm,
  className = "btn btn-secondary",
}: {
  action: () => Promise<unknown>;
  children: React.ReactNode;
  pendingLabel?: string;
  confirm?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      aria-busy={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          await action();
        });
      }}
    >
      {pending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
