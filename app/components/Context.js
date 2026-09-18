"use client";
import { useState } from "react";
import { Icon } from "./Icons";
import Pip from "./Pip";
import { format, phrase } from "@/lib/situations";

// The quick picks that personalise a situation (lib/situations.js). Two modes:
//   setup — right after a card is picked: Pip asks for a bit more, every pick is shown, "Get my answer"
//           sends the composed question and "Skip, just ask" sends the preset as is.
//   edit  — above an answer: one line summarising the picks; "Change" opens the controls, and "Update
//           answer" appears only once a pick differs from what was answered (nothing is sent on its own —
//           every distinct combination is one model call, so the student decides when to re-ask).
export default function Context({ situation, values, onChange, onSubmit, onSkip, mode = "setup", dirty = false, loading = false }) {
  const [open, setOpen] = useState(false);
  const expanded = mode === "setup" || open || dirty;
  const set = (id, v) => onChange({ ...values, [id]: v });

  return (
    <section
      className="rounded-2xl border border-line bg-card shadow-card"
      aria-labelledby="context-heading"
    >
      <div className={`flex items-start gap-4 ${mode === "setup" ? "p-5 sm:p-6" : "px-5 py-4 sm:px-6"}`}>
        {mode === "setup" && (
          <div className="pop hidden shrink-0 sm:block" style={{ "--i": 0 }}>
            <Pip pose="happy" className="size-16" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="context-heading" className={`font-semibold ${mode === "setup" ? "text-xl sm:text-2xl" : "text-base"}`}>
              {mode === "setup" ? "Tell Pip a bit more" : "Your situation"}
            </h2>
            {mode === "setup" ? (
              <p className="text-sm text-muted">Quick picks, no typing. Change them any time.</p>
            ) : (
              !expanded && (
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="inline-flex min-h-9 items-center gap-1 rounded text-sm font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
                >
                  <Icon name="pen" className="size-4" />
                  Change
                </button>
              )
            )}
          </div>

          {!expanded && (
            <p className="mt-1 text-sm text-muted">
              {situation.context.map((c) => sentenceCase(phrase(c, values[c.id]))).join(" · ")}
            </p>
          )}

          {expanded && (
            <div className={`grid gap-y-4 ${mode === "setup" ? "mt-5" : "mt-4"}`}>
              {situation.context.map((c, i) => (
                <div key={c.id} className="rise" style={{ "--i": mode === "setup" ? i + 1 : 0 }}>
                  <p className="text-sm font-medium" id={`ctx-${c.id}-label`}>
                    {c.label}
                  </p>
                  {c.kind === "range" ? (
                    <Range c={c} value={values[c.id]} onChange={(v) => set(c.id, v)} />
                  ) : (
                    <div role="group" aria-labelledby={`ctx-${c.id}-label`} className="mt-2 flex flex-wrap gap-2">
                      {(c.kind === "toggle"
                        ? [
                            { value: false, label: "No" },
                            { value: true, label: "Yes" },
                          ]
                        : c.options
                      ).map((o) => (
                        <Chip key={String(o.value)} pressed={values[c.id] === o.value} onClick={() => set(c.id, o.value)}>
                          {o.label}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2">
                {(mode === "setup" || dirty) && (
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={loading}
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-5 font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-60"
                  >
                    {mode === "setup" ? "Get my answer" : "Update answer"}
                    <Icon name="arrow" className="size-5" />
                  </button>
                )}
                {mode === "setup" ? (
                  <button
                    type="button"
                    onClick={onSkip}
                    disabled={loading}
                    className="inline-flex min-h-11 items-center rounded text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
                  >
                    Skip, just ask
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-11 items-center rounded text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
                  >
                    {dirty ? "Keep the current answer" : "Done"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Chip({ pressed, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="inline-flex min-h-10 items-center rounded-full border border-line bg-paper px-3.5 text-sm font-medium text-ink transition-colors hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-white"
    >
      {children}
    </button>
  );
}

// A slider with the value beside it; the accessible value is the same phrase that goes into the question.
function Range({ c, value, onChange }) {
  const v = Number(value);
  return (
    <div className="mt-2 flex items-center gap-4">
      <input
        type="range"
        min={c.min}
        max={c.max}
        step={c.step}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-labelledby={`ctx-${c.id}-label`}
        aria-valuetext={phrase(c, v)}
        className="h-2 w-full max-w-md cursor-pointer accent-ink"
      />
      <output className="min-w-16 rounded-lg bg-gold-tint px-2.5 py-1 text-center text-sm font-semibold tabular-nums" aria-hidden="true">
        {format(c, v)}
      </output>
    </div>
  );
}

const sentenceCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);
