// Evaluation runner — `npm run eval`. POSTs every question in eval/questions.json to the running
// /api/ask (EVAL_URL overrides the default), one at a time, area by area, and scores:
//   - answered-vs-refused correctness on all questions
//   - on answerable ones, whether a citation hits an expected clause ("cited-expected") or at
//     least the expected policy ("cited-doc", partial credit)
//   - router accuracy (grounding.area === the question's area), how often the runner-up area was
//     read (grounding.retried), and the total estimated spend (grounding.cost)
//   - per-question latency and whether the area's prefix was served from the prompt cache
// Writes eval/results.md and prints the same text. Exits 1 when the server is unreachable.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate } from './check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = process.env.EVAL_URL ?? 'http://localhost:3000/api/ask';
// One at a time: the first call into an area writes its 45–65k-token prefix into the prompt cache and
// every later call reads it. Running 3 in parallel made the first three calls all pay the cache write.
const CONCURRENCY = 1;
const TIMEOUT_MS = 90_000;

const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const questions = read('eval/questions.json');

// ---- Validate the question set, so a typo never looks like a model miss ----------------------
const failures = validate(questions);
if (failures.length) die(failures.join('\n      '));

// Area by area (areas.json order), refusers last, so each area's cache is written once per run rather
// than on every switch. A refuser is routed wherever the router sends it, hence last.
const areaOrder = new Map(read('data/areas.json').map((a, i) => [a.id, i]));
// `area` is a string or, when two policies in different areas both answer the question, an array.
const areasOf = (q) => (Array.isArray(q.area) ? q.area : q.area ? [q.area] : []);
questions.sort((a, b) => (areaOrder.get(areasOf(a)[0]) ?? Infinity) - (areaOrder.get(areasOf(b)[0]) ?? Infinity) || a.id.localeCompare(b.id));

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
    q.verdict = r.verdict ?? null;
    q.citations = r.citations ?? [];
    q.cacheRead = r.grounding?.cacheRead === true;
    q.routedArea = r.grounding?.area;
    q.retried = r.grounding?.retried === true;
    q.cost = r.grounding?.cost ?? 0;
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
  // An off-corpus question is also handled correctly when the server answers "n/a" — the policies cover
  // the topic but say nothing about the point asked, and the answer says so instead of inventing a rule.
  q.correct = q.got === q.expect || (q.expect === 'refuse' && q.verdict === 'n/a');
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
  // Router accuracy: the area the answer was read from is one the expected clauses live in.
  q.routedRight = !q.error && areasOf(q).includes(q.routedArea);
}
const ids = (list) => list.map((q) => q.id).join(', ') || 'none';
const correct = questions.filter((q) => q.correct);
const falseRefusals = answerable.filter((q) => q.got === 'refuse');
const falseAnswers = questions.filter((q) => q.expect === 'refuse' && !q.correct && !q.error);
const errors = questions.filter((q) => q.error);
const citedExpected = answerable.filter((q) => q.citedExpected);
const citedDoc = answerable.filter((q) => q.citedDoc);
const routedRight = answerable.filter((q) => q.routedRight);
const retried = questions.filter((q) => q.retried);
const totalCost = Math.round(questions.reduce((sum, q) => sum + (q.cost ?? 0), 0) * 10) / 10;
const cacheReads = questions.filter((q) => q.cacheRead);
const ms = questions.filter((q) => !q.error).map((q) => q.ms).sort((a, b) => a - b);
const median = ms[Math.floor(ms.length / 2)] ?? 0;
const mean = ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : 0;

// ---- Report ---------------------------------------------------------------------------------
const pct = (n, d) => `${n}/${d} (${Math.round((100 * n) / d)}%)`;
const yn = (b) => (b ? 'yes' : 'no');
const rows = questions.map((q) => {
  const got = q.error ? `error: ${q.error}` : q.verdict === 'n/a' ? 'answer (n/a)' : q.got;
  const [ce, cd] = q.expect === 'answer' && !q.error ? [yn(q.citedExpected), yn(q.citedDoc)] : ['—', '—'];
  const routed = q.error ? '—' : `${q.routedArea ?? '—'}${q.retried ? ' (via runner-up)' : ''}`;
  const top = (q.citations ?? []).slice(0, 3).map((c) => `\`${c.id}\``).join(', ') || '—';
  return `| ${q.id} | ${areasOf(q).join('/') || '—'} | ${q.expect} | ${got} | ${routed} | ${ce} | ${cd} | ${top} | ${q.ms} | ${q.error ? '—' : yn(q.cacheRead)} |`;
});

const md = `# Eval results — ${new Date().toLocaleDateString('en-CA')}

Server: ${API}. ${questions.length} questions (${answerable.length} answerable, ${questions.length - answerable.length} off-corpus), ${CONCURRENCY} at a time, sorted by area with refusers last.
area = where the expected clauses live; routed = grounding.area the answer was read from, "(via runner-up)" when the first area
answered NO_ANSWER and the runner-up was read (grounding.retried). cited-expected = a returned citation id is in expectedChunks (a question
with mustCite additionally requires those ids); cited-doc = a citation points into the expected policy (partial credit). "top cited ids"
are the first three citations returned. cache = grounding.cacheRead. got = "answer (n/a)" when the server answered with
Verdict: n/a (the policies cover the topic but not the point asked); for an off-corpus question that counts as correct.

| id | area | expect | got | routed | cited-expected | cited-doc | top cited ids | ms | cache |
|---|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}

**Answered/refused correct:** ${pct(correct.length, questions.length)} — false refusals ${falseRefusals.length} (${ids(falseRefusals)}), false answers ${falseAnswers.length} (${ids(falseAnswers)}), errors ${errors.length} (${ids(errors)}).
**Citations (${answerable.length} answerable):** cited-expected ${pct(citedExpected.length, answerable.length)}, cited-doc ${pct(citedDoc.length, answerable.length)}.
**Router (${answerable.length} answerable):** right area ${pct(routedRight.length, answerable.length)}, misses ${ids(answerable.filter((q) => !q.routedRight))}; routed via runner-up on ${retried.length} of ${questions.length} questions (${ids(retried)}).
**Cost:** ${totalCost}¢ total (grounding.cost summed over ${questions.length} questions).
**Latency:** median ${median} ms, mean ${mean} ms over ${ms.length} completed calls. **Cache:** area prefix read from cache on ${pct(cacheReads.length, questions.length)}.

## Summary

The server decided answer-vs-refuse correctly on ${correct.length} of ${questions.length} questions${falseRefusals.length ? `, wrongly refusing ${ids(falseRefusals)}` : ''}${falseAnswers.length ? `, and answered off-corpus ${ids(falseAnswers)} instead of refusing` : ''}. Of the ${answerable.length} answerable questions, ${citedExpected.length} cited an expected clause and ${citedDoc.length} cited at least the right policy; the clause misses are ${ids(answerable.filter((q) => !q.citedExpected))}. The router read the right area on ${routedRight.length} of ${answerable.length} answerable questions and fell back to the runner-up area ${retried.length} time${retried.length === 1 ? '' : 's'}; the run cost about ${totalCost}¢. Answers took ${median} ms at the median, with the prompt cache serving the area on ${cacheReads.length} of ${questions.length} calls${errors.length ? `; ${errors.length} call${errors.length === 1 ? '' : 's'} failed (${ids(errors)})` : ''}.
`;

fs.writeFileSync(path.join(ROOT, 'eval/results.md'), md);
process.stdout.write(md);

function die(msg) {
  console.error(`eval: ${msg}`);
  process.exit(1);
}
