"use client";
import CiteChip from "./CiteChip";
import { Icon } from "./Icons";

export const cardId = (id) => `source-${id}`;

// "2017-10-05" → "Oct 5, 2017" without a timezone shift (UTC in, UTC out).
function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

import sentenceCase from "./sentenceCase";
// The clauses the answer came from: a row of chips first, the quoted cards on demand. Clicking any
// chip on the page (Result's select) opens the cards and highlights the one it points at.
export default function Sources({ citations, activeId, open, onToggle, onSelect, onHover, first = 0 }) {
  const n = citations.length;
  const clauses = `${n} ${n === 1 ? "clause" : "clauses"}`;
  return (
    <section aria-labelledby="sources-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="sources-heading" className="text-sm font-semibold uppercase tracking-wider text-muted">
          Sources
        </h2>
        <p className="text-sm text-muted">{clauses} quoted from official policy</p>
      </div>
      <ul className="rise mt-3 flex flex-wrap gap-2" style={{ "--i": first }}>
        {citations.map((c) => (
          <li key={c.id}>
            <CiteChip citation={c} active={c.id === activeId} onSelect={onSelect} onHover={onHover} />
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="source-cards"
        className="rise mt-2 inline-flex min-h-11 items-center gap-1.5 rounded font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
        style={{ "--i": first + 1 }}
      >
        {open ? `Hide the ${clauses}` : `See the ${clauses} this came from`}
        <Icon name="chevron" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ol id="source-cards" className="mt-3 space-y-3">
          {citations.map((c, i) => (
            <SourceCard key={c.id} c={c} active={c.id === activeId} i={i} />
          ))}
        </ol>
      )}
    </section>
  );
}

// Titled by clause ("§3.D · Definitions") so a card can be matched to its chip at a glance; the
// policy label, its name and the effective date are the second line.
function SourceCard({ c, active, i }) {
  return (
    <li
      id={cardId(c.id)}
      className={`rise scroll-mt-6 rounded-2xl border bg-card p-5 shadow-card transition-[border-color,box-shadow] ${
        active ? "border-ink ring-2 ring-gold" : "border-line"
      }`}
      style={{ "--i": i }}
    >
      <h3 className="leading-snug">
        <span className="font-semibold">§{c.clause}</span>
        {c.heading && <span> · {sentenceCase(c.heading)}</span>}
      </h3>
      <p className="mt-1 text-sm text-muted">
        <span className="font-medium">{c.label || `PPM ${c.docId}`}</span> · {c.docName || c.docTitle} · Effective{" "}
        {formatDate(c.effectiveDate)}
      </p>
      <blockquote className="mt-3 rounded-xl border-l-4 border-gold bg-gold-tint px-4 py-3 text-[0.95rem] leading-relaxed wrap-anywhere">
        “{c.quote}”
      </blockquote>
      <a
        href={c.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
      >
        Read the official policy
        <Icon name="external" className="size-3.5" />
      </a>
    </li>
  );
}
