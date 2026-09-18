"use client";
import { useState } from "react";
import { Icon } from "./Icons";

// "Draft a request": one call to /api/draft with the question, the answer and its citation ids;
// the letter comes back as plain text the student can copy and send. Rendered as a fragment so the
// button sits in the actions row and the letter (order-last, full width) wraps beneath it.
export default function Draft({ question, answer, citations }) {
  const [state, setState] = useState({ phase: "idle" }); // idle | loading | done | error

  async function write() {
    if (state.phase === "loading") return;
    setState({ phase: "loading" });
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, citations }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || typeof body?.letter !== "string") {
        setState({ phase: "error", status: res.status });
        return;
      }
      setState({ phase: "done", letter: body.letter });
    } catch {
      setState({ phase: "error" });
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={write}
        disabled={state.phase === "loading"}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-60"
      >
        <Icon name="pen" className="size-4" />
        Draft a request
      </button>

      {state.phase === "loading" && (
        <p className="order-last flex w-full items-center gap-3 text-muted" role="status">
          <span className="progress-dot size-2.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
          Writing your request… usually 5–10 seconds
        </p>
      )}

      {state.phase === "error" && (
        <div className="order-last flex w-full flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-line bg-card px-5 py-4 shadow-card">
          <p className="min-w-0 flex-1 font-medium">
            {state.status === 503
              ? "Standing’s writing service is busy — try again in a moment."
              : "The request couldn’t be written. Nothing was lost."}
          </p>
          <button
            type="button"
            onClick={write}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-card px-4 text-sm font-medium transition-colors hover:border-ink"
          >
            <Icon name="retry" className="size-4" />
            Retry
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <section className="pop order-last w-full rounded-2xl border border-line bg-card p-5 shadow-card sm:p-6" aria-labelledby="draft-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="draft-heading" className="text-sm font-semibold uppercase tracking-wider text-muted">
              Your request
            </h2>
            <CopyButton text={state.letter} label="Copy request" copied="Copied" status="Request copied to clipboard" />
          </div>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed wrap-break-word">{state.letter}</p>
          <p className="mt-4 border-t border-line pt-3 text-sm text-muted">
            Check the names and dates before you send it. Not legal advice.
          </p>
        </section>
      )}
    </>
  );
}

// Copies `text` and says so for two seconds; the spoken confirmation is separate because the label
// change is visual only. Shared with Result's "Copy answer".
export function CopyButton({ text, label, copied, status }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
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
        <Icon name={done ? "check" : "copy"} className="size-4" />
        {done ? copied : label}
      </button>
      <span role="status" className="sr-only">
        {done ? status : ""}
      </span>
    </>
  );
}
