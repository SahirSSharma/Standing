// The corpus as the model reads it: one plain-text document per policy, built once at module load
// from data/docs.json + data/corpus.json. Each clause chunk is written as "[<clause>] <text>" and its
// [start, end) span is kept, so a cited char range can be mapped back to every clause it covers.
import fs from 'node:fs';
import path from 'node:path';

const load = (file) => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', file), 'utf8'));

/** All clause chunks, in corpus order (the mock answer ranks these). */
export const chunks = load('corpus.json');

const byDocId = new Map(load('docs.json').map((d) => [d.docId, { ...d, text: '', spans: [] }]));
for (const chunk of chunks) {
  const doc = byDocId.get(chunk.docId);
  const start = doc.text.length;
  doc.text += `[${chunk.clause}] ${chunk.text}\n\n`;
  doc.spans.push({ start, end: doc.text.length, chunk });
}

/** docs.json order; the request's document blocks are built from this, so document_index is an index here. */
export const docs = [...byDocId.values()];

const byId = new Map(chunks.map((c) => [c.id, c]));
export const chunkById = (id) => byId.get(id) ?? null;

/**
 * The spans ({start, end, chunk}) of docs[docIndex] that the cited range [start, end) covers by at
 * least half of the clause or half of the citation — empty when nothing does. A citation often
 * straddles a lead-in and its sub-clause, or a whole list, and the answer usually sits in the
 * shorter part, so "largest overlap" alone dropped it (the eval's q06/q12/q18/q21 misses).
 */
export function resolve(docIndex, start, end) {
  const hits = (docs[docIndex]?.spans ?? []).filter((span) => {
    const overlap = Math.min(span.end, end) - Math.max(span.start, start);
    return overlap > 0 && overlap >= Math.min(span.end - span.start, end - start) / 2;
  });
  // A citation that covers a clause plus two or more of its sub-clauses is citing the list: keep the
  // parent, drop the items. One that covers the parent's lead-in plus a single sub-clause is citing
  // that sub-clause: keep the child, drop the parent.
  // The parent kept for a list is returned with its span stretched over the cited items, so the
  // quote shown for it contains the items themselves, not just the lead-in sentence.
  const isUnder = (child, parent) => child.startsWith(parent + '.');
  const drop = new Set();
  const out = [];
  for (const h of hits) {
    const kids = hits.filter((k) => isUnder(k.chunk.clause, h.chunk.clause));
    if (kids.length >= 2) {
      kids.forEach((k) => drop.add(k.chunk.id));
      out.push({ ...h, end: Math.max(h.end, ...kids.map((k) => k.end)) });
    } else {
      if (kids.length === 1) drop.add(h.chunk.id);
      out.push(h);
    }
  }
  return out.filter((h) => !drop.has(h.chunk.id));
}
