"use client";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import Areas from "./Areas";
import { Icon } from "./Icons";
import Progress from "./Progress";
import Result, { COLS } from "./Result";
import Situations from "./Situations";

// Once a question is asked, the form and every card below it sit in the answer's left column.
const grid = `grid grid-cols-[minmax(0,1fr)] ${COLS}`;

// Below sm the full example placeholder truncates mid-word, so a shorter one is used there.
const narrowQuery = () => window.matchMedia("not all and (min-width: 40rem)");
const subscribeNarrow = (cb) => {
  const mq = narrowQuery();
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export default function Ask({ areas, totals }) {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState({ phase: "idle" }); // idle | loading | done | error
  const inputRef = useRef(null);
  const narrow = useSyncExternalStore(subscribeNarrow, () => narrowQuery().matches, () => false);
  const docs = areas.flatMap((a) => a.docs);

  async function ask(q) {
    const trimmed = q.trim();
    if (!trimmed || state.phase === "loading") return;
    setQuestion(trimmed);
    setState({ phase: "loading", question: trimmed });
    try {
      // POST /api/ask per DESIGN.md. Errors are {error} with a 4xx/5xx status; a 404 in dev is HTML.
      // The body's error text is server / SDK wording, so the notice keys off the status alone.
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setState({ phase: "error", question: trimmed, status: res.status });
        return;
      }
      setState({ phase: "done", question: trimmed, data: body });
    } catch {
      setState({ phase: "error", question: trimmed });
    }
  }

  function reset() {
    setState({ phase: "idle" });
    setQuestion("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    inputRef.current?.focus();
  }

  const idle = state.phase === "idle";
  const loading = state.phase === "loading";
  const framed = loading || state.phase === "error"; // Result lays out its own grid

  return (
    <>
      <section className={idle ? "mx-auto max-w-3xl text-center 2xl:max-w-4xl" : grid}>
        <div>
          <h1
            className={
              idle
                ? "rise text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
                : "text-2xl font-semibold tracking-tight"
            }
            style={{ "--i": 0 }}
          >
            Know where you stand.
          </h1>
          {idle && (
            <p className="rise mx-auto mt-5 text-lg leading-relaxed text-muted sm:text-xl" style={{ "--i": 1 }}>
              Your rights as a UCSD student, answered from the exact policy clause.
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
            className={idle ? "rise mt-8 text-left sm:mt-10" : "mt-4 text-left"}
            style={{ "--i": 1 }}
          >
            <label htmlFor="question" className="sr-only">
              Your question
            </label>
            {/* Once asked, the field shrinks with the button so the whole question stays readable at 1336. */}
            <div className="relative">
              <div className="relative">
                <Icon
                  name="search"
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted ${idle ? "left-5 size-6" : "left-4 size-5"}`}
                />
                <input
                  ref={inputRef}
                  id="question"
                  type="text"
                  required
                  minLength={3}
                  maxLength={500}
                  autoComplete="off"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={narrow ? "Can UCSD share my grades?" : "e.g. Can UCSD share my grades with my parents?"}
                  className={`w-full rounded-2xl border border-line bg-card shadow-field placeholder:text-soft ${
                    idle
                      ? "h-16 pl-14 pr-5 text-lg sm:h-[4.5rem] sm:pr-36 sm:text-xl"
                      : "h-14 pl-12 pr-5 text-base sm:pr-32 sm:text-lg"
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`mt-3 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-60 sm:absolute sm:mt-0 sm:w-auto ${
                  idle ? "px-6 text-lg sm:right-2.5 sm:top-2.5 sm:h-[3.25rem]" : "px-5 text-base sm:right-1.5 sm:top-1.5 sm:h-11"
                }`}
              >
                Ask
                <Icon name="arrow" className="size-5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {idle ? (
        <>
          <Situations onAsk={ask} first={2} />
          <Areas areas={areas} first={11} />
        </>
      ) : (
        <>
          <section className={framed ? `mt-8 sm:mt-10 ${grid}` : "mt-8 sm:mt-10"} aria-live="polite" aria-busy={loading}>
            {loading && <Progress documents={totals.docs} question={state.question} />}
            {state.phase === "error" && <ErrorNotice status={state.status} onRetry={() => ask(state.question)} />}
            {state.phase === "done" && (
              <Result data={state.data} docs={docs} onAsk={ask} onReset={reset} question={state.question} />
            )}
          </section>

          <div className={`mt-10 ${grid}`}>
            <p className="text-sm text-muted">
              Standing reads {totals.docs} official policies ·{" "}
              <Link
                href="/policies"
                className="inline-flex min-h-11 items-center rounded font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
              >
                see the list
              </Link>
            </p>
          </div>
        </>
      )}
    </>
  );
}

// One notice per failure class. 400 cannot come from the form (minLength / maxLength), but a pasted
// question of spaces can still trip it; there is nothing to retry there, so that branch has no button.
function ErrorNotice({ status, onRetry }) {
  const devNotice = process.env.NODE_ENV !== "production" && status === 404;
  let heading = "Something went wrong on Standing’s side";
  let body = "Your question is still in the box above — try again.";
  if (status === 400) {
    heading = "That question is too short";
    body = "Ask in at least a few words.";
  } else if (status === 503) {
    heading = "Standing’s answering service is busy — try again in a moment";
    body = "Nothing was lost — your question is still in the box above.";
  } else if (devNotice) {
    body = "Development notice: POST /api/ask returned 404 — the API route isn’t built yet.";
  }
  return (
    <div className="rounded-2xl border border-line bg-card p-6 shadow-card sm:p-8">
      <h2 className="text-xl font-semibold">{heading}</h2>
      <p className="mt-2 text-muted">{body}</p>
      {status !== 400 && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 font-semibold text-white hover:bg-ink-hover"
        >
          <Icon name="retry" className="size-4" />
          Retry
        </button>
      )}
    </div>
  );
}
