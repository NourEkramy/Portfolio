/** A centred fleuron between a pair of hairlines — the section break motif. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-rule opacity-60" />
      <svg viewBox="0 0 34 12" className="h-3 w-[34px] text-oxblood" fill="none">
        <path d="M17 1.5 19.4 6 17 10.5 14.6 6Z" fill="currentColor" opacity=".9" />
        <path d="M0 6h12M22 6h12" stroke="currentColor" strokeWidth="1" opacity=".55" />
        <circle cx="12.6" cy="6" r="1.1" fill="currentColor" opacity=".7" />
        <circle cx="21.4" cy="6" r="1.1" fill="currentColor" opacity=".7" />
      </svg>
      <span className="h-px flex-1 bg-rule opacity-60" />
    </div>
  );
}

/** Eyebrow label with a leading rule, used above section headings. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-oxblood" aria-hidden="true" />
      <span className="label text-oxblood">{children}</span>
    </div>
  );
}

/** Wax-seal style number badge for ordered lists. */
export function Numeral({ value }: { value: number | string }) {
  return (
    <span
      className="grid size-8 shrink-0 place-items-center rounded-full border border-oxblood font-mono text-[0.7rem] text-oxblood"
      aria-hidden="true"
    >
      {typeof value === "number" ? String(value).padStart(2, "0") : value}
    </span>
  );
}
