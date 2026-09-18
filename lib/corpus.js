// The corpus as the model reads it: one plain-text document per policy, built once at module load
// from data/docs.json + data/corpus.json. Each clause chunk is written as "[<clause>] <text>" and its
// [start, end) span is kept, so a cited char range can be mapped back to the clause that owns it.
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
 * The chunk with the largest overlap with the cited range [start, end) in docs[docIndex], or null.
 * A citation can straddle two clauses, so the chunk containing `start` is not necessarily the one
 * most of the quote came from.
 */
export function resolve(docIndex, start, end) {
  let best = null;
  let bestOverlap = 0;
  for (const span of docs[docIndex]?.spans ?? []) {
    const overlap = Math.min(span.end, end) - Math.max(span.start, start);
    if (overlap > bestOverlap) [best, bestOverlap] = [span.chunk, overlap];
  }
  return best;
}
