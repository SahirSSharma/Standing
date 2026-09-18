# Standing

**Know where you stand.** Ask anything about your rights as a UCSD student — records, official email,
conduct procedures, grievances, student governments — and get an answer anchored to the exact clause of
the official policy, with its effective date and a link to the source. If the policies don't answer it,
Standing says so instead of guessing.

Built for [LexHack 2026](https://lexhack-2026.devpost.com/) · Track: Access to Justice & Civic Tech

_Status: day 1 — see PROGRESS.md._

## Run locally
```bash
npm install
npm run dev           # http://localhost:3000 — data/ is committed, no ingest needed
npm run eval          # retrieval + answer/refusal evaluation → eval/results.md
npm run ingest        # re-fetch the UCSD PPM documents → data/ (7 docs, see Corpus)
```
Set `ANTHROPIC_API_KEY` for real answers, or `LLM_MOCK=1` to run without a key (the answer is then the
top-ranked clause verbatim, with its citation).

## Stack
- **Next.js 16** (App Router, JavaScript) deployed on **Vercel**; **Tailwind CSS 4** for the UI.
- **MiniSearch** — a BM25 index over 638 clause-level chunks, built in memory when the route loads.
  Deterministic and key-free, so the refusal gate and the eval run without any API key.
- **@anthropic-ai/sdk** — `claude-sonnet-5` sees only the retrieved clauses and must cite their ids;
  the server validates every citation against what the model was shown.
- No database, no embeddings, no data build step: `data/corpus.json` (404 KB) is committed.

## How a question is answered
1. `lib/retrieve.js` ranks clause chunks (stopwords removed, prefix matching; heading and document
   title indexed alongside the text) and returns the top 6.
2. Gate 1: if the top normalized score is under `THRESHOLD`, or fewer than half of the question's content
   words match anything in the policies (`MIN_COVERAGE`), refuse without calling the LLM.
3. `lib/llm.js` asks Claude to answer from those clauses only, citing ids like `[160-2#5.A]`.
4. Gate 2: an answer of `NO_ANSWER`, or one with no valid citation, is a refusal.

The response shape is fixed in [DESIGN.md](DESIGN.md).

## Corpus
The seven "Student Matters" documents of the UCSD Policy & Procedure Manual (PPM 160-2, 160-3, 160-6,
160-8, 160-9, 160-10, 160-11): 638 clause chunks, each carrying its document's effective date and
official URL. PPM 160-9 (Student Organizations) is unservable on UCSD's own server — it reports two
published documents with the same id — so `npm run ingest` falls back to the Internet Archive's newest
capture of UCSD's legacy page for it (the 2023-10-06 revision) and links citations to that capture.

## Evaluation
`eval/questions.json` holds 30 student-phrased questions: 22 answerable, each with the clause ids that
contain the answer (quote-checked), and 8 the corpus cannot answer. `npm run eval` writes
[eval/results.md](eval/results.md). Numbers from 2026-09-17:

| Metric | Result |
|---|---|
| Retrieval hit@1 (an expected clause ranks first) | 11/22 (50%) |
| Retrieval hit@3 | 15/22 (68%) |
| Retrieval hit@6 (what the LLM is shown) | 17/22 (77%) |
| Gate 1: answerable questions wrongly refused (THRESHOLD 3.5, MIN_COVERAGE 0.5) | 0/22 |
| Gate 1: off-corpus questions refused without an LLM call | 3/8 |
| End-to-end (`LLM_MOCK=1`): answered vs refused correct | 25/30 (83%) |
| End-to-end (`LLM_MOCK=1`): a citation hits an expected clause | 11/22 (50%) |

Reading the numbers: retrieval scores (`normScore`, BM25 ÷ query terms) run 3.76–26.02 for answerable
questions and 1.58–10.13 for off-corpus ones, so no threshold separates them; THRESHOLD 3.5 sits just
below the lowest answerable score, the coverage check catches questions whose words the policies never
use ("How much is a parking ticket?" matches only "parking"), and the LLM's `NO_ANSWER` (gate 2) carries
the rest. In mock mode gate 2 never fires, so 25/30 is a floor, and the citation number equals hit@1
because the mock cites only the top chunk. The five retrieval misses (q07, q09, q15, q20, q21) are paraphrase gaps: the expected
clause holds the answer but shares no content words with the question ("Am I required to check my UCSD
email?" vs "Attending to delivered and posted messages on a frequent and consistent basis").

Reproduce:
```bash
LLM_MOCK=1 npm run dev     # terminal 1
npm run eval               # terminal 2 — the retrieval tier always runs; the end-to-end tier needs the server
```

See [DESIGN.md](DESIGN.md) for architecture and data contracts, [CHANGELOG.md](CHANGELOG.md) for
history.
