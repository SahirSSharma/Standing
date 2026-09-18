import Link from "next/link";
import { Icon } from "../components/Icons";
import { areasWithDocs, dateBadge, totals } from "@/lib/library";

export const metadata = {
  title: "Policies Standing knows — Standing",
  description:
    "Every official UCSD policy Standing can quote, grouped by area: records, conduct, grades, speech, safety, and money — clause by clause.",
};

// The library: one section per life area, a card per policy. Everything is read from data/ at
// build time; cards rise in staggered per area so the first screen builds itself in front of the reader.
export default function Policies() {
  const areas = areasWithDocs();
  const { docs, clauses } = totals();

  return (
    <>
      <div className="rise" style={{ "--i": 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">What Standing knows</h1>
        <p className="mt-2 text-lg text-muted">
          {docs} official policies · {clauses.toLocaleString("en-US")} clauses
        </p>
      </div>

      <nav aria-label="Areas" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {areas.map((a, i) => (
            <li key={a.id} className="pop" style={{ "--i": i + 1 }}>
              <a
                href={`#${a.id}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-ink"
              >
                <Icon name={a.icon} className="size-4 text-muted" />
                {a.name}
                <span className="font-mono text-xs text-muted">{a.docs.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {areas.map((a) => (
        <section key={a.id} id={a.id} className="mt-14 scroll-mt-6" aria-labelledby={`${a.id}-heading`}>
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-tint text-ink">
              <Icon name={a.icon} className="size-6" />
            </span>
            <div className="min-w-0">
              <h2 id={`${a.id}-heading`} className="text-2xl font-semibold tracking-tight">
                {a.name}
              </h2>
              <p className="mt-1 text-muted">{a.blurb}</p>
            </div>
          </div>
          <div className="grow-x mt-4 h-1 w-24 rounded-full bg-gold" style={{ "--i": 1 }} />
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {a.docs.map((d, i) => (
              <li key={d.docId} className="rise" style={{ "--i": i + 1 }}>
                <PolicyCard doc={d} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function PolicyCard({ doc }) {
  const badge = dateBadge(doc.effectiveDate);
  return (
    <Link
      href={`/policies/${doc.docId}`}
      className="group flex h-full min-w-0 flex-col rounded-2xl border border-line bg-card p-5 shadow-card transition-colors hover:border-ink"
    >
      <span className="text-lg font-semibold leading-snug group-hover:underline group-hover:decoration-gold group-hover:decoration-2 group-hover:underline-offset-4">
        {doc.name}
      </span>
      <span className="mt-1 font-mono text-xs text-muted">{doc.label}</span>
      <span className="mt-1 line-clamp-1 text-sm text-muted">{doc.title}</span>
      <span className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4 text-xs">
        <span className="text-muted">
          {doc.clauses} {doc.clauses === 1 ? "clause" : "clauses"}
        </span>
        {badge && <DateBadge badge={badge} />}
      </span>
    </Link>
  );
}

// Gold tint for a recent update, paper with a border for a decade-old policy, plain text otherwise.
function DateBadge({ badge }) {
  const look = {
    recent: "rounded-full border border-gold/60 bg-gold-tint px-2.5 py-1 font-medium text-ink",
    stale: "rounded-full border border-line bg-paper px-2.5 py-1 text-muted",
    plain: "text-muted",
  }[badge.kind];
  return <span className={`whitespace-nowrap ${look}`}>{badge.text}</span>;
}
