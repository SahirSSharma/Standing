// Retrieval: a MiniSearch (BM25-style) index over clause chunks, built once at module load.
// Deterministic and key-free, so the eval and the refusal gate run without any API key.
import fs from 'node:fs';
import path from 'node:path';
import MiniSearch from 'minisearch';

const CORPUS_PATH = path.join(process.cwd(), 'data', 'corpus.json'); // written by `npm run ingest`

/**
 * Gate 1 threshold on `normScore` (see search()). Calibrated by `npm run eval` on the 6-doc corpus
 * (2026-09-17): answerable top scores 3.68–25.56, off-corpus questions 1.56–9.97. The ranges
 * overlap, so no value separates them; 3.5 sits just under the lowest answerable score (refuses
 * nothing the policies cover) and only catches the clearly off-topic tail. Gate 2 — the LLM
 * answering NO_ANSWER — is the main refusal mechanism on this corpus. Re-run the eval whenever
 * the corpus or the index options change.
 */
export const THRESHOLD = 3.5;

// Function words plus the campus name. Every student question says "ucsd"/"I"/"my" but the corpus
// almost never does (9 of 602 chunks contain "ucsd"), so those terms had huge idf and pulled the
// consent-form templates ("I, ____, request…") to the top of unrelated questions.
const STOPWORDS = new Set(
  ('a an and are as at be been being but by can could did do does for from had has have he her his how i if in is it its ' +
    'me my of on or our she should so than that the their them then there these they this to us was we were what when where ' +
    'which who whom why will with would you your am into about ucsd uc san diego university').split(' '),
);
const lowercase = MiniSearch.getDefault('processTerm');
// Applied to indexed text and queries alike; a null return drops the term. Single letters are
// fragments ("I'm" → "m", clause labels), not words.
const processTerm = (term) => {
  const t = lowercase(term);
  return t && t.length > 1 && !STOPWORDS.has(t) ? t : null;
};

const corpus = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf8'));
const byId = new Map(corpus.map((c) => [c.id, c]));

const index = new MiniSearch({
  fields: ['text', 'heading', 'docTitle'],
  processTerm,
  searchOptions: {
    // Heading and title are context, not evidence: boosting them above the clause text made every
    // chunk under a matching heading outrank the one clause that actually answers the question.
    boost: { heading: 1, docTitle: 1 },
    // Prefix matching on longer terms only ("a" would otherwise expand to every a-word). Fuzzy
    // matching is off: it gained nothing on the eval and matched "how" to "show".
    prefix: (term) => term.length > 3,
  },
});
index.addAll(corpus);

const tokenize = MiniSearch.getDefault('tokenize');

/**
 * Top-k chunks for a question. `score` is MiniSearch's raw BM25 sum, which grows with the number
 * of query terms; `normScore` divides by the count of terms that survived processTerm so long and
 * short questions are comparable and THRESHOLD can be a single number.
 */
export function search(question, k = 6) {
  const termCount = tokenize(question).map(processTerm).filter(Boolean).length || 1;
  return index
    .search(question)
    .slice(0, k)
    .map((r) => ({ chunk: byId.get(r.id), score: r.score, normScore: r.score / termCount }));
}

export function isConfident(results) {
  return results.length > 0 && results[0].normScore >= THRESHOLD;
}
