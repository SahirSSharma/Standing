"use client";

// "PPM 160-2 §8.A" — hovering or focusing one highlights its source card while it lasts; clicking
// keeps it highlighted and scrolls to it. The invisible ::before pad gives the pill a 44 px tap
// target without growing the visual box.
export default function CiteChip({ citation, active, onSelect, onHover }) {
  const base =
    "relative inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.8125rem] font-medium leading-5 tabular-nums transition-colors " +
    "before:absolute before:-inset-x-1 before:-inset-y-3 before:content-['']";
  const look = active
    ? "border-ink bg-ink text-white"
    : "border-gold/70 bg-gold-tint text-ink hover:border-ink";
  return (
    <button
      type="button"
      onClick={() => onSelect(citation.id)}
      onMouseEnter={() => onHover?.(citation.id)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(citation.id)}
      onBlur={() => onHover?.(null)}
      className={`${base} ${look}`}
      aria-label={`Policy ${citation.docId}, clause ${citation.clause}`}
    >
      PPM {citation.docId} §{citation.clause}
    </button>
  );
}
