// Offline validator for eval/questions.json — `node eval/check.mjs`. Reads only the data files, never
// the server or the API, and exits 1 listing every failure, so a typo in the question set can never
// look like a model miss. eval/run.mjs imports validate() and refuses to spend a call on a bad set.
//   - ids are unique; expect is "answer" or "refuse"
//   - every expectedChunks / mustCite id exists in data/corpus.json
//   - answerable: expectedChunks non-empty, area is a known area id and is the area of every expected
//     chunk's document (DESIGN.md: the router's job is to find that area), answerQuote is ≥ 40 chars and
//     verbatim in one expected chunk, mustCite ⊆ expectedChunks
//   - refuse: no area, no answerQuote, no mustCite, expectedChunks empty
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const chunkText = new Map(read('data/corpus.json').map((c) => [c.id, c.text]));
const docArea = new Map(read('data/docs.json').map((d) => [d.docId, d.area]));
const areaIds = new Set(read('data/areas.json').map((a) => a.id));
const MIN_QUOTE = 40;

/** @returns {string[]} one line per failure; empty when the set is valid */
export function validate(questions) {
  const failures = [];
  const seen = new Set();
  for (const q of questions) {
    const fail = (msg) => failures.push(`${q.id ?? '(no id)'}: ${msg}`);
    if (!q.id) fail('missing id');
    else if (seen.has(q.id)) fail('duplicate id');
    seen.add(q.id);
    if (typeof q.question !== 'string' || !q.question.trim()) fail('missing question');
    if (q.expect !== 'answer' && q.expect !== 'refuse') fail(`expect must be "answer" or "refuse", got ${JSON.stringify(q.expect)}`);
    const expected = Array.isArray(q.expectedChunks) ? q.expectedChunks : [];
    if (!Array.isArray(q.expectedChunks)) fail('expectedChunks must be an array');
    const mustCite = q.mustCite ?? [];
    for (const id of [...expected, ...mustCite]) if (!chunkText.has(id)) fail(`unknown chunk id ${id}`);

    if (q.expect === 'answer') {
      if (!expected.length) fail('answerable question has no expectedChunks');
      // area: one id, or an array when policies in two areas both answer the question (every listed area
      // must hold an expected chunk, and every expected chunk must be in a listed area)
      const areas = Array.isArray(q.area) ? q.area : [q.area];
      for (const a of areas) if (!areaIds.has(a)) fail(`area must be one of ${[...areaIds].join(', ')}, got ${JSON.stringify(a)}`);
      const chunkAreas = new Set(expected.map((id) => docArea.get(id.split('#')[0])).filter(Boolean));
      for (const a of chunkAreas) if (!areas.includes(a)) fail(`an expected chunk is in area "${a}", question says ${JSON.stringify(q.area)}`);
      for (const a of areas) if (!chunkAreas.has(a)) fail(`area "${a}" has no expected chunk`);
      if (typeof q.answerQuote !== 'string' || q.answerQuote.length < MIN_QUOTE) {
        fail(`answerQuote must be a string of at least ${MIN_QUOTE} chars`);
      } else if (!expected.some((id) => chunkText.get(id)?.includes(q.answerQuote))) {
        fail('answerQuote is not verbatim in any expected chunk');
      }
      for (const id of mustCite) if (!expected.includes(id)) fail(`mustCite ${id} is not in expectedChunks`);
    } else if (q.expect === 'refuse') {
      if (expected.length) fail('refuser must have empty expectedChunks');
      if (q.answerQuote !== undefined) fail('refuser must have no answerQuote');
      if (q.area !== undefined) fail('refuser must have no area');
      if (q.mustCite !== undefined) fail('refuser must have no mustCite');
    }
  }
  return failures;
}

// Run as a script: print every failure and exit 1, or print the per-area counts.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const questions = read('eval/questions.json');
  const failures = validate(questions);
  if (failures.length) {
    for (const f of failures) console.error(`check: ${f}`);
    console.error(`check: ${failures.length} failure(s) in ${questions.length} questions`);
    process.exit(1);
  }
  const answerable = questions.filter((q) => q.expect === 'answer');
  const perArea = [...areaIds].map((a) => `${a} ${answerable.filter((q) => (Array.isArray(q.area) ? q.area[0] : q.area) === a).length}`).join(', ');
  console.log(`check: ${questions.length} questions valid — ${answerable.length} answerable (${perArea}), ${questions.length - answerable.length} refuse`);
}
