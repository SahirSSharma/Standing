"use client";
import Link from "next/link";
import { Icon } from "./Icons";
import Pip from "./Pip";
import { SITUATIONS } from "./Situations";

// The manual's own index (sections 100–551); the legacy adminrecords.ucsd.edu URL only redirects here.
const INDEX_URL = "https://secure4.compliancebridge.com/ucsd/public/index.php?fuseaction=app.main";

// Campus offices that handle what the policies here don't; every URL is checked live before a release.
const OFFICES = [
  { name: "Office of the Ombuds", what: "confidential, impartial help with any campus conflict", url: "https://ombuds.ucsd.edu/" },
  { name: "Student Legal Services", what: "free legal help for students", url: "https://students.ucsd.edu/sponsor/student-legal/" },
  { name: "SAGE", what: "the student conduct office", url: "https://sage.ucsd.edu/" },
  { name: "OPHD", what: "harassment and discrimination reports", url: "https://ophd.ucsd.edu/" },
];

export default function Refused({ docs, onAsk }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-6 shadow-card sm:p-8">
      <div className="flex items-start gap-4 sm:gap-6">
        <div className="pop shrink-0" style={{ "--i": 0 }}>
          <Pip pose="sorry" className="size-20 sm:size-24" />
        </div>
        <div className="min-w-0">
          <h2 className="rise text-xl font-semibold leading-snug sm:text-2xl" style={{ "--i": 1 }}>
            That one isn&rsquo;t in the {docs.length} policies Pip has read
          </h2>
          <p className="rise mt-2 text-muted" style={{ "--i": 2 }}>
            No guessing here: Standing only answers from official policy. These people can help with the rest.
          </p>
        </div>
      </div>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {OFFICES.map((o, i) => (
          <li key={o.name} className="rise" style={{ "--i": 3 + i }}>
            <a
              href={o.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-11 items-center gap-3 rounded-xl border border-line px-4 py-2.5 transition-colors hover:border-ink"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium group-hover:underline group-hover:decoration-gold group-hover:decoration-2 group-hover:underline-offset-4">
                  {o.name}
                </span>
                <span className="block text-sm text-muted">{o.what}</span>
              </span>
              <Icon name="external" className="size-4 shrink-0 text-muted" />
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-7 text-sm font-semibold uppercase tracking-wider text-muted">Or try one of these</p>
      <ul className="mt-3 grid gap-2">
        {SITUATIONS.slice(0, 3).map((s) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => onAsk(s.q)}
              className="group flex min-h-11 w-full items-center gap-3 rounded-xl border border-line px-4 py-2.5 text-left font-medium transition-colors hover:border-ink"
            >
              <Icon name={s.icon} className="size-5 shrink-0 text-muted" />
              <span className="group-hover:underline group-hover:decoration-gold group-hover:decoration-2 group-hover:underline-offset-4">
                {s.title}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1">
        <Link
          href="/policies"
          className="inline-flex min-h-11 items-center gap-1.5 rounded font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
        >
          <Icon name="list" className="size-4" />
          See every policy Standing knows
        </Link>
        <a
          href={INDEX_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
        >
          Browse the full UCSD policy manual
          <Icon name="external" className="size-4" />
        </a>
      </div>
    </section>
  );
}
