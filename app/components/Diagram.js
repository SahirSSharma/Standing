"use client";
import { useState } from "react";
import { Icon } from "./Icons";
import Markdown from "./Markdown";

// The answer as a picture before it is a text: a numbered timeline when the policy is a process
// (a single step is still shown, as one node), and two columns — what they can do, what you can do —
// when it is a set of rights. Both when the answer has both. Nodes pop and lines grow in with the
// page's stagger.
const LIST_LIMIT = 4; // items shown per column before "Show N more"
const STEP_LIMIT = 6; // timeline nodes shown before "Show N more"
const ROW = 4; // most nodes per horizontal row: fewer and every label keeps ~170 px of width

export default function Diagram({ steps = [], theyCan = [], youCan = [], md, first = 0 }) {
  const timeline = steps.length >= 1;
  const columns = theyCan.length > 0 || youCan.length > 0;
  if (!timeline && !columns) return null;
  return (
    <div className="space-y-6">
      {timeline && <Timeline steps={steps} md={md} first={first} />}
      {columns && <Columns theyCan={theyCan} youCan={youCan} md={md} first={first + (timeline ? steps.length : 0)} />}
    </div>
  );
}

function Timeline({ steps, md, first }) {
  const [open, setOpen] = useState(false);
  const shown = open ? steps : steps.slice(0, STEP_LIMIT);
  const hidden = steps.length - shown.length;
  // From lg up the nodes sit on horizontal lines in balanced rows (5 steps → 3 + 2, never 4 + 1);
  // below lg they stack down a vertical line. Both layouts are in the DOM once, switched by breakpoint.
  const perRow = Math.ceil(shown.length / Math.ceil(shown.length / ROW));
  const rows = [];
  for (let i = 0; i < shown.length; i += perRow) rows.push(shown.slice(i, i + perRow));
  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-card sm:p-6" aria-labelledby="steps-heading">
      <h2 id="steps-heading" className="text-sm font-semibold uppercase tracking-wider text-muted">
        Step by step
      </h2>

      {/* lg+: horizontal */}
      <div className="hidden lg:block">
        {rows.map((row, r) => (
          <div key={r} className="relative mt-5">
            {row.length > 1 && (
              <span
                aria-hidden="true"
                className="grow-x absolute top-5 h-0.5 bg-gold"
                style={{ left: `${50 / row.length}%`, right: `${50 / row.length}%`, "--i": first + r * perRow }}
              />
            )}
            <ol className="grid gap-x-4" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
              {row.map((step, k) => {
                const n = r * perRow + k;
                return (
                  <li key={n} className="relative flex min-w-0 flex-col items-center text-center">
                    <Node n={n + 1} i={first + n} />
                    <p className="rise mt-3 text-sm leading-snug wrap-break-word" style={{ "--i": first + n + 1 }}>
                      <Markdown text={step} inline {...md} />
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>

      {/* below lg: vertical */}
      <div className="relative mt-4 lg:hidden">
        {shown.length > 1 && (
          <svg aria-hidden="true" className="absolute left-5 top-5 h-[calc(100%-2.5rem)] w-0.5 overflow-visible">
            <line x1="1" y1="0" x2="1" y2="100%" stroke="var(--color-gold)" strokeWidth="2" pathLength="1" className="draw" style={{ "--i": first }} />
          </svg>
        )}
        <ol className="space-y-5">
          {shown.map((step, n) => (
            <li key={n} className="relative flex items-start gap-4">
              <Node n={n + 1} i={first + n} />
              <p className="rise min-w-0 flex-1 pt-2 leading-snug wrap-break-word" style={{ "--i": first + n + 1 }}>
                <Markdown text={step} inline {...md} />
              </p>
            </li>
          ))}
        </ol>
      </div>

      {hidden > 0 && <More n={hidden} what="steps" onClick={() => setOpen(true)} />}
    </section>
  );
}

function Node({ n, i }) {
  return (
    <span
      className="pop relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-base font-semibold text-white ring-4 ring-card"
      style={{ "--i": i }}
    >
      {n}
    </span>
  );
}

function Columns({ theyCan, youCan, md, first }) {
  const cols = [
    { icon: "landmark", title: "They can", items: theyCan },
    { icon: "hand", title: "You can", items: youCan },
  ].filter((c) => c.items.length > 0);
  return (
    <div className={`grid gap-4 ${cols.length === 2 ? "md:grid-cols-2" : ""}`}>
      {cols.map((c, k) => (
        <Column key={c.title} icon={c.icon} title={c.title} items={c.items} md={md} first={first + k * LIST_LIMIT} />
      ))}
    </div>
  );
}

function Column({ icon, title, items, md, first }) {
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, LIST_LIMIT);
  const hidden = items.length - shown.length;
  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-card" aria-label={title}>
      <h2 className="rise flex items-center gap-3" style={{ "--i": first }}>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-tint text-ink">
          <Icon name={icon} className="size-5" />
        </span>
        <span className="text-lg font-semibold">{title}</span>
      </h2>
      <ul className="mt-4 space-y-3">
        {shown.map((item, n) => (
          <li key={n} className="rise flex gap-3 leading-snug" style={{ "--i": first + n + 1 }}>
            <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold-deep" />
            <span className="min-w-0 wrap-break-word">
              <Markdown text={item} inline {...md} />
            </span>
          </li>
        ))}
      </ul>
      {hidden > 0 && <More n={hidden} what="" onClick={() => setOpen(true)} />}
    </section>
  );
}

function More({ n, what, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
    >
      Show {n} more{what ? ` ${what}` : ""}
      <Icon name="chevron" className="size-4" />
    </button>
  );
}
