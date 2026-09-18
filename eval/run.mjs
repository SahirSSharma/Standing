// Evaluation runner — `npm run eval`. Two tiers:
//   1. Retrieval (key-free): hit@k of expectedChunks for answerable questions, plus the top score
//      and term coverage of every question — the numbers that calibrate gate 1 in lib/retrieve.js.
//   2. End-to-end: POST every question to the running /api/ask and score refused-vs-answered and
//      whether a citation hits an expected chunk. Skipped with a message when no server is up.
// Writes eval/results.md and prints the same text.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT); // lib/retrieve.js resolves data/corpus.json from cwd
const { search, isConfident, THRESHOLD, MIN_COVERAGE } = await import('../lib/retrieve.js');

const K = 6; // same k as app/api/ask/route.js
const API = process.env.EVAL_API ?? 'http://localhost:3000/api/ask';

const questions = JSON.parse(fs.readFileSync('eval/questions.json', 'utf8'));
const corpus = JSON.parse(fs.readFileSync('data/corpus.json', 'utf8'));
const corpusIds = new Set(corpus.map((c) => c.id));

// A typo in expectedChunks would otherwise look like a retrieval miss, so fail loudly instead.
for (const q of questions) {
  const unknown = q.expectedChunks.filter((id) => !corpusIds.has(id));
  if (unknown.length) die(`${q.id}: unknown chunk id(s): ${unknown.join(', ')}`);
  if (q.expect === 'answer' && q.expectedChunks.length === 0) die(`${q.id}: expect=answer needs expectedChunks`);
  if (q.expect === 'refuse' && q.expectedChunks.length > 0) die(`${q.id}: expect=refuse must have no expectedChunks`);
}

// ---- Tier 1: retrieval ----------------------------------------------------
// hit@k = at least one expected chunk appears in the top k. Scores are normScore (BM25 ÷ query
// term count), the quantity THRESHOLD gates — not MiniSearch's raw score.
for (const q of questions) {
  const results = search(q.question, corpus.length); // full ranking, so a miss still reports how far off it was
  q.topScore = results[0]?.normScore ?? 0;
  q.coverage = results[0]?.coverage ?? 0;
  q.confident = isConfident(results); // gate 1 as the route applies it
  q.topId = results[0]?.chunk.id ?? '';
  const i = results.findIndex((r) => q.expectedChunks.includes(r.chunk.id));
  q.rank = i === -1 ? null : i + 1;
}
const answerable = questions.filter((q) => q.expect === 'answer');
const refusable = questions.filter((q) => q.expect === 'refuse');
const hitAt = (k) => answerable.filter((q) => q.rank !== null && q.rank <= k).length;

const maxRefuse = Math.max(...refusable.map((q) => q.topScore));
const minAnswer = Math.min(...answerable.map((q) => q.topScore));
const falseRefusals = answerable.filter((q) => !q.confident);
const falseAnswers = refusable.filter((q) => q.confident);

// ---- Tier 2: end-to-end ---------------------------------------------------
async function ask(question) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question }),
    signal: AbortSignal.timeout(30_000), // first hit compiles the route under `next dev`
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

let e2eSkipped = null; // message when the tier did not run
for (const q of questions) {
  try {
    const r = await ask(q.question);
    q.e2e = {
      refused: r.refused,
      refusedOk: r.refused === (q.expect === 'refuse'),
      citeOk: q.expect === 'answer' ? r.citations.some((c) => q.expectedChunks.includes(c.id)) : null,
    };
  } catch (err) {
    // fetch() throws TypeError when nothing is listening; on the first question that means no server.
    if (q === questions[0] && err.name === 'TypeError') {
      e2eSkipped = `skipped — no server at ${API} (start \`LLM_MOCK=1 npm run dev\` to include it)`;
      break;
    }
    q.e2e = { error: err.message };
  }
}
const e2eRan = !e2eSkipped;
const refusedOkCount = e2eRan ? questions.filter((q) => q.e2e?.refusedOk).length : 0;
const citeOkCount = e2eRan ? answerable.filter((q) => q.e2e?.citeOk).length : 0;

// ---- Report ---------------------------------------------------------------
function e2eCell(q) {
  if (!e2eRan) return '—';
  if (q.e2e?.error) return `error: ${q.e2e.error}`;
  const verdict = q.e2e.refusedOk ? 'ok' : `WRONG (${q.e2e.refused ? 'refused' : 'answered'})`;
  return q.expect === 'answer' ? `${verdict}, cite ${q.e2e.citeOk ? 'yes' : 'no'}` : verdict;
}
const pct = (n, d) => `${n}/${d} (${Math.round((100 * n) / d)}%)`;
const f3 = (x) => x.toFixed(3);
const docCount = new Set(corpus.map((c) => c.docId)).size;

const rows = questions.map((q) =>
  `| ${q.id} | ${q.expect} | ${q.question} | ${f3(q.topScore)} | ${q.coverage.toFixed(2)} | \`${q.topId}\` | ${q.rank ?? 'miss'} | ${e2eCell(q)} |`,
);
const separation =
  maxRefuse < minAnswer
    ? `separable: any THRESHOLD in (${f3(maxRefuse)}, ${f3(minAnswer)}] refuses all 8 and answers all 22; ` +
      `current ${THRESHOLD} is ${THRESHOLD > maxRefuse && THRESHOLD <= minAnswer ? 'inside' : 'OUTSIDE'} that window`
    : `overlap: max refusable ${f3(maxRefuse)} ≥ min answerable ${f3(minAnswer)}; no single threshold separates them`;

const md = `# Eval results — ${new Date().toLocaleDateString('en-CA')}

Corpus: ${corpus.length} chunks over ${docCount} docs. K = ${K}.
Score = \`normScore\` (BM25 ÷ query-term count); coverage = share of the question's content terms matched anywhere in
the corpus. Gate 1 passes when score ≥ THRESHOLD (${THRESHOLD}) and coverage ≥ MIN_COVERAGE (${MIN_COVERAGE}). hit@k = at least one
expected chunk in the top k. "expected rank" is the position of the first expected chunk in the full ranking (miss = not
matched at all).

| id | expect | question | top score | coverage | top chunk | expected rank | end-to-end |
|---|---|---|---|---|---|---|---|
${rows.join('\n')}

**Retrieval (${answerable.length} answerable):** hit@1 ${pct(hitAt(1), answerable.length)}, hit@3 ${pct(hitAt(3), answerable.length)}, hit@6 ${pct(hitAt(6), answerable.length)}.
**Refusal calibration (${refusable.length} refusable):** top scores ${f3(Math.min(...refusable.map((q) => q.topScore)))}–${f3(maxRefuse)}; answerable top scores ${f3(minAnswer)}–${f3(Math.max(...answerable.map((q) => q.topScore)))}. ${separation}.
Gate 1 (THRESHOLD ${THRESHOLD}, MIN_COVERAGE ${MIN_COVERAGE}): ${falseRefusals.length} answerable would be refused (${falseRefusals.map((q) => q.id).join(', ') || 'none'}), ${falseAnswers.length} refusable would pass to the LLM (${falseAnswers.map((q) => q.id).join(', ') || 'none'}).
**End-to-end:** ${e2eRan ? `refused-vs-answered correct ${pct(refusedOkCount, questions.length)}; citation hits an expected chunk ${pct(citeOkCount, answerable.length)}.` : e2eSkipped}

## Summary

Retrieval alone finds an expected clause at rank 1 for ${hitAt(1)} of ${answerable.length} answerable questions and within the top ${K} for ${hitAt(K)}; the misses (${answerable.filter((q) => q.rank === null || q.rank > K).map((q) => `${q.id}@${q.rank ?? '-'}`).join(', ') || 'none'}; id@rank) are where the paraphrase gap is. The eight off-corpus questions top out at ${f3(maxRefuse)} against a minimum answerable score of ${f3(minAnswer)}, so the score alone is ${maxRefuse < minAnswer ? 'cleanly separable' : 'not cleanly separable'} on this set${maxRefuse < minAnswer ? '' : `; with term coverage, gate 1 puts ${falseRefusals.length + falseAnswers.length} question${falseRefusals.length + falseAnswers.length === 1 ? '' : 's'} on the wrong side`}. ${e2eRan ? `End-to-end, the server answered/refused correctly on ${refusedOkCount}/${questions.length} and cited an expected clause on ${citeOkCount}/${answerable.length} answerable questions (when the server runs in LLM_MOCK mode the citation is only the top chunk, so this tracks hit@1).` : 'The end-to-end tier did not run because no server was listening; start one with LLM_MOCK=1 and re-run to score answered-vs-refused and citations.'}
`;

fs.writeFileSync('eval/results.md', md);
process.stdout.write(md);

function die(msg) {
  console.error(`eval: ${msg}`);
  process.exit(1);
}
