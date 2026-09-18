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
npm run eval          # 30 real questions against the running server → eval/results.md (≈$1.50)
npm run ingest        # re-fetch the UCSD PPM documents → data/ (7 docs, see Corpus)
```
Put `ANTHROPIC_API_KEY` in `.env.local` for real answers. `LLM_MOCK=1` (or no key) runs without the
API: the answer is then the clause sharing the most words with the question, cited. It never refuses,
so it exercises the UI and the eval plumbing, not the product.

## Stack
- **Next.js 16** (App Router, JavaScript) deployed on **Vercel**; **Tailwind CSS 4** for the UI.
- **@anthropic-ai/sdk** — `claude-sonnet-5` (default; `STANDING_MODEL` overrides) reads all seven policies on every question (one document
  block each, 74k tokens) with the API's citation feature on, so every cited passage comes back as a
  character range into a policy rather than as text the model typed. The seven documents are
  prompt-cached: the first call writes them, every later call reads them back at cache price.
- No database, no embeddings, no search index, no data build step: `data/corpus.json` (404 KB) is
  committed and loaded once when the route starts.

## How a question is answered
1. `lib/corpus.js` writes each policy as one plain-text document, one paragraph per clause chunk
   (`[5.A] <clause text>`), and records where each clause starts and ends.
2. `lib/llm.js` sends the seven documents plus the question. The reply comes back as text blocks, each
   carrying the passages it relied on as character ranges.
3. Every range is mapped to the clause(s) it covers — at least half of the clause or half of the cited
   passage, since a citation often spans a lead-in and its sub-clause. Each clause becomes a citation:
   id, heading, the cited words, the policy's effective date and official URL. An inline `[160-2#5.A]`
   marker after the sentence is what the UI turns into a chip.
4. The server refuses in two cases: the model answers `NO_ANSWER` (the policies don't cover it), or
   none of its citations resolve to a clause in the corpus. A refusal is an explicit card, never a
   blank answer.

The response shape is fixed in [DESIGN.md](DESIGN.md).

### Why there is no retrieval step
Version 1 ran BM25 over the 638 clause chunks, showed the model the top 6, and refused below a score
threshold. Measured on our own 30-question set, an expected clause was in the top 3 for only 73% of
answerable questions (16/22) on the six-document corpus and 68% (15/22) once PPM 160-9 was added, and
the first real question we asked live — "Can UCSD share my grades with my parents?" — was refused because
the answering clause (160-2 §8.A) ranked outside the top 6. The whole corpus is 74k tokens, so we removed
retrieval and its thresholds and let the model read every policy; the eval below is what that bought.

## Corpus
The seven "Student Matters" documents of the UCSD Policy & Procedure Manual (PPM 160-2, 160-3, 160-6,
160-8, 160-9, 160-10, 160-11): 638 clause chunks, each carrying its document's effective date and
official URL. PPM 160-9 (Student Organizations) is unservable on UCSD's own server — it reports two
published documents with the same id — so `npm run ingest` falls back to the Internet Archive's newest
capture of UCSD's legacy page for it (the 2023-10-06 revision) and links citations to that capture.

## Evaluation
`eval/questions.json` holds 30 student-phrased questions: 22 answerable, each with the clause ids that
contain the answer and a verbatim `answerQuote` that must appear in one of them (checked on every run),
and 8 the policies cannot answer. `npm run eval` POSTs all 30 to the running server, one at a time, and
writes [eval/results.md](eval/results.md). It grades the answer-or-refuse decision and the citations —
a citation counts when it is the expected clause, or when it cites the list containing that clause and
its on-screen quote carries the answer text. It does not grade the prose.

Latest run, 2026-09-18, `claude-sonnet-5` (the default), real key, production build:

| Metric | Result |
|---|---|
| Answer-vs-refuse decision correct (all 30) | 30/30 (100%) |
| Answerable questions wrongly refused | 0/22 |
| Off-corpus questions wrongly answered | 0/8 |
| A citation is an expected clause (`cited-expected`) | 22/22 (100%) |
| A citation is at least the right policy (`cited-doc`) | 22/22 (100%) |
| Corpus served from the prompt cache | 30/30 |
| Latency, median / mean | 5.1 s / 5.1 s |
| Spend for the whole run (30 questions) | $0.57 (≈1.9¢ per question) |

The same set on `claude-opus-5` (2026-09-17) also scored 30/30 and 22/22, at 12.9 s median and roughly
2.5× the cost, which is why Sonnet 5 is the default.

Reproduce: `npm run build && npx next start -p 3000` with `ANTHROPIC_API_KEY` set, then `npm run eval`.
