export function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="16" fill="var(--accent)" />
      <g stroke="var(--accent-ink)" strokeWidth="5" strokeLinecap="round">
        <line x1="17" y1="20" x2="47" y2="20" />
        <line x1="17" y1="32" x2="39" y2="32" />
        <line x1="17" y1="44" x2="31" y2="44" />
      </g>
      <circle cx="45" cy="44" r="4.5" fill="#f6c453" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Logo />
      <span className="display text-xl leading-none" style={{ fontVariationSettings: '"opsz" 36, "SOFT" 60' }}>
        ENIT<span className="italic text-accent">Jobs</span>
      </span>
    </span>
  );
}
