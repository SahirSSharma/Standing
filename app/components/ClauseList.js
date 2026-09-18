"use client";
import { useState } from "react";
import { Icon } from "./Icons";

// A policy's clauses under the manual's own section headings: one <details> per section (the first
// two open), a section list down the left from lg, and one filter box that hides every clause that
// doesn't mention the word and highlights it where it does. One client component for the whole list —
// 160-10 has 247 clauses, so the rows are plain elements, not components.

import sentenceCase from "./sentenceCase";
// An unnumbered heading's section is a slug of the heading itself ("EXHIBIT A" → "EXHIBIT-A", or a
// path under one, "POLICY-STATEMENT.B"); only a printed label ("5", "VI.II", "3.1") is worth showing
// next to the heading. The clause rows keep their full labels, matching the answer page's chips.
const slug = (heading) => heading.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
const printed = (section) => /^[A-Za-z0-9]{1,5}(\.[A-Za-z0-9]{1,5})*$/.test(section);
function titleOf(g) {
  const first = g.clauses[0].clause;
  const last = g.clauses[g.clauses.length - 1].clause;
  if (!g.heading) return { label: first === last ? `§${first}` : `§${first} – §${last}`, text: "Clauses" };
  const label = g.section && g.section !== slug(g.heading) && printed(g.section) ? `§${g.section}` : "";
  return { label, text: sentenceCase(g.heading) };
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function highlight(text, re) {
  if (!re) return text;
  return text.split(re).map((part, i) =>
    i % 2 ? (
      <mark key={i} className="rounded bg-gold-tint px-0.5 text-ink">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function ClauseList({ groups, total }) {
  const [query, setQuery] = useState("");
  const q = query.trim();
  const re = q ? new RegExp(`(${escapeRe(q)})`, "gi") : null;
  const test = q ? new RegExp(escapeRe(q), "i") : null;

  const shown = groups.map((g) => {
    const clauses = g.clauses.map((c) => ({ ...c, hit: !test || test.test(c.text) || test.test(c.clause) }));
    return { ...g, clauses, hits: clauses.filter((c) => c.hit).length };
  });
  const matches = shown.reduce((n, g) => n + g.hits, 0);

  return (
    <div>
      <div className="relative max-w-xl">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a word in this policy"
          aria-label="Find a word in this policy"
          autoComplete="off"
          className="h-12 w-full rounded-2xl border border-line bg-card pl-12 pr-4 shadow-field placeholder:text-soft"
        />
      </div>
      <p role="status" aria-live="polite" className="mt-2 text-sm text-muted">
        {q
          ? `${matches} of ${total} clauses mention “${q}”`
          : `${total} clauses in ${groups.length} ${groups.length === 1 ? "section" : "sections"}`}
      </p>

      <div className="mt-6 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
        {/* Scrolls on its own when a long policy's section list outgrows the viewport (160-2 has 26). */}
        <nav
          aria-label="Sections"
          className="-mx-2 hidden px-2 lg:sticky lg:top-6 lg:block lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Sections</p>
          <ol className="mt-3 pb-2 text-sm">
            {shown.map((g) => {
              const { label, text } = titleOf(g);
              return (
                <li key={g.key} hidden={!!q && g.hits === 0}>
                  <a
                    href={`#${g.key}`}
                    onClick={() => {
                      document.getElementById(g.key).open = true;
                    }}
                    className="flex min-h-11 items-center gap-2 rounded-lg px-2 py-1 leading-snug transition-colors hover:bg-card"
                  >
                    <span className="flex min-w-0 flex-1 items-baseline gap-2">
                      {label && <span className="shrink-0 font-mono text-xs text-muted">{label}</span>}
                      <span className="min-w-0 wrap-anywhere">{text}</span>
                    </span>
                    {q && <span className="shrink-0 font-mono text-xs text-muted">{g.hits}</span>}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-w-0">
          {shown.map((g, i) => {
            const { label, text } = titleOf(g);
            return (
              <details
                key={g.key}
                id={g.key}
                open={q ? g.hits > 0 : i < 2}
                hidden={!!q && g.hits === 0}
                className="group rise mb-3 scroll-mt-6 rounded-2xl border border-line bg-card shadow-card"
                style={{ "--i": Math.min(i, 8) }}
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-3 [&::-webkit-details-marker]:hidden">
                  <Icon name="chevron" className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
                  <span className="min-w-0 flex-1 leading-snug">
                    {label && <span className="mr-2 font-mono text-sm text-muted wrap-anywhere">{label}</span>}
                    <span className="font-semibold">{text}</span>
                    {/* While closed, the first clause's opening words, so a long policy can be scanned without opening every section. */}
                    <span className="mt-0.5 hidden truncate text-sm text-muted group-open:hidden sm:block">
                      {g.clauses[0].text}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted tabular-nums">
                    {q ? `${g.hits} of ${g.clauses.length}` : g.clauses.length}
                  </span>
                </summary>
                {/* A rule between visible rows only, so filtered-out rows don't leave double lines. */}
                <ol className="border-t border-line px-5 [&>li:not([hidden])~li:not([hidden])]:border-t">
                  {g.clauses.map((c) => (
                    <li
                      key={c.id}
                      hidden={!c.hit}
                      className="grid grid-cols-[minmax(3rem,auto)_minmax(0,1fr)] gap-x-4 border-line py-3.5"
                    >
                      <span className="pt-0.5 font-mono text-sm text-muted tabular-nums wrap-anywhere">§{c.clause}</span>
                      <p className="leading-relaxed wrap-anywhere">{highlight(c.text, re)}</p>
                    </li>
                  ))}
                </ol>
              </details>
            );
          })}
          {q && matches === 0 && (
            <p className="rounded-2xl border border-line bg-card px-5 py-4 text-muted">
              No clause in this policy mentions “{q}”. Try another word.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
