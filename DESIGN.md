# Standing — design

**Tagline:** Know where you stand. Ask a question about your rights as a UCSD student; get an answer
anchored to the exact policy clause, with its effective date and a link to the official source —
or an explicit "I can't answer that from the policies I have," never a guess.

Built for LexHack 2026 (Sept 11–27, 2026). All core code written inside the window.

## Why this shape
- UCSD's Policy & Procedure Manual is public (274 documents at
  `https://secure4.compliancebridge.com/ucsd/public/getdoc.php?file=<PPM#>`, index at
  `https://adminrecords.ucsd.edu/ppm/docs/toc160.html`) but practically unusable: long HTML,
  no search across clauses, no plain-language layer.
- Every document carries structured metadata (section #, effective date, supersedes date, issuing
  office) and internally numbered clauses. That makes **clause-level citation** possible — the whole
  product rests on it.
- Corpus v1 = the 7 "Student Matters" documents: 160-2, 160-3, 160-6, 160-8, 160-9, 160-10, 160-11.
  The ingest script takes any list of PPM numbers; a second institution is a later, separate ingest.

## Architecture (v2 — full-policy reading, decided 2026-09-17 evening)
```
browser ──POST /api/ask {question}──▶ Next.js route
                                        │ 1. build the request: ONE document block per policy (7 docs, ~41k tokens
                                        │    total), native citations enabled, cache_control on the last document
                                        │ 2. Claude (claude-opus-5, adaptive thinking, effort low) answers from the
                                        │    documents; the API returns each cited passage as cited_text + char range
                                        │ 3. map every char range → the clause chunk that owns it (server-side, from
                                        │    the corpus) → citations[] with clause id, heading, quote, date, url
                                        │ 4. gate: NO_ANSWER, or zero citations → refuse
                                        ▼
                    {answer, citations[], refused, reason, grounding}
```
- The whole corpus is ~41k tokens, so the model reads every policy on every question; there is no
  chunk-retrieval step to miss the right clause. The corpus prefix is prompt-cached (first call
  writes it, later calls read it at ~10% price).
- Citations are produced by the API's citation feature, not typed by the model, so a citation can
  only point at text that is actually in a document. Every char range is resolved to a clause in
  data/corpus.json; anything that fails to resolve is dropped, and zero citations means refusal.
- `LLM_MOCK=1` (or no key) returns the chunk with the most question-word overlap as the answer,
  cited, so the UI and eval plumbing run without a key.

## Data contracts (fixed — every component builds against these)
`data/docs.json` — array of:
```json
{ "docId": "160-2", "title": "Disclosure of Information From Student Records",
  "effectiveDate": "2017-10-05", "supersedes": "2014-11-13", "issuingOffice": "Registrars Office",
  "url": "https://secure4.compliancebridge.com/ucsd/public/getdoc.php?file=160-2",
  "fetchedAt": "2026-09-17", "chars": 69253 }
```
`data/corpus.json` — array of clause chunks:
```json
{ "id": "160-2#5.A", "docId": "160-2", "docTitle": "...", "section": "5",
  "heading": "INSPECTION AND REVIEW OF STUDENT RECORDS BY STUDENTS", "clause": "5.A",
  "text": "…clause text…", "effectiveDate": "2017-10-05", "url": "…getdoc.php?file=160-2" }
```
Chunk rules: one chunk per lowest-level numbered/lettered clause; if a clause exceeds ~1,800 chars,
split on sentence boundaries into `#5.A.1`, `#5.A.2`, … ; never merge across headings; `text` is
plain text with whitespace collapsed.

`POST /api/ask` — request `{ "question": string }`; response:
```json
{ "answer": "string (markdown, empty when refused)",
  "citations": [ { "id": "160-2#5.A", "docId": "160-2", "docTitle": "…", "clause": "5.A",
                   "heading": "…", "quote": "≤300 chars from chunk text", "effectiveDate": "2017-10-05",
                   "url": "…" } ],
  "refused": false, "reason": "string, present only when refused",
  "grounding": { "documents": 7, "inputTokens": 41210, "cacheRead": true, "model": "claude-opus-5" } }
```

`eval/questions.json` — array of `{ "id", "question", "expect": "answer" | "refuse",
"expectedChunks": ["160-2#5.A", …], "answerQuote": "verbatim sentence from one expected chunk that
answers the question" }` (expectedChunks empty and answerQuote absent when expect=refuse). A
question is only "answerable" if answerQuote is found verbatim in one of its expectedChunks.

## Stack (all declared for the hackathon)
Next.js (App Router, JavaScript), Tailwind, @anthropic-ai/sdk (Claude Opus 5, citations + prompt caching), Vercel.

## Deployment
Vercel. Every push → preview deployment (= staging, reported automatically).
Production (`vercel --prod`) only on Sahir's explicit OK.

## Decisions log
- 2026-09-17 — Corpus bounded to the 7 student-facing PPM docs; generality is proven by a second
  institution ingest later, not by ingesting all 274 now.
- 2026-09-17 — BM25 (MiniSearch) over embeddings for v1: key-free, deterministic, evaluable today.
- 2026-09-17 — Refusal is a product feature ("it tells you when it doesn't know, and shows why"),
  enforced by two server-side gates, not by prompt wording alone.
- 2026-09-17 — UI mirrors the server gates: a response that is not `refused` but has an empty
  `answer` or zero `citations` is rendered as the refusal card, never as a blank answer. The
  header's document list is read from `data/docs.json` at build time, with the 7 titles hardcoded
  as a fallback until ingest has run.
- 2026-09-17 — Retrieval gate uses `normScore` = BM25 score ÷ query-term count (length-stable), with
  prefix/fuzzy matching only on terms longer than 3 chars (short tokens like "a"/"is" otherwise
  expand to every a-word and score off-topic questions). THRESHOLD is calibrated by the eval, not
  by hand, and must be re-run when the corpus changes (idf scales with corpus size).
- 2026-09-17 — LLM call: `claude-sonnet-5`, `max_tokens` 700, thinking disabled (so the budget goes to
  the answer), no `temperature` (Sonnet 5 rejects sampling params). Mock path when `LLM_MOCK=1` or
  no `ANTHROPIC_API_KEY`; API outages surface as 502/503, never as a refusal.
- 2026-09-17 — Ingest: PPM 160-9 (Student Organizations) is unservable on UCSD's side — getdoc.php
  answers "2 published documents with the same documentID" and no alternate URL works. `npm run ingest`
  skips it with an ERROR line and exits 1, so the v1 corpus is 6 docs until UCSD fixes the record.
- 2026-09-17 — Chunk ids follow the labels printed in the document. `section` is the label path of the
  nearest heading (`5`, `IV`, `POLICY-STATEMENT.III`; unnumbered template headings become slugs so
  160-6's three `I.` sections stay distinct). Every labeled clause is its own chunk, parents included
  (`5.F` lead-in plus `5.F.1`…), and prose directly under a heading is cited as the heading itself
  (`160-6#SCOPE`). A clause whose `.1/.2` split parts would collide with real sub-clauses is kept whole.
- 2026-09-17 — Eval set is 30 student-phrased questions (22 answerable with quote-checked `expectedChunks`
  across all 6 ingested docs, 8 off-corpus refusals). `hit@k` = at least one expected chunk in the top k;
  scores reported are `normScore`, the quantity THRESHOLD gates. First run on the real corpus: normScore
  lands at 5–27 (THRESHOLD 0.85 was tuned on the 6-chunk fixture and never fires), and the top score of
  off-corpus questions overlaps answerable ones — see eval/results.md before re-tuning THRESHOLD.
- 2026-09-17 — Integration: retrieval drops function words plus "ucsd/uc/san/diego/university" and
  single-letter fragments, indexes heading and docTitle at boost 1 (were 3 and 2), and turns fuzzy matching
  off; hit@3 went from 10 to 16 of 22 with no change to `expectedChunks`. THRESHOLD = 3.5, just below the
  lowest answerable top score (3.68); off-corpus tops run 1.56–9.97, so gate 1 catches only 2 of 8 and gate 2
  (the LLM's NO_ANSWER) is the primary refusal mechanism on this corpus. Mock-mode e2e refusal numbers are a floor.
- 2026-09-17 — `data/docs.json` and `data/corpus.json` are committed (Vercel builds read them); the fixture
  corpus and the header's hardcoded fallback list were removed with them.
- 2026-09-17 — Inline `[id]` markers for validated citations stay in `answer`, one id per bracket, so the UI
  renders them as chips anchored to the source cards; markers for ids the model was not shown are dropped.
- 2026-09-17 — package.json is `"type": "module"`: lib/*.js are ESM and Node otherwise warns on every eval run.
- 2026-09-17 — Ingest fallback (supersedes the "6 docs" entry above): a document getdoc.php cannot serve is taken
  from the Internet Archive's newest capture of UCSD's legacy page `adminrecords.ucsd.edu/ppm/docs/<id>.html`
  (the same Word export in different chrome; the live legacy URL now redirects to the portal). 160-9 comes from
  the 2026-07-30 capture: effective 2023-10-06, superseding the 2018-11-01 version the index still lists — the two
  published records upstream are those two versions. Its `url` is the capture itself, so the citation link opens
  the policy text instead of the error page. The corpus is 7 docs / 638 chunks; the six primary docs are unchanged.
- 2026-09-17 — Gate 1 has a second condition, term coverage: the share of the question's content terms that
  match anywhere in the corpus must be ≥ `MIN_COVERAGE` (0.5). BM25 let one rare shared word carry the score —
  "How much is a parking ticket?" cleared THRESHOLD on "parking" alone and was answered in mock mode; with
  "much" and "ticket" absent from every policy it is now refused before the LLM. On the 7-doc eval the pair
  refuses 0 of 22 answerable (q05 and q11 sit exactly on 0.5) and 3 of 8 off-corpus questions at gate 1
  (was 2); THRESHOLD stays 3.5 (answerable 3.76–26.02, off-corpus 1.58–10.13). q24/q25/q27/q28/q30 share
  real vocabulary with the policies and remain gate-2 (NO_ANSWER) territory. The `retrieval` response field is
  unchanged (`topScore`, `k`), so a refusal can show a topScore above THRESHOLD.
- 2026-09-17 (evening) — Removed chunk retrieval. Measured on our own 30-question eval, BM25 found an
  expected clause in the top 3 only 73% of the time, and the first live question ("Can UCSD share my
  grades with my parents?") was refused because the answering clause (160-2 §8.A) ranked outside the
  top 6. The corpus is ~41k tokens, so the model now reads all 7 policies on every question, with the
  API's citation feature supplying char-exact passages that we resolve to clauses. A 160-2-only smoke
  test answered correctly ("not without written consent"), cited §3.D, §3.J.2, §8.A, §9.A.*, §9.B,
  §10.A, and read 27,748 tokens from cache on the second call.
- 2026-09-17 (evening) — Model is claude-opus-5 (the Claude API skill default), adaptive thinking at
  effort "low"; ~12 s per answer, ~$0.05 per question at cached rates. Sonnet 5 is the knob if
  latency matters more than answer quality.
- 2026-09-17 (evening) — Eval expectations are being re-derived: three of the day-1 expectations pointed
  at the wrong document (q07→160-3, q09→160-6, q21→160-11), so every answerable question now carries a
  verbatim answering quote and is independently refuted before it counts.
- 2026-09-17 (evening) — Full-policy reading is implemented: `lib/corpus.js` writes each policy as one plain-text
  document ("[<clause>] <text>" per chunk, spans recorded) and resolves a cited char range to the chunk with the
  largest overlap, since a citation can straddle clauses. The request goes through `client.beta.messages.create`
  with `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`, the Claude API skill's default for Opus 5)
  so a safety-classifier decline is re-run server-side instead of surfacing as a refusal. Measured on the real
  corpus: the 7 documents are 74,004 prompt tokens under Opus 5's tokenizer (the ~41k figure above was an
  estimate); the second call reads all 74,004 from cache; ~10 s per answer.
- 2026-09-17 (evening) — Eval v2: `eval/run.mjs` is end-to-end only (the retrieval tier went with lib/retrieve.js).
  It POSTs each question to /api/ask (`EVAL_URL` overrides, 3 in flight, 90 s each) and scores answered/refused on
  all 30, `cited-expected` (a citation id ∈ expectedChunks) and `cited-doc` (partial credit: a citation in the
  expected policy) on the 22 answerable, plus per-question latency and `grounding.cacheRead`; a GET preflight exits 1
  when nothing is listening, so no paid call is wasted. Every answerQuote is re-checked verbatim on each run.
  Refutation fixes: q12's quote is now an actual government (ASUCSD) and its expectedChunks cover the whole authorized
  list POLICY-STATEMENT.1–.9; q03 adds the exhibit 160-2#DIRECTORY-INFORMATION.1; q21's quote is byte-identical in
  160-11#4.A.1 (privacy), so a question may carry an optional `note` and `mustCite: [ids]` — cited-expected then also
  requires every mustCite id to be cited (q21: 160-11#4.B.1), which a quote-only grader could not check.
- 2026-09-17 (evening) — Integration: the first real-key eval run scored 30/30 on answer/refuse but 18/22 on
  cited-expected, and all four misses (q06, q12, q18, q21) were one resolver rule — a citation that straddles a
  lead-in and its sub-clause (or a whole list) was attributed to the single largest-overlap chunk, the parent,
  not the clause holding the answer. `resolve()` now returns every clause the citation covers by at least half
  of the clause or half of the citation; each becomes its own citation, and `quote` is the cited words inside
  that clause with the `[label]` prefix removed (the contract's "≤300 chars from chunk text"). Second run:
  30/30, cited-expected 22/22, with no change to questions.json and no prompt change. Side effects: a citation
  over a list emits one chip per item (q12 shows ten), and a clause whose text is "None" (160-11 §3) is cited
  when a range starts there.
