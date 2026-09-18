"use client";
import { Icon } from "./Icons";
import { SITUATIONS } from "@/lib/situations";

export { SITUATIONS };

// Eight things that happen to students (lib/situations.js). The card shows an icon, a short title and —
// from lg, where the cards are wide — a one-line muted hint. Picking one opens its quick picks (Context);
// the preset question is sent with the picks appended, or as is if the student skips them.
// `first` is the --i of the first card, so the stagger continues from whatever rose before it.
export default function Situations({ onPick, first = 0 }) {
  return (
    <section className="mt-12 sm:mt-16" aria-labelledby="situations">
      <h2 id="situations" className="rise text-xl font-semibold tracking-tight" style={{ "--i": first }}>
        Something happened? You&rsquo;ve got options.
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 sm:gap-4">
        {SITUATIONS.map((s, i) => (
          <li key={s.id} className="rise" style={{ "--i": first + 1 + i }}>
            <button
              type="button"
              onClick={() => onPick(s)}
              aria-label={`${s.title} — tell Pip more and ask`}
              className="group flex h-full min-h-11 w-full flex-col items-start gap-3 rounded-2xl border border-line bg-card p-4 text-left shadow-card transition-colors hover:border-ink sm:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-tint text-ink">
                <Icon name={s.icon} className="size-6" />
              </span>
              <span className="flex w-full items-end justify-between gap-2">
                <span className="min-w-0">
                  <span className="block font-semibold leading-snug group-hover:underline group-hover:decoration-gold group-hover:decoration-2 group-hover:underline-offset-4">
                    {s.title}
                  </span>
                  <span className="mt-1 hidden truncate text-sm text-muted lg:block">{s.hint}</span>
                </span>
                <Icon
                  name="arrow"
                  className="mb-0.5 size-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
