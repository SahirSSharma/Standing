"use client";
import Markdown from "./Markdown";
import Pip from "./Pip";

// The first thing on the answer page: Pip beside a speech bubble. Inside the bubble a mark draws itself
// (check / cross / tilde / info) on a tinted circle next to the one-line short answer in large type.
// Pip cheers on "yes" and otherwise points at the bubble while the mouth moves for a couple of seconds.
// The tint is the only colour that changes with the verdict; the mark and the text stay ink.
const MARKS = {
  yes: { tint: "#e3f3ea", caption: "Yes", paths: ["M9 20.5l7.5 7.5L31 12"] },
  no: { tint: "#fbe4e1", caption: "No", paths: ["M11 11l18 18", "M29 11L11 29"] },
  depends: { tint: "var(--color-gold-tint)", caption: "Depends", paths: ["M8 21c3-6 7-6 12 0s9 6 12 0"] },
  "n/a": { tint: "var(--color-paper)", caption: "", paths: ["M20 18v10", "M20 12v.5"] },
  null: { tint: "var(--color-paper)", caption: "", paths: ["M20 18v10", "M20 12v.5"] },
};

// `options` is how many "You can" items follow: a "no" with options gets a nudge to keep reading.
export default function Verdict({ verdict, short, md, options = 0 }) {
  const mark = MARKS[verdict] ?? MARKS.null;
  const info = !(verdict in MARKS) || verdict === "n/a" || verdict == null;
  return (
    <section className="flex items-start gap-3 sm:gap-5" aria-labelledby="short-answer-heading">
      <div className="pop shrink-0 pt-1 sm:pt-2" style={{ "--i": 0 }}>
        <Pip pose={verdict === "yes" ? "cheer" : "point"} talking className="size-16 sm:size-24 lg:size-28" />
      </div>
      <div
        className="relative min-w-0 flex-1 rounded-2xl border border-line bg-card px-5 py-5 shadow-card before:absolute before:top-7 before:-left-2 before:size-4 before:rotate-45 before:rounded-sm before:border-b before:border-l before:border-line before:bg-card before:content-[''] sm:px-6 sm:before:top-9"
      >
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <span
              className="flex size-14 items-center justify-center rounded-full border border-line sm:size-16"
              style={{ background: mark.tint }}
            >
              <svg
                viewBox="0 0 40 40"
                className="size-9 sm:size-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                role="img"
                aria-label={mark.caption || "Answer"}
              >
                {info && (
                  <circle cx="20" cy="20" r="16" strokeWidth="2.5" pathLength="1" className="draw" style={{ "--i": 0 }} />
                )}
                {mark.paths.map((d, i) => (
                  <path key={d} d={d} pathLength="1" className="draw" style={{ "--i": i + (info ? 2 : 0) }} />
                ))}
              </svg>
            </span>
            {mark.caption && (
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">{mark.caption}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id="short-answer-heading" className="text-sm font-semibold uppercase tracking-wider text-muted">
              Short answer
            </h2>
            <p className="rise mt-1 text-xl font-semibold leading-snug sm:text-2xl lg:text-[1.75rem]" style={{ "--i": 1 }}>
              {short ? <Markdown text={short} inline {...md} /> : "Here is what the policies say."}
            </p>
            {verdict === "no" && options > 0 && (
              <p className="rise mt-3 text-base font-medium text-muted" style={{ "--i": 3 }}>
                You still have options — see what you can do below.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
