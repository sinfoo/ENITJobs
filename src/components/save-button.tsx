"use client";

import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

/** Submit button that shows pending + a brief "saved" confirmation. */
export function SaveButton({ label, savedLabel, className = "btn btn-primary" }: { label: string; savedLabel: string; className?: string }) {
  const { pending } = useFormStatus();
  const [saved, setSaved] = useState(false);
  const [wasPending, setWasPending] = useState(false);
  useEffect(() => {
    if (wasPending && !pending) {
      setSaved(true);
      const id = setTimeout(() => setSaved(false), 1800);
      return () => clearTimeout(id);
    }
    setWasPending(pending);
  }, [pending, wasPending]);
  return (
    <button type="submit" className={className} disabled={pending} aria-live="polite">
      {pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : saved ? <Check size={16} aria-hidden="true" /> : null}
      {saved ? savedLabel : label}
    </button>
  );
}
