"use client";

// "PPM 160-2 §5.A" — clicking one highlights the matching source card.
export default function CiteChip({ citation, active, onSelect }) {
  const base =
    "inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs leading-5 transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const look = active
    ? "border-accent bg-accent text-white"
    : "border-line bg-white text-accent hover:border-accent";
  return (
    <button type="button" onClick={() => onSelect(citation.id)} className={`${base} ${look}`}>
      PPM {citation.docId} §{citation.clause}
    </button>
  );
}
