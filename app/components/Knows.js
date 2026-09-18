import { Icon } from "./Icons";

// The policies Standing reads, each linking to the official text. Rendered from data/docs.json.
// `wide` drops the home page's 64rem cap so the strip shares the answer page's full-width edges.
export default function Knows({ docs, clauses, wide = false }) {
  return (
    <section
      id="knows"
      className={`mt-16 scroll-mt-6 ${wide ? "" : "mx-auto max-w-5xl"}`}
      aria-labelledby="knows-heading"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="knows-heading" className="text-sm font-semibold uppercase tracking-wider text-muted">
          What Standing knows
        </h2>
        <p className="text-sm text-muted">
          {docs.length} official policies · {clauses} clauses
        </p>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {docs.map((d) => (
          <li key={d.docId}>
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`PPM ${d.docId} — ${d.title}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-ink"
            >
              <span className="font-mono text-xs text-muted">{d.docId}</span>
              {d.name}
              <Icon name="external" className="size-3.5 text-muted" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
