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

## Architecture
```
browser ──POST /api/ask {question}──▶ Next.js route
                                        │ 1. retrieve: MiniSearch (BM25-style) over clause chunks → top-k
                                        │ 2. gate: if best normalized score < THRESHOLD → refuse (no LLM call)
                                        │ 3. answer: Claude, given ONLY the retrieved chunks, must cite chunk ids
                                        │ 4. gate: answer with zero valid citations → refuse
                                        ▼
                    {answer, citations[], refused, reason}
```
- Retrieval is deterministic and key-free, so the retrieval eval runs without any API key.
- The LLM is only ever shown retrieved chunks and may only cite their ids. Citations are validated
  server-side against the corpus; an invalid id is dropped, and zero valid ids means refusal.
- `LLM_MOCK=1` makes `/api/ask` return the top chunk verbatim as the answer with its citation, so
  the UI and end-to-end path work with no key.

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
  "retrieval": { "topScore": 0.83, "k": 6 } }
```

`eval/questions.json` — array of `{ "id", "question", "expect": "answer" | "refuse",
"expectedChunks": ["160-2#5.A", …] }` (expectedChunks empty when expect=refuse).

## Stack (all declared for the hackathon)
Next.js (App Router, JavaScript), Tailwind, MiniSearch, @anthropic-ai/sdk (Claude), Vercel.

## Deployment
Vercel. Every push → preview deployment (= staging, reported automatically).
Production (`vercel --prod`) only on Sahir's explicit OK.

## Decisions log
- 2026-09-17 — Corpus bounded to the 7 student-facing PPM docs; generality is proven by a second
  institution ingest later, not by ingesting all 274 now.
- 2026-09-17 — BM25 (MiniSearch) over embeddings for v1: key-free, deterministic, evaluable today.
- 2026-09-17 — Refusal is a product feature ("it tells you when it doesn't know, and shows why"),
  enforced by two server-side gates, not by prompt wording alone.
