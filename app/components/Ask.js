"use client";
import { useState } from "react";
import Result from "./Result";

const EXAMPLES = [
  "Can UCSD share my grades with my parents?",
  "How do I file a grievance against a department?",
  "What happens after a conduct complaint is filed?",
  "Can UCSD email me official notices instead of mailing them?",
];

export default function Ask({ docs }) {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState({ phase: "idle" }); // idle | loading | done | error

  async function ask(q) {
    const trimmed = q.trim();
    if (!trimmed || state.phase === "loading") return;
    setQuestion(trimmed);
    setState({ phase: "loading" });
    try {
      // POST /api/ask per DESIGN.md. Check status before parsing: a 404 in dev is an HTML page.
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`, { cause: res.status });
      setState({ phase: "done", data: await res.json() });
    } catch (err) {
      setState({ phase: "error", status: err.cause, message: err.message });
    }
  }

  const loading = state.phase === "loading";

  return (
    <>
      <form
        onSubmit={(e) => { e.preventDefault(); ask(question); }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="question" className="sr-only">Your question</label>
        <input
          id="question"
          type="text"
          required
          autoComplete="off"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your rights as a UCSD student"
          className="min-w-0 flex-1 rounded border border-line bg-white px-5 py-4 text-xl outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent md:text-2xl"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-accent px-7 py-4 text-lg font-medium text-white hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
        >
          {loading ? "Asking…" : "Ask"}
        </button>
      </form>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Example questions">
        {EXAMPLES.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => ask(q)}
              disabled={loading}
              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-muted hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>

      <section className="mt-12" aria-live="polite" aria-busy={loading}>
        {loading && <p className="text-muted">Reading the policy text…</p>}
        {state.phase === "error" && <ErrorNotice status={state.status} message={state.message} />}
        {state.phase === "done" && <Result data={state.data} docs={docs} />}
      </section>
    </>
  );
}

function ErrorNotice({ status, message }) {
  const devNotice = process.env.NODE_ENV !== "production" && status === 404;
  return (
    <div className="max-w-2xl rounded border border-line bg-white p-5">
      <p className="font-medium">Couldn&apos;t get an answer.</p>
      <p className="mt-1 text-sm text-muted">
        {devNotice
          ? "Development notice: POST /api/ask returned 404 — the API route isn't built yet."
          : `${message}. Try again in a moment.`}
      </p>
    </div>
  );
}
