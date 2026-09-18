import Link from "next/link";
import { Icon } from "./Icons";

// The six life areas from data/areas.json, each linking to its section of the policy library.
// Cards lie sideways (icon beside the text): two columns from lg, three from 2xl (the blurbs in
// data/areas.json are kept under 44 characters so nothing wraps at 1536 px and up).
export default function Areas({ areas, first = 0 }) {
  return (
    <section className="mt-12 sm:mt-16" aria-labelledby="areas">
      <h2 id="areas" className="rise text-xl font-semibold tracking-tight" style={{ "--i": first }}>
        Browse by area
      </h2>
      <ul className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3 sm:gap-4">
        {areas.map((a, i) => (
          <li key={a.id} className="rise" style={{ "--i": first + 1 + i }}>
            <Link
              href={`/policies#${a.id}`}
              className="group flex h-full items-start gap-4 rounded-2xl border border-line bg-card p-4 shadow-card transition-colors hover:border-ink sm:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-tint text-ink">
                <Icon name={a.icon} className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-snug group-hover:underline group-hover:decoration-gold group-hover:decoration-2 group-hover:underline-offset-4">
                  {a.name}
                </span>
                <span className="mt-1 block text-sm leading-snug text-muted">{a.blurb}</span>
                <span className="mt-2.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                  {a.docs.length} {a.docs.length === 1 ? "policy" : "policies"} · {a.clauses} clauses
                </span>
              </span>
              <Icon name="arrow" className="mt-3 size-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
