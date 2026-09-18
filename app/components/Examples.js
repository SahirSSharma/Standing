"use client";
import { Icon } from "./Icons";

export const EXAMPLES = [
  { icon: "shield", label: "Records & privacy", q: "Can UCSD share my grades with my parents?" },
  { icon: "mail", label: "Official email", q: "Can UCSD email me official notices instead of mailing them?" },
  { icon: "scale", label: "Conduct process", q: "What happens after a conduct complaint is filed against me?" },
  { icon: "flag", label: "Grievances", q: "How do I file a grievance against a department?" },
  { icon: "users", label: "Student organizations", q: "What does a student organization need to do to be registered?" },
  { icon: "landmark", label: "Student governments", q: "Which student governments does UCSD officially recognize?" },
];

export default function Examples({ onAsk }) {
  return (
    <section className="mx-auto mt-10 max-w-5xl sm:mt-14" aria-labelledby="examples">
      <h2 id="examples" className="text-center text-sm font-semibold uppercase tracking-wider text-muted">
        Or start with one of these
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLES.map((ex) => (
          <li key={ex.q}>
            <button
              type="button"
              onClick={() => onAsk(ex.q)}
              className="group flex h-full w-full items-start gap-3.5 rounded-2xl border border-line bg-card p-4 text-left shadow-card transition-colors hover:border-ink"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-tint text-ink">
                <Icon name={ex.icon} className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted">{ex.label}</span>
                <span className="mt-0.5 block font-medium leading-snug group-hover:underline group-hover:decoration-gold group-hover:decoration-2 group-hover:underline-offset-4">
                  {ex.q}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
