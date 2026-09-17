"use client";
import { useState } from "react";
import CiteChip from "./CiteChip";
import Markdown from "./Markdown";

const cardId = (id) => `source-${id}`;

// "2017-10-05" → "Oct 5, 2017" without a timezone shift (UTC in, UTC out).
function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

const eyebrow = "mb-3 font-mono text-xs uppercase tracking-wider text-muted";

export default function Result({ data, docs }) {
  const [activeId, setActiveId] = useState(null);
  const { answer = "", citations = [], refused, reason } = data;

  // The product promise is "cited or refused". An empty or uncited answer is shown as a refusal.
  if (refused || !answer.trim() || citations.length === 0) {
    return <Refused reason={reason || "The service returned an answer without a policy citation."} docs={docs} />;
  }

  function select(id) {
    setActiveId(id);
    document.getElementById(cardId(id))?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
      <article>
        <h2 className={eyebrow}>Answer</h2>
        <div className="space-y-4 text-lg leading-relaxed">
          <Markdown text={answer} citations={citations} activeId={activeId} onSelect={select} />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-sm text-muted">
          <span>Cites</span>
          {citations.map((c) => (
            <CiteChip key={c.id} citation={c} active={c.id === activeId} onSelect={select} />
          ))}
        </div>
      </article>

      <aside>
        <h2 className={eyebrow}>Sources — official policy text</h2>
        <ol className="space-y-4">
          {citations.map((c) => (
            <SourceCard key={c.id} c={c} active={c.id === activeId} />
          ))}
        </ol>
      </aside>
    </div>
  );
}

function SourceCard({ c, active }) {
  return (
    <li
      id={cardId(c.id)}
      className={`rounded border bg-white p-5 ${active ? "border-accent ring-2 ring-accent" : "border-line"}`}
    >
      <p className="font-mono text-xs text-muted">
        PPM {c.docId} · Clause {c.clause}
      </p>
      <h3 className="mt-1 font-semibold leading-snug">{c.docTitle}</h3>
      <p className="mt-1 text-xs tracking-wide text-muted">{c.heading}</p>
      <blockquote className="my-4 border-l-2 border-accent pl-4 text-sm leading-relaxed">
        “{c.quote}”
      </blockquote>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <span className="text-muted">Effective {formatDate(c.effectiveDate)}</span>
        <a
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent hover:underline"
        >
          Open official policy ↗
        </a>
      </div>
    </li>
  );
}

function Refused({ reason, docs }) {
  return (
    <section className="max-w-2xl rounded border border-line bg-white p-6">
      <h2 className="text-xl font-semibold">Standing can&apos;t answer that from the policies it has.</h2>
      <p className="mt-2 text-muted">{reason}</p>
      <p className="mt-5 text-sm text-muted">It covers these {docs.length} UCSD documents:</p>
      <ul className="mt-2 space-y-1 text-sm">
        {docs.map((d) => (
          <li key={d.docId}>
            <a href={d.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent hover:underline">
              <span className="font-mono">PPM {d.docId}</span> — {d.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
