"use client";
import { useState } from "react";
import { Icon } from "./Icons";
import Markdown from "./Markdown";

// Each deadline the policy sets, and — when it reads "within 10 business days" / "two weeks" /
// "one month" — a date picker that turns it into a calendar date. All client-side arithmetic.
const WORDS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const DURATION = new RegExp(
  `\\b(\\d{1,3}|${WORDS.join("|")})\\s+(business\\s+|working\\s+|calendar\\s+)?(day|week|month)s?\\b`,
  "i",
);

// "within 10 business days" → { n: 10, unit: "day", business: true }; null when there is no duration.
export function parseDuration(text) {
  const m = text.match(DURATION);
  if (!m) return null;
  const n = /^\d/.test(m[1]) ? Number(m[1]) : WORDS.indexOf(m[1].toLowerCase()) + 1;
  const kind = (m[2] ?? "").trim().toLowerCase();
  return { n, unit: m[3].toLowerCase(), business: kind === "business" || kind === "working" };
}

// "2026-10-02" (a date input's value) + a duration → the local Date it lands on. Business days skip
// Saturday and Sunday; weeks are 7 days; months keep the day of month, clamped to the target month.
export function addDuration(iso, { n, unit, business }) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (unit === "month") {
    const target = new Date(y, m - 1 + n, 1);
    const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(d, last));
    return target;
  }
  if (unit === "week") {
    date.setDate(date.getDate() + 7 * n);
    return date;
  }
  if (!business) {
    date.setDate(date.getDate() + n);
    return date;
  }
  for (let left = n; left > 0; ) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) left -= 1;
  }
  return date;
}

const fmt = (date) =>
  date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

export default function Deadlines({ deadlines = [], md, first = 0 }) {
  if (deadlines.length === 0) return null;
  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-card sm:p-6" aria-labelledby="deadlines-heading">
      <h2 id="deadlines-heading" className="text-sm font-semibold uppercase tracking-wider text-muted">
        Deadlines
      </h2>
      <ul className="mt-3 space-y-4">
        {deadlines.map((text, n) => (
          <Deadline key={n} text={text} md={md} i={first + n} inputId={`deadline-from-${n}`} />
        ))}
      </ul>
    </section>
  );
}

function Deadline({ text, md, i, inputId }) {
  const [from, setFrom] = useState("");
  const duration = parseDuration(text.replace(/\[[^\]]*\]/g, ""));
  const due = from && duration ? addDuration(from, duration) : null;
  return (
    <li className="rise" style={{ "--i": i }}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-tint text-ink">
          <Icon name="clock" className="size-5" />
        </span>
        <p className="min-w-0 flex-1 pt-2 leading-snug wrap-break-word">
          <Markdown text={text} inline {...md} />
        </p>
      </div>
      {duration && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 pl-13">
          <label htmlFor={inputId} className="inline-flex min-h-11 flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-medium">
            <span className="shrink-0">Counting from</span>
            <input
              id={inputId}
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="min-h-11 rounded-xl border border-line bg-card px-3 text-sm text-ink"
            />
          </label>
          {due && (
            <p key={from} className="pop inline-flex min-h-11 items-center rounded-xl bg-gold-tint px-3.5 text-sm font-semibold">
              Your deadline: {fmt(due)}
            </p>
          )}
          {due && duration.business && (
            <p className="basis-full text-xs text-muted">Business days skip weekends; campus holidays not counted.</p>
          )}
        </div>
      )}
    </li>
  );
}
