"use client";
import Markdown from "./Markdown";

// The first thing on the answer page: a mark that draws itself (check / cross / tilde / info) on a
// tinted circle, and the one-line short answer in large type beside it. The tint is the only colour
// that changes with the verdict; the mark and the text stay ink.
const MARKS = {
  yes: { tint: "#e3f3ea", caption: "Yes", paths: ["M9 20.5l7.5 7.5L31 12"] },
  no: { tint: "#fbe4e1", caption: "No", paths: ["M11 11l18 18", "M29 11L11 29"] },
  depends: { tint: "var(--color-gold-tint)", caption: "Depends", paths: ["M8 21c3-6 7-6 12 0s9 6 12 0"] },
  null: { tint: "var(--color-paper)", caption: "", paths: ["M20 18v10", "M20 12v.5"] },
};

export default function Verdict({ verdict, short, md }) {
  const mark = MARKS[verdict] ?? MARKS.null;
  return (
    <section
      className="rounded-2xl border border-line border-l-4 border-l-gold bg-card px-5 py-5 shadow-card sm:px-6"
      aria-labelledby="short-answer-heading"
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
              {verdict == null && (
                <circle cx="20" cy="20" r="16" strokeWidth="2.5" pathLength="1" className="draw" style={{ "--i": 0 }} />
              )}
              {mark.paths.map((d, i) => (
                <path key={d} d={d} pathLength="1" className="draw" style={{ "--i": i + (verdict == null ? 2 : 0) }} />
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
        </div>
      </div>
    </section>
  );
}
