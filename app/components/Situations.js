"use client";
import { Icon } from "./Icons";

// Eight things that happen to students. The card shows an icon, a short title and — from lg, where the
// cards are wide — a one-line muted hint; the full question is the card's preset, sent on click.
export const SITUATIONS = [
  { icon: "gavel", title: "I got a conduct notice", hint: "What happens next, and your rights", q: "What happens after a conduct complaint is filed against me, and what are my rights?" },
  { icon: "cap", title: "I want to appeal a grade", hint: "When you can, and the steps", q: "My professor graded me unfairly. Can I appeal my grade and how?" },
  { icon: "lock", title: "Someone wants my grades", hint: "Parents, employers, anyone", q: "Can UCSD share my grades with my parents without my permission?" },
  { icon: "megaphone", title: "I want to hold a protest", hint: "Where, when, and the rules", q: "Can I organize a protest on campus, and what rules apply?" },
  { icon: "car", title: "I got a parking ticket", hint: "How to appeal a citation", q: "How do I appeal a campus parking citation?" },
  { icon: "hand", title: "I'm being harassed", hint: "Where to report, what happens", q: "What can I do if I am being sexually harassed by another student?" },
  { icon: "alert", title: "I'm on academic probation", hint: "What it means, how to get off it", q: "I'm on academic probation (academic notice). What does it mean and how do I get off it?" },
  { icon: "wallet", title: "I need to withdraw", hint: "Refunds and what you owe", q: "If I withdraw from the quarter, do I get my fees refunded?" },
];

// `first` is the --i of the first card, so the stagger continues from whatever rose before it.
export default function Situations({ onAsk, first = 0 }) {
  return (
    <section className="mt-12 sm:mt-16" aria-labelledby="situations">
      <h2 id="situations" className="rise text-xl font-semibold tracking-tight" style={{ "--i": first }}>
        Something happened? You&rsquo;ve got options.
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 sm:gap-4">
        {SITUATIONS.map((s, i) => (
          <li key={s.title} className="rise" style={{ "--i": first + 1 + i }}>
            <button
              type="button"
              onClick={() => onAsk(s.q)}
              aria-label={`${s.title} — ask about it`}
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
