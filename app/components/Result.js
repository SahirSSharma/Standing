"use client";
import { useState } from "react";
import { Icon } from "./Icons";
import Markdown, { plainText, splitLead } from "./Markdown";
import Refused from "./Refused";

const cardId = (id) => `source-${id}`;

// The answer page's two columns from xl up: answer left, sources right. Ask.js puts the question
// form and the loading / error cards in the same left column so every block shares one left edge.
export const COLS = "xl:grid-cols-[minmax(0,62fr)_minmax(0,38fr)] xl:gap-10";

// "2017-10-05" → "Oct 5, 2017" without a timezone shift (UTC in, UTC out).
function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

// Section headings arrive in the manual's all-caps ("DISCLOSURE OF DIRECTORY INFORMATION"); shown in
// sentence case with acronyms and names kept, and a trailing "(FERPA)"-style parenthetical dropped.
const CASED = { uc: "UC", vcsa: "VCSA", ferpa: "FERPA" };
function sentenceCase(heading) {
  const words = heading.toLowerCase().replace(/\s*\([^)]*\)/g, "").replace(/:$/, "").split(/\s+/);
  return words
    .map((w, i) => CASED[w] ?? (i === 0 || words[i - 1] === "exhibit" ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ")
    .replace("san diego", "San Diego")
    .replace("family educational rights and privacy act", "Family Educational Rights and Privacy Act");
}

const eyebrow = "text-sm font-semibold uppercase tracking-wider text-muted";

export default function Result({ data, docs, onAsk, onReset }) {
  const [pinnedId, setPinnedId] = useState(null); // clicked chip: stays highlighted
  const [hoverId, setHoverId] = useState(null); // hovered / focused chip: highlighted while it lasts
  const { answer = "", citations = [], refused } = data;

  // The product promise is "cited or refused". An empty or uncited answer is shown as a refusal.
  if (refused || !answer.trim() || citations.length === 0) {
    return (
      <div className={`grid grid-cols-[minmax(0,1fr)] ${COLS}`}>
        <Refused docs={docs} onAsk={onAsk} />
      </div>
    );
  }

  const nameOf = new Map(docs.map((d) => [d.docId, d.name]));
  const { lead, rest } = splitLead(answer);
  const activeId = hoverId ?? pinnedId;

  function select(id) {
    setPinnedId(id);
    document.getElementById(cardId(id))?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  const md = { citations, activeId, onSelect: select, onHover: setHoverId };

  // Below xl the three blocks stack in DOM order — answer, sources, then the actions — so the quoted
  // clauses come before "Copy answer". From xl the sources column spans both rows on the right and
  // the actions sit directly under the answer.
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)] gap-8 ${COLS} xl:grid-rows-[auto_1fr]`}>
      <article className="xl:col-start-1 xl:row-start-1">
        {lead ? (
          <div className="rounded-2xl border border-line border-l-4 border-l-gold bg-card px-6 py-5 shadow-card">
            <h2 className={eyebrow}>Short answer</h2>
            <p className="mt-1.5 text-xl font-semibold leading-snug sm:text-2xl">
              <Markdown text={lead} inline {...md} />
            </p>
          </div>
        ) : (
          <h2 className={eyebrow}>Answer</h2>
        )}
        <div className="mt-6 space-y-4 text-[1.0625rem] leading-[1.7] sm:text-lg sm:leading-[1.7]">
          <Markdown text={rest} {...md} />
        </div>
      </article>

      <aside
        className="xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:sticky xl:top-6 xl:self-start"
        aria-labelledby="sources-heading"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="sources-heading" className={eyebrow}>
            Sources
          </h2>
          <p className="text-sm text-muted">
            {citations.length} {citations.length === 1 ? "clause" : "clauses"} quoted from official policy
          </p>
        </div>
        <p className="mt-1 text-sm text-muted">
          Each from the UCSD Policy &amp; Procedure Manual (PPM), with its clause and effective date.
        </p>
        <ol className="mt-3 space-y-3">
          {citations.map((c) => (
            <SourceCard key={c.id} c={c} name={nameOf.get(c.docId)} active={c.id === activeId} />
          ))}
        </ol>
      </aside>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-5 xl:col-start-1 xl:row-start-2 xl:self-start">
        <CopyButton text={plainText(answer)} />
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center rounded font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
        >
          Ask another question
        </button>
      </div>
    </div>
  );
}

// Titled by clause ("§3.D · Definitions") so a card can be matched to its chip at a glance; the
// policy id, its name and the effective date are the second line.
function SourceCard({ c, name, active }) {
  return (
    <li
      id={cardId(c.id)}
      className={`scroll-mt-6 rounded-2xl border bg-card p-5 shadow-card transition-[border-color,box-shadow] ${
        active ? "border-ink ring-2 ring-gold" : "border-line"
      }`}
    >
      <h3 className="leading-snug">
        <span className="font-semibold">§{c.clause}</span>
        {c.heading && <span> · {sentenceCase(c.heading)}</span>}
      </h3>
      <p className="mt-1 text-sm text-muted">
        <span className="font-mono text-xs">PPM {c.docId}</span> · {name || c.docTitle} · Effective{" "}
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

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (insecure context); the button simply does nothing */
    }
  }
  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-card px-4 text-sm font-medium transition-colors hover:border-ink"
      >
        <Icon name={copied ? "check" : "copy"} className="size-4" />
        {copied ? "Copied" : "Copy answer"}
      </button>
      {/* Spoken confirmation; the button's own label change is visual only. */}
      <span role="status" className="sr-only">
        {copied ? "Answer copied to clipboard" : ""}
      </span>
    </>
  );
}
