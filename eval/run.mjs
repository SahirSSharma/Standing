// Evaluation runner — `npm run eval`. POSTs every question in eval/questions.json to the running
// /api/ask (EVAL_URL overrides the default), three at a time, and scores:
//   - answered-vs-refused correctness on all questions
//   - on answerable ones, whether a citation hits an expected clause ("cited-expected") or at
//     least the expected policy ("cited-doc", partial credit)
//   - per-question latency and whether the corpus prefix was served from the prompt cache
// Writes eval/results.md and prints the same text. Exits 1 when the server is unreachable.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = process.env.EVAL_URL ?? 'http://localhost:3000/api/ask';
// One at a time: the first call writes the 74k-token corpus into the prompt cache and every later call reads it.
// Running 3 in parallel made the first three calls all pay the cache write.
const CONCURRENCY = 1;
const TIMEOUT_MS = 90_000;

const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const questions = read('eval/questions.json');
const chunkText = new Map(read('data/corpus.json').map((c) => [c.id, c.text]));

// ---- Validate the question set, so a typo never looks like a model miss ----------------------
for (const q of questions) {
  const unknown = q.expectedChunks.filter((id) => !chunkText.has(id));
  if (unknown.length) die(`${q.id}: unknown chunk id(s): ${unknown.join(', ')}`);
  if (q.expect === 'answer') {
    // DESIGN.md: a question is only answerable if its answerQuote is verbatim in an expected chunk.
    if (!q.expectedChunks.some((id) => chunkText.get(id).includes(q.answerQuote))) {
      die(`${q.id}: answerQuote not found verbatim in any expected chunk`);
    }
    for (const id of q.mustCite ?? []) {
      if (!q.expectedChunks.includes(id)) die(`${q.id}: mustCite ${id} is not in expectedChunks`);
    }
  } else if (q.expectedChunks.length || q.answerQuote) {
    die(`${q.id}: expect=refuse must have no expectedChunks or answerQuote`);
  }
}

// ---- Reachability, before spending a real answer (~$0.05 each) ------------------------------
// A GET on the POST-only route answers 405 (and compiles the route under a cold `next dev`); a thrown
// error means nothing is listening.
try {
  await fetch(API, { signal: AbortSignal.timeout(TIMEOUT_MS) });
} catch (err) {
  die(`server unreachable at ${API} (${err.cause?.code ?? err.name}). Start it with \`npm run dev\`, or set EVAL_URL.`);
}

// ---- Ask every question, CONCURRENCY at a time -----------------------------------------------
async function ask(q) {
  const t0 = performance.now();
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: q.question }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const r = await res.json();
    q.got = r.refused ? 'refuse' : 'answer';
    q.citations = r.citations ?? [];
    q.cacheRead = r.grounding?.cacheRead === true;
  } catch (err) {
    q.error = err.name === 'TimeoutError' ? `timeout after ${TIMEOUT_MS / 1000} s` : err.message;
  }
  q.ms = Math.round(performance.now() - t0);
  console.error(`${q.id}  ${q.error ? `error: ${q.error}` : q.got}  ${q.ms} ms`); // progress; stdout is the report
}
let next = 0;
const worker = async () => {
  while (next < questions.length) await ask(questions[next++]);
};
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

// ---- Score ----------------------------------------------------------------------------------
const answerable = questions.filter((q) => q.expect === 'answer');
for (const q of questions) {
  q.correct = q.got === q.expect;
  if (q.expect !== 'answer') continue;
  const ids = new Set((q.citations ?? []).map((c) => c.id));
  const docs = new Set(q.expectedChunks.map((id) => id.split('#')[0]));
  // mustCite: the answerQuote also appears in an unrelated clause, so that exact id has to be cited.
  // A citation to the list that contains the expected item counts when its on-screen quote carries the
  // answer text (the resolver cites a whole list as its parent clause, quoting the items).
  const hitsExpected = (id) => ids.has(id)
    || (q.citations ?? []).some((c) => id.startsWith(c.id + '.') && c.quote.includes(q.answerQuote.slice(0, 40)));
  q.citedExpected = q.expectedChunks.some(hitsExpected) && (q.mustCite ?? []).every(hitsExpected);
  q.citedDoc = (q.citations ?? []).some((c) => docs.has(c.docId));
}
const ids = (list) => list.map((q) => q.id).join(', ') || 'none';
const correct = questions.filter((q) => q.correct);
const falseRefusals = answerable.filter((q) => q.got === 'refuse');
const falseAnswers = questions.filter((q) => q.expect === 'refuse' && q.got === 'answer');
const errors = questions.filter((q) => q.error);
const citedExpected = answerable.filter((q) => q.citedExpected);
const citedDoc = answerable.filter((q) => q.citedDoc);
const cacheReads = questions.filter((q) => q.cacheRead);
const ms = questions.filter((q) => !q.error).map((q) => q.ms).sort((a, b) => a - b);
const median = ms[Math.floor(ms.length / 2)] ?? 0;
const mean = ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : 0;

// ---- Report ---------------------------------------------------------------------------------
const pct = (n, d) => `${n}/${d} (${Math.round((100 * n) / d)}%)`;
const yn = (b) => (b ? 'yes' : 'no');
const rows = questions.map((q) => {
  const got = q.error ? `error: ${q.error}` : q.got;
  const [ce, cd] = q.expect === 'answer' && !q.error ? [yn(q.citedExpected), yn(q.citedDoc)] : ['—', '—'];
  const top = (q.citations ?? []).slice(0, 3).map((c) => `\`${c.id}\``).join(', ') || '—';
  return `| ${q.id} | ${q.expect} | ${got} | ${ce} | ${cd} | ${top} | ${q.ms} | ${q.error ? '—' : yn(q.cacheRead)} |`;
});

const md = `# Eval results — ${new Date().toLocaleDateString('en-CA')}

Server: ${API}. ${questions.length} questions (${answerable.length} answerable, ${questions.length - answerable.length} off-corpus), ${CONCURRENCY} at a time.
cited-expected = a returned citation id is in expectedChunks (q21 additionally requires its mustCite id); cited-doc = a citation
points into the expected policy (partial credit). "top cited ids" are the first three citations returned. cache = grounding.cacheRead.

| id | expect | got | cited-expected | cited-doc | top cited ids | ms | cache |
|---|---|---|---|---|---|---|---|
${rows.join('\n')}

**Answered/refused correct:** ${pct(correct.length, questions.length)} — false refusals ${falseRefusals.length} (${ids(falseRefusals)}), false answers ${falseAnswers.length} (${ids(falseAnswers)}), errors ${errors.length} (${ids(errors)}).
**Citations (${answerable.length} answerable):** cited-expected ${pct(citedExpected.length, answerable.length)}, cited-doc ${pct(citedDoc.length, answerable.length)}.
**Latency:** median ${median} ms, mean ${mean} ms over ${ms.length} completed calls. **Cache:** corpus prefix read from cache on ${pct(cacheReads.length, questions.length)}.

## Summary

The server decided answer-vs-refuse correctly on ${correct.length} of ${questions.length} questions${falseRefusals.length ? `, wrongly refusing ${ids(falseRefusals)}` : ''}${falseAnswers.length ? `, and answered off-corpus ${ids(falseAnswers)} instead of refusing` : ''}. Of the ${answerable.length} answerable questions, ${citedExpected.length} cited an expected clause and ${citedDoc.length} cited at least the right policy; the clause misses are ${ids(answerable.filter((q) => !q.citedExpected))}. Answers took ${median} ms at the median, with the prompt cache serving the corpus on ${cacheReads.length} of ${questions.length} calls${errors.length ? `; ${errors.length} call${errors.length === 1 ? '' : 's'} failed (${ids(errors)})` : ''}.
`;

fs.writeFileSync(path.join(ROOT, 'eval/results.md'), md);
process.stdout.write(md);

function die(msg) {
  console.error(`eval: ${msg}`);
  process.exit(1);
}
