import Link from "next/link";
import { notFound } from "next/navigation";
import ClauseList from "../../components/ClauseList";
import { Icon } from "../../components/Icons";
import { areasWithDocs, docWithClauses, formatDate } from "@/lib/library";

// One page per policy, all built at build time from data/; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return areasWithDocs().flatMap((a) => a.docs.map((d) => ({ docId: d.docId })));
}

export async function generateMetadata({ params }) {
  const { docId } = await params;
  const doc = docWithClauses(docId);
  return doc ? { title: `${doc.name} — Standing`, description: doc.summary } : {};
}

const eyebrow = "text-xs font-semibold uppercase tracking-wider text-muted";

export default async function Policy({ params }) {
  const { docId } = await params;
  const doc = docWithClauses(docId);
  if (!doc) notFound();

  return (
    <>
      <Link
        href="/policies"
        className="inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-medium text-muted hover:text-ink"
      >
        <Icon name="back" className="size-4" />
        All policies
      </Link>

      <header className="rise mt-2" style={{ "--i": 0 }}>
        <p className="font-mono text-sm text-muted">{doc.label}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{doc.name}</h1>
        {doc.title.toLowerCase() !== doc.name.toLowerCase() && (
          <p className="mt-2 text-lg leading-snug text-muted">{doc.title}</p>
        )}
        {doc.summary && <p className="mt-3 max-w-3xl leading-relaxed">{doc.summary}</p>}

        {/* The facts a reader needs before the text: which area, when it took effect (and what it
            replaced), who issued it. */}
        <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
          <div className="rise" style={{ "--i": 1 }}>
            <p className={eyebrow}>Area</p>
            <Link
              href={`/policies#${doc.area}`}
              className="mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-gold/60 bg-gold-tint px-4 py-1 text-sm font-medium transition-colors hover:border-ink"
            >
              {doc.areaName}
            </Link>
          </div>

          <div className="rise flex items-end gap-3" style={{ "--i": 2 }}>
            {doc.supersedes && (
              <>
                <div>
                  <p className={eyebrow}>Supersedes</p>
                  <p className="mt-1 text-sm text-muted">{formatDate(doc.supersedes)}</p>
                </div>
                <div className="grow-x mb-2.5 h-0.5 w-8 rounded-full bg-gold sm:w-14" style={{ "--i": 3 }} aria-hidden="true" />
              </>
            )}
            <div>
              <p className={eyebrow}>Effective</p>
              <p className="mt-1 text-sm font-medium">{formatDate(doc.effectiveDate)}</p>
            </div>
          </div>

          {doc.issuingOffice && (
            <div className="rise min-w-0 max-w-md" style={{ "--i": 3 }}>
              <p className={eyebrow}>Issued by</p>
              <p className="mt-1 text-sm text-muted wrap-anywhere">{doc.issuingOffice}</p>
            </div>
          )}
        </div>

        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rise mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-card px-4 text-sm font-medium transition-colors hover:border-ink"
          style={{ "--i": 4 }}
        >
          Read the official policy
          <Icon name="external" className="size-4" />
        </a>
      </header>

      <section className="rise mt-10" style={{ "--i": 5 }} aria-labelledby="clauses-heading">
        <h2 id="clauses-heading" className="text-sm font-semibold uppercase tracking-wider text-muted">
          Clause by clause
        </h2>
        <div className="mt-3">
          {doc.groups.length > 0 ? (
            <ClauseList groups={doc.groups} total={doc.clauses} />
          ) : (
            // SR-516 today: the catalog lists it but the ingest produced no clauses for it.
            <p className="rounded-2xl border border-line bg-card px-5 py-4 text-muted">
              Standing has no clause text for this policy yet, so it can’t quote it in an answer. Read it on the
              official site above.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
