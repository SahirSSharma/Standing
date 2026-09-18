"use client";
import { EXAMPLES } from "./Examples";
import { Icon } from "./Icons";

// The manual's own index (sections 100–551); the legacy adminrecords.ucsd.edu URL only redirects here.
const INDEX_URL = "https://secure4.compliancebridge.com/ucsd/public/index.php?fuseaction=app.main";

export default function Refused({ docs, onAsk }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-6 shadow-card sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-tint text-ink">
          <Icon name="compass" className="size-6" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold leading-snug sm:text-2xl">
            Not covered by the {docs.length} policies Standing knows
          </h2>
          <p className="mt-2 text-muted">
            Standing only answers from these policies. Try one of these, or browse the full policy manual.
          </p>
        </div>
      </div>

      <p className="mt-7 text-sm font-semibold uppercase tracking-wider text-muted">Questions Standing can answer</p>
      <ul className="mt-3 grid gap-2">
        {EXAMPLES.slice(0, 3).map((ex) => (
          <li key={ex.q}>
            <button
              type="button"
              onClick={() => onAsk(ex.q)}
              className="group flex min-h-11 w-full items-center gap-3 rounded-xl border border-line px-4 py-2.5 text-left font-medium transition-colors hover:border-ink"
            >
              <Icon name={ex.icon} className="size-5 shrink-0 text-muted" />
              <span className="group-hover:underline group-hover:decoration-gold group-hover:decoration-2 group-hover:underline-offset-4">
                {ex.q}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <a
        href={INDEX_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex min-h-11 items-center gap-1.5 rounded font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
      >
        Browse the full UCSD policy manual
        <Icon name="external" className="size-4" />
      </a>
    </section>
  );
}
