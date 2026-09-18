"use client";
import { useEffect, useState } from "react";
import { Icon } from "./Icons";

// Timer-driven feedback for the 5–15 s wait. The step labels advance on timers; the bar is a CSS
// animation, so the page keeps moving even while nothing has come back yet.
const STEPS = [
  { at: 0, label: (n) => `Choosing which of the ${n} policies to read` },
  { at: 3000, label: () => "Reading them clause by clause" },
  { at: 7000, label: () => "Checking every citation" },
];
const SLOW_AT = 20000; // past the usual range: say so instead of sitting still

export default function Progress({ documents = 7, question }) {
  const [step, setStep] = useState(0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timers = STEPS.slice(1).map((s, i) => setTimeout(() => setStep(i + 1), s.at));
    timers.push(setTimeout(() => setSlow(true), SLOW_AT));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="rounded-2xl border border-line bg-card p-6 shadow-card sm:p-8">
      <div className="flex flex-col gap-y-1 sm:flex-row sm:items-baseline sm:gap-x-6">
        <p className="min-w-0 truncate text-lg font-semibold sm:flex-1" title={question}>
          Answering: {question}
        </p>
        <p className="shrink-0 text-sm text-muted">
          {slow ? "Still working — a slow answer can take up to a minute" : "usually takes 5–15 seconds"}
        </p>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gold-tint" aria-hidden="true">
        <div className="progress-fill h-full rounded-full bg-gold" />
      </div>
      <ol className="mt-5 space-y-2.5">
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li
              key={i}
              className={`flex items-center gap-3 ${current ? "font-medium" : done ? "text-muted" : "text-soft"}`}
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                  done ? "bg-ink text-white" : current ? "bg-gold" : "border border-line"
                }`}
              >
                {done && <Icon name="check" className="size-3" />}
                {current && <span className="progress-dot size-2 rounded-full bg-ink" />}
              </span>
              {s.label(documents)}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
