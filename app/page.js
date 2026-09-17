import fs from "node:fs";
import path from "node:path";
import Ask from "./components/Ask";

// data/docs.json is written by `npm run ingest` and committed; the page is static, so this runs at build.
function loadDocs() {
  const raw = fs.readFileSync(path.join(process.cwd(), "data", "docs.json"), "utf8");
  return JSON.parse(raw).map(({ docId, title, url }) => ({ docId, title, url }));
}

export default function Home() {
  const docs = loadDocs();

  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-6 2xl:max-w-7xl">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Standing</h1>
            <p className="text-lg text-muted">Know where you stand.</p>
          </div>
          <p className="mt-3 text-sm">
            UCSD Policy &amp; Procedure Manual — student records, official email, conduct procedures,
            grievances, student governments
          </p>
          <p className="mt-1 text-xs text-muted">
            {docs.map((d, i) => (
              <span key={d.docId}>
                {i > 0 && " · "}
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent hover:underline"
                >
                  <span className="font-mono">{d.docId}</span> {d.title}
                </a>
              </span>
            ))}
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 2xl:max-w-7xl">
        <Ask docs={docs} />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-6 py-5 text-sm text-muted 2xl:max-w-7xl">
          <p>Not legal advice. Answers cite official UCSD policy text; always read the clause.</p>
          <a
            href="https://github.com/SahirSSharma/Standing"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent hover:underline"
          >
            Source on GitHub ↗
          </a>
        </div>
      </footer>
    </>
  );
}
