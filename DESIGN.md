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
- Corpus v1 was the 7 "Student Matters" documents. Corpus v3 (2026-09-18) is the 42 policies in
  `scripts/catalog.mjs`: 34 PPM documents from every section a student can bump into, plus 8 Academic
  Senate regulations (grading, add/drop, grade appeals, repeats, probation, minimum progress, graduation,
  the academic integrity policy) — grouped into six life areas. A second institution is a later, separate ingest.

## Architecture (v3 — routed areas, decided 2026-09-18)
```
browser ──POST /api/ask {question}──▶ Next.js route
                                        │ 1. route: claude-haiku-4-5 reads the six areas (policy names + one-line
                                        │    summaries, ~1.4k tokens) and picks the area most likely to answer + a runner-up
                                        │ 2. answer: ONE document block per policy in that area (5–9 docs, 45–65k tokens,
                                        │    prompt-cached per area for an hour), native citations, cache_control on the
                                        │    last document; claude-sonnet-5, adaptive thinking, effort low, max 2000 out
                                        │ 3. map every cited char range → every clause chunk it covers by at least half
                                        │    (server-side, from the corpus) → one citation per clause
                                        │ 4. gate: router says no area at all → refuse without a read; NO_ANSWER → read the
                                        │    runner-up area once; still NO_ANSWER, or zero citations → refuse
                                        │ 5. parse the answer's sections (verdict, short answer, why, they can, you can,
                                        │    steps, deadlines) — lib/sections.js
                                        ▼
        {answer, verdict, sections, citations[], refused, reason, grounding}
```
- Full-corpus reading (v2) stopped fitting once the corpus grew from 74k to ~305k tokens: 6¢ a
  question warm and $1.20 per cold cache write would have broken the $20 budget. An area is the same
  size the whole v2 corpus was, so an answer still costs ~2¢ warm and a cold area write 18–25¢.
- Citations are produced by the API's citation feature, not typed by the model, so a citation can
  only point at text that is actually in a document. Every char range is resolved to the clause(s) it
  covers in data/corpus.json, one citation per clause; anything that fails to resolve is dropped, and
  zero citations means refusal.
- `POST /api/draft` writes a request the student can send (records request, grade appeal, grievance)
  from the same area's cached documents plus the answer they were given — no citation feature, the
  letter names clauses by label (~1.5¢).
- `LLM_MOCK=1` (or no key) routes by keyword overlap and answers with the best-matching chunks laid out
  in every section of the answer shape, cited, so the UI and eval plumbing run without a key.

## Data contracts (fixed — every component builds against these)
`data/docs.json` — array, catalog order (`scripts/catalog.mjs` is the source of truth for
`source`/`label`/`area`/`name`/`summary`):
```json
{ "docId": "160-2", "title": "Disclosure of Information From Student Records",
  "source": "ppm", "label": "PPM 160-2", "area": "records", "name": "Student records & privacy",
  "summary": "FERPA at UCSD: directory information, who may see or receive student records …",
  "effectiveDate": "2017-10-05", "supersedes": "2014-11-13", "issuingOffice": "Registrars Office",
  "url": "https://secure4.compliancebridge.com/ucsd/public/getdoc.php?file=160-2",
  "fetchedAt": "2026-09-18", "chars": 67937 }
```
`docId` is the catalog id: a PPM number (`160-2`), a PPM section (`510-1-IX`, label `PPM 510-1 §IX`)
or a Senate regulation (`SR-502`, label `Senate Regulation 502`; `SR-APPX2`, `Senate Appendix 2`).
For Senate documents `effectiveDate` is the newest amendment stamp on the page and `supersedes` the one
before it. Always show `label`, never "PPM " + docId.

`data/areas.json` — the six life areas, in display order:
```json
{ "id": "academics", "name": "Grades & academic standing",
  "blurb": "Grading, grade appeals, drops, retakes, probation, graduating", "icon": "cap" }
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
{ "answer": "string (markdown in the answer shape below, without the Verdict line; empty when refused)",
  "verdict": "yes" | "no" | "depends" | "n/a" | null,
  "sections": { "short": "**bold** first line", "why": "markdown", "theyCan": ["markdown item"],
                "youCan": [], "steps": [], "deadlines": [] },
  "citations": [ { "id": "160-2#5.A", "docId": "160-2", "docTitle": "…", "docName": "Student records & privacy",
                   "label": "PPM 160-2", "area": "records", "clause": "5.A", "heading": "…",
                   "quote": "≤300 chars from chunk text", "effectiveDate": "2017-10-05", "url": "…" } ],
  "refused": false, "reason": "string, present only when refused",
  "grounding": { "area": "records", "areaName": "Records & privacy", "documents": 5,
                 "routed": ["records", "conduct"], "retried": false,
                 "inputTokens": 63210, "cacheRead": true, "model": "claude-sonnet-5", "cost": 2.1 } }
```
**Situations and quick picks** (`lib/situations.js`, rendered by `Situations.js` and `Context.js`): each
of the eight cards has a preset `q` (byte-identical to eval q62–q69) and two to four picks — `choice`
(chips), `toggle` (yes / no) or `range` (a slider with `phrase(value)`). The question sent is
`compose(situation, values)` = `q` + `" My situation: "` + the picked first-person phrases joined by `"; "`
+ `"."`, e.g. `Can I organize a protest on campus, and what rules apply? My situation: on Library Walk;
about 200 people; we'll use amplified sound (a megaphone or speakers); it's just me and some friends, not a
student org.` The server and the prompt are unchanged — the context is part of the question text after
the cached document blocks, so the area cache still hits. Nothing is sent when a pick changes: the panel
turns dirty and "Update answer" sends once; the page keeps a session map of composed question → response,
so a combination already asked is shown again without a request. `eval/check.mjs` fails if a preset drifts
from the eval set or any of the 204 combinations exceeds the route's 500 characters.

`sections` is `null` when refused. Every section is optional (empty string / empty array) and keeps the
inline ` [<chunk id>]` markers. `grounding.cost` is the estimated spend for the whole request (router +
answer + any retry) in US cents at list prices (0 in mock mode).

**Answer format** (what the model writes; `lib/sections.js` parses it, the mock emits it):
```
Verdict: yes | no | depends | n/a
**One bold line that answers the question as asked.**
## Why            one to three sentences
## They can       - bullets: what the university / office / instructor may do
## You can        - bullets: what the student may do or is entitled to
## Steps          1. the process in order, naming who does it
## Deadlines      - "<what>: within <time> of <event>"
```
Every bullet is one sentence of ≤ 20 words; sections that don't apply are left out. `n/a` is for how-to
questions and for questions the policies cover in topic but not in the point asked ("how much is a parking
ticket?" — the parking policy never states an amount): the bold line then says what they do not cover, and
the model never turns that silence into a "no". `NO_ANSWER` is for topics the area does not cover at all. A
heading outside this list (an n/a answer sometimes writes "## What they don't cover") is folded into "Why"
under its own bold label rather than dropped.

`POST /api/draft` — request `{ "question", "answer", "citations": ["160-2#8.A", …] }` (the answer
and citation ids from a `/api/ask` response); response `{ "letter": "To: …\nSubject: …\n\n…", "grounding" }`.
400 when a field is missing or no citation id is known; LLM errors → 502/503 `{error}` as for /api/ask.

`eval/questions.json` — array of `{ "id", "question", "expect": "answer" | "refuse",
"expectedChunks": ["160-2#5.A", …], "answerQuote": "verbatim sentence from one expected chunk that
answers the question", "area": "records" }` (expectedChunks empty, answerQuote and area absent when
expect=refuse). A question is only "answerable" if answerQuote is found verbatim in one of its
expectedChunks; `area` is the area of the expected policy (docs.json) and is what the router is graded
against. Optional: `"note"` (prose for whoever grades) and `"mustCite": [ids]` — cited-expected then also
requires every mustCite id among the citations (q21, whose answerQuote appears verbatim in two sections).
`node eval/check.mjs` validates all of this offline; `npm run eval` runs the questions area by area
(refusers last) so each area's cache is written once, and reports router accuracy and total cost.

## Stack (all declared for the hackathon)
Next.js (App Router, JavaScript), Tailwind, @anthropic-ai/sdk (Claude Sonnet 5 by default, citations + 1-hour prompt caching), Vercel.

## Deployment
Vercel. Every push → preview deployment (= staging, reported automatically).
Production (`vercel --prod`) only on an explicit go.

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
- 2026-09-17 (evening) — Repair: the Architecture and API-contract sections above now carry the measured
  figures — ~74k corpus tokens (the ~41k was a pre-measurement estimate, see the 74,004-token entry), a
  citation resolved to every clause it covers rather than a single owning chunk, and the contract example's
  `inputTokens` is the 74,025 an answered question actually reports. No behaviour changed.
- 2026-09-17 (night) — Default model switched to claude-sonnet-5 (STANDING_MODEL overrides) and the corpus
  cache TTL raised from 5 minutes to 1 hour, because this is a low-cost service by nature: at cached rates
  an answer is ~$0.02 on Sonnet 5 vs ~$0.05 on Opus 5, and with sporadic traffic the dominant cost was
  re-writing the 74k-token corpus into the cache every few minutes (~$0.19 per cold call on Sonnet 5 at the
  5-minute TTL). Refusal fallbacks are only sent on Opus/Fable models. The 22/22 citation result above was
  measured on Opus 5; the eval is re-run on Sonnet 5 once the API key's usage limit is lifted.
- 2026-09-18 — List citations. When the API cites a clause together with two or more of its sub-clauses it
  is citing the list: the resolver keeps the parent and stretches its quote over the items, so one chip
  and one card carry the actual list text. A citation covering a parent's lead-in plus one sub-clause is
  citing that sub-clause. The eval counts a list citation as a hit only when its quote contains the
  expected answer text. Result on Sonnet 5: 30/30 decisions, 22/22 citations, 5.1 s median, $0.57/run.
- 2026-09-18 — Corpus v3. Too few policies was the product's real ceiling: 7 documents covered records,
  conduct and student orgs and nothing a student asks about grades, protests, harassment, money or parking.
  `scripts/catalog.mjs` now lists 42 policies in six life areas (34 PPM + 8 Senate). Ingest gained a Senate
  page parser (nested `li.clause` → "A) text" lines; amendment stamps → dates; one-paragraph regulations
  cited as their title), decimal clause labels ("3.1.1 Academic Unit" is an absolute path — 510-1 §V.A was
  one 10k-char chunk without them), and a space-boundary fallback for a single 10k-char "sentence". 1,902
  chunks, max 1,799 chars. Two 1981 sections of 510-1 (IV, VIII) parse to nothing (scans) and are left out.
- 2026-09-18 — Routing came back, at the area level. Clause-level BM25 failed (73% hit@3) because the
  answering clause is hard to find; picking one of six areas from policy names and summaries is easy, and a
  wrong pick shows up in the eval as a cited-doc miss or a false refusal. The router is claude-haiku-4-5
  (~0.1¢); the answer reads the area's 5–9 documents from a per-area 1-hour cache; NO_ANSWER re-reads the
  runner-up area once. Cache-write price corrected to the 1-hour rate (2× input, was billed as 1.25× in the
  log). First live question (grade appeal): routed academics/conduct, 13 clauses of Senate Regulation 502
  cited, 15 s cold, 19.9¢ with the area's cache write, ~2¢ warm.
- 2026-09-18 — Direction after the v2 review: less text at first, diagrams over prose, and the reader
  decides what to expand. The answer is now structured (verdict, short answer, why, they can / you can,
  steps, deadlines) so the UI can open with a verdict and a diagram — a numbered timeline when the policy is a
  process, a two-column "they can / you can" otherwise — and keep the explanation and sources behind
  expanders. Deadlines with a parseable "within N days/weeks/months" get a date calculator, client-side.
  "Draft a request" adds one ~1.5¢ call. Chosen over free-form prose because a diagram needs structure the
  model can only supply if asked for it; every part stays optional so a one-line answer still renders.
- 2026-09-18 — UI v3 (built against the mock, verified independently at 390–2560 px). Home:
  hero + "Something happened?" (eight situation cards, each a preset question) + "Browse by area" (six
  cards into the library); no example questions, no policy chip strip. Answer page: verdict mark that draws
  itself, the short answer, a numbered timeline (steps) or "They can / You can" columns, deadlines with a
  date calculator (business days skip weekends), then "Why this answer" and the sources behind expanders;
  "Draft a request" calls /api/draft. Library: /policies grouped by area with date badges ("Updated Jan
  2026", "Not updated since 1991"), /policies/[docId] with the clauses under the manual's own headings, a
  find-in-policy filter and a closed-section preview line. Eval: 61 questions (46 answerable with `area`,
  15 refusers), `eval/check.mjs`. Ingest repairs found by the library: a one-paragraph Senate regulation
  (516) is cited as POLICY-STATEMENT, Word tables of contents are dropped (135-5), a Senate clause opening
  with a bold title takes it as its heading (Appendix 2), an issuing office that is a date is absent (135-9).
- 2026-09-18 — First v3 eval run: 18 answers in, then the key's Console usage limit tripped (the same cap
  as the day-1 blocker, not the credit balance). Of the 18: 18/18 decisions, 15/18 expected clause; the three
  misses were two questions that two policies now both answer (q22: Student Grievances §4.A vs FERPA complaints
  160-2 §13.C — the eval's `area` may now be a list) and one router miss (q21, the grievance filing deadline, read
  from the complaint-procedure policy 200-23; the router summaries now separate "how a student files a grievance"
  from "how the university processes a complaint"). Two things the run could not verify and the rerun must:
  refusals under the structured prompt (all 15 refusers were behind the cap) and the runner-up retry. As
  insurance the NO_ANSWER rule now also opens the system prompt, `max_tokens` is 1600 (answers ran ~1,000 tokens
  against a 1,200 cap and Deadlines is the last section, so a cut-off would silently drop the calculator), and
  `stop_reason` is logged and reported as `grounding.stopReason`. The eight home-page situations are graded as
  eval questions q62–q69 so a demo card can never lead to an ungraded refusal.
- 2026-09-18 — Full v3 eval after the limit was raised: 67/69 decisions, 52/54 expected clause, router
  54/54, $2.46. The one real defect was "no from silence": asked whether professors must grade on a curve,
  the model read a grading regulation that never mentions curves and answered "Verdict: no … expect your
  grade to reflect individual performance rather than rank". Fix, in the system prompt: silence on the point
  asked is `Verdict: n/a` with a bold line saying what the documents do not cover; a topic the area does not
  cover at all is `NO_ANSWER`; never infer a rule from silence. The parser had to learn `n/a` too — the
  verdict regex only took letters, so every n/a answer had rendered its "Verdict: n/a" line as body text —
  and it now folds unknown headings into "Why". The eval counts an n/a answer to an off-corpus question as
  correct and prints it as "answer (n/a)". Second decision: when the router replies `{"area": null}`
  (11 of the 15 refusers), the server refuses without a read — 0.2¢ and under a second instead of two
  area reads (~3.5¢, 5 s); a garbled router reply still falls back to keyword routing, and the eval's
  54/54 routing on answerable questions is the evidence that an explicit null is safe. `max_tokens` went to
  2,000 after one answer in 69 hit 1,600. Runs 2 and 3 each had three calls stall for 90–170 s. The
  evidence points at a hung connection between the long-lived local `next start` process and the API
  rather than at the API itself: a re-ask inside that process took minutes even though its result was a
  router-only refusal, while a fresh process reached the same model in 0.6 s at the same minute. Either
  way the fix is the same — the SDK client is now `timeout: 40 s, maxRetries: 1` (a retry opens a fresh
  connection) and the ask route's `maxDuration` is 100 s so one retry fits inside it.
- 2026-09-18 — Pip. The brief: friendlier — a mascot, more positive framing, and an animation of it
  speaking or pointing to the answer. Pip is a sea lion (La Jolla's own; King Triton and the trident are UCSD marks),
  drawn as one inline SVG in the three brand colours with a gold scarf, chosen from three
  candidates (sea lion, pelican, an abstract standing figure). One component, `app/components/Pip.js`,
  posed by prop; the motion is CSS only (`pip-*` keyframes in globals.css, all off under
  prefers-reduced-motion): waves once in the hero, reads and bobs while an answer loads, points at the
  speech bubble and moves its mouth for two seconds when the answer lands (cheers on "yes"), and is sorry
  on a refusal. "More positive" is framing, not hedging: a "no" stays "no" (the mark, the caption and the
  eval are unchanged) but a "no" with "You can" items gets one line — "You still have options" — and the
  refusal names four real offices (Ombuds, Student Legal Services, SAGE, OPHD; URLs curl-checked) instead
  of only saying what Standing can't do. The favicon, apple icon and Open Graph image are rendered from the
  same drawing.
- 2026-09-18 — Quick picks. The brief: personalise it — for the protest card the student answers a few
  very short questions, one of them a slider, and can change a pick and see a new answer quickly; and
  spend no more money. The money constraint shaped the design: every distinct composed question is one
  ~2¢ call, so no control fires on its own (the panel goes dirty and "Update answer" sends once), the page
  caches every answer for the session so flipping back is free and instant, and the context rides in the
  question text after the cached documents so the area cache is untouched. The picks were chosen from what
  the corpus actually distinguishes (a grep before writing them): amplified sound, Library Walk, indoor vs
  outdoor, registered student organisations and non-affiliates for protests; non-academic criteria and the
  instructor conversation for grade appeals; tax dependents and written releases for records; academic
  integrity vs alcohol vs residential rules and the days since the notice for conduct; the five-day
  administrative-review window for parking; where and confidential-first for harassment; GPA,
  quarters on notice and units over three quarters for probation; the week of the quarter, the reason and
  financial aid for withdrawal. Typing a different question drops the situation. Verified on the mock only
  (request bodies, dirty state, cache hits, the skip path, 390–2560 px); whether the model uses the context
  well is unverified pending about eight warm calls (~16¢).
