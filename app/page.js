import fs from "node:fs";
import path from "node:path";
import Ask from "./components/Ask";
import { Icon } from "./components/Icons";

// Friendly names for the PPM documents, in the order the "What Standing knows" strip shows them.
const NAMES = [
  ["160-2", "Student records & privacy"],
  ["160-3", "Official email"],
  ["160-10", "Conduct procedures"],
  ["160-11", "Grievances"],
  ["160-9", "Student organizations"],
  ["160-8", "Student governments"],
  ["160-6", "Campus notification after a death"],
];

// data/docs.json and data/corpus.json are written by `npm run ingest` and committed; the page is
// static, so this runs at build. Only the doc list and the clause count reach the client.
function loadData() {
  const read = (file) => JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", file), "utf8"));
  const byId = new Map(read("docs.json").map((d) => [d.docId, d]));
  const docs = NAMES.filter(([id]) => byId.has(id)).map(([docId, name]) => {
    const { title, url } = byId.get(docId);
    return { docId, name, title, url };
  });
  return { docs, clauses: read("corpus.json").length };
}

const container = "mx-auto w-full max-w-[87.5rem] px-5 sm:px-8";

export default function Home() {
  const { docs, clauses } = loadData();

  return (
    <>
      <header>
        <div className={`${container} flex items-center justify-between py-5`}>
          <div className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <Mark />
            Standing
          </div>
          <a
            href="#knows"
            className="inline-flex min-h-11 items-center rounded-lg text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            What Standing knows
          </a>
        </div>
      </header>

      <main className={`${container} flex-1 pb-16 pt-6 sm:pt-10`}>
        <Ask docs={docs} clauses={clauses} />
      </main>

      <footer className="border-t border-line">
        <div
          className={`${container} flex flex-col gap-3 py-7 text-sm text-muted lg:flex-row lg:items-baseline lg:justify-between lg:gap-8`}
        >
          <p className="max-w-xl">
            Not legal advice. Every answer quotes official UCSD policy — always read the clause.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href="https://github.com/SahirSSharma/Standing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 rounded font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
            >
              Open source on GitHub
              <Icon name="external" className="size-3.5" />
            </a>
            <p className="inline-flex min-h-11 items-center">Built by a UCSD student for LexHack 2026</p>
          </div>
        </div>
      </footer>
    </>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#14213d" />
      <path d="M9 10.5h14M9 16h14M9 21.5h7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="18.5" y="19.5" width="6.5" height="4" rx="1" fill="#e9b949" />
    </svg>
  );
}
