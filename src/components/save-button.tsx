"use client";

import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Submit button that shows pending + a brief "saved" confirmation. */
export function SaveButton({ label, savedLabel, className = "btn btn-primary" }: { label: string; savedLabel: string; className?: string }) {
  const { pending } = useFormStatus();
  const [saved, setSaved] = useState(false);
  const wasPending = useRef(false);
  useEffect(() => {
    const was = wasPending.current;
    wasPending.current = pending;
    if (!was || pending) return;
    const show = setTimeout(() => setSaved(true), 0);
    const hide = setTimeout(() => setSaved(false), 1800);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [pending]);
  return (
    <button type="submit" className={className} disabled={pending} aria-live="polite">
      {pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : saved ? <Check size={16} aria-hidden="true" /> : null}
      {saved ? savedLabel : label}
    </button>
  );
}
