import fs from "node:fs";
import path from "node:path";
import Ask from "./components/Ask";
import SiteFooter from "./components/SiteFooter";
import SiteHeader, { container } from "./components/SiteHeader";

// data/docs.json, data/areas.json and data/corpus.json are written by `npm run ingest` and committed;
// the page is static, so this runs at build. Only the per-area doc lists and the counts reach the client.
function loadData() {
  const read = (file) => JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", file), "utf8"));
  const docs = read("docs.json");
  const corpus = read("corpus.json");

  const areaOf = new Map(docs.map((d) => [d.docId, d.area]));
  const clausesByArea = new Map();
  for (const chunk of corpus) {
    const area = areaOf.get(chunk.docId);
    clausesByArea.set(area, (clausesByArea.get(area) ?? 0) + 1);
  }

  const areas = read("areas.json").map((a) => ({
    ...a,
    docs: docs
      .filter((d) => d.area === a.id)
      .map(({ docId, name, label, url, effectiveDate }) => ({ docId, name, label, url, effectiveDate })),
    clauses: clausesByArea.get(a.id) ?? 0,
  }));
  return { areas, totals: { docs: docs.length, clauses: corpus.length } };
}

export default function Home() {
  const { areas, totals } = loadData();

  return (
    <>
      <SiteHeader link={{ href: "/policies", label: "What Standing knows" }} />

      <main className={`${container} flex-1 pb-16 pt-6 sm:pt-10`}>
        <Ask areas={areas} totals={totals} />
      </main>

      <SiteFooter />
    </>
  );
}
