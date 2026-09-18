// The policy library as the /policies pages read it: data/docs.json, data/areas.json and
// data/corpus.json loaded once with fs (the pages are static, so this runs at build), the docs
// grouped into their life areas and each doc's clauses grouped under the section headings the
// manual prints them under.
import fs from 'node:fs';
import path from 'node:path';

const load = (file) => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', file), 'utf8'));

const docs = load('docs.json');
const areas = load('areas.json');
const chunks = load('corpus.json');

const clauseCount = new Map();
for (const c of chunks) clauseCount.set(c.docId, (clauseCount.get(c.docId) ?? 0) + 1);

const withCount = (d) => ({ ...d, clauses: clauseCount.get(d.docId) ?? 0 });

/** The six life areas in display order, each with its docs in catalog order (+ `clauses` per doc). */
export function areasWithDocs() {
  return areas.map((a) => ({ ...a, docs: docs.filter((d) => d.area === a.id).map(withCount) }));
}

/** { docs, clauses } for the "42 official policies · 1,902 clauses" line. */
export function totals() {
  return { docs: docs.length, clauses: chunks.length };
}

/**
 * One doc with its area and its clauses grouped by section: consecutive chunks that share a
 * `section` form one group (the same heading can recur under different sections, and 160-6 has
 * three "I." sections, so runs — not unique values — keep the manual's order). Chunks with no
 * section (whole Senate regulations, a few PPM preambles) form heading-less groups. `null` when
 * the id is unknown.
 */
export function docWithClauses(docId) {
  const doc = docs.find((d) => d.docId === docId);
  if (!doc) return null;
  const groups = [];
  for (const c of chunks) {
    if (c.docId !== docId) continue;
    const last = groups[groups.length - 1];
    if (last && last.section === (c.section || '')) {
      last.clauses.push({ id: c.id, clause: c.clause, text: c.text });
    } else {
      groups.push({
        key: `sec-${groups.length}`,
        section: c.section || '',
        heading: c.heading || '',
        clauses: [{ id: c.id, clause: c.clause, text: c.text }],
      });
    }
  }
  return {
    ...withCount(doc),
    areaName: areas.find((a) => a.id === doc.area)?.name ?? doc.area,
    groups,
  };
}

/** "2017-10-05" → "Oct 5, 2017" without a timezone shift (UTC in, UTC out). */
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

/**
 * The date badge on a policy card: `recent` ("Updated Oct 2023") within the last 24 months,
 * `stale` ("Not updated since 2012") when older than 10 years, else `plain` ("Effective Jun 14, 2024").
 * Evaluated at build time, so a card's badge is as fresh as the deploy.
 */
export function dateBadge(iso, now = new Date()) {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  const monthsAgo = (months) => {
    const d = new Date(now);
    d.setUTCMonth(d.getUTCMonth() - months);
    return d;
  };
  if (date >= monthsAgo(24)) {
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
    return { kind: 'recent', text: `Updated ${monthYear}` };
  }
  if (date < monthsAgo(120)) return { kind: 'stale', text: `Not updated since ${iso.slice(0, 4)}` };
  return { kind: 'plain', text: `Effective ${formatDate(iso)}` };
}
