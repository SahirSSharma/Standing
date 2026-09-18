# Changelog

## 2026-09-18 — Quick picks: answers written for your situation
- Picking a situation card now opens "Tell Pip a bit more" (`app/components/Context.js`): two to four
  quick picks per situation as chips, yes/no and sliders — where the protest is, how many people, amplified
  sound, who is organising; what a grade dispute is about and whether the instructor has been asked; whether
  the student is their parents' tax dependent and has signed a release; days since a conduct notice or a parking
  citation; GPA and quarters on academic notice; the week of the quarter and financial aid for a withdrawal.
  "Get my answer" sends the preset question plus one "My situation: …" sentence; "Skip, just ask" sends the
  preset alone.
- Above the answer the picks stay editable ("Your situation" → Change). Nothing is sent on a change: "Update
  answer" appears and sends once, and every answer is kept for the session so a combination already asked
  comes back instantly. Typing a different question drops the situation.
- `lib/situations.js` holds the data (presets byte-identical to eval q62–q69) and `compose()`;
  `eval/check.mjs` now fails if a preset drifts from the eval set or any of the 204 pick combinations is
  over the route's 500 characters. Server and prompt unchanged; no real-model calls were spent.

## 2026-09-18 — Pip, and answers that say what the policies don't cover
- Pip, Standing's sea lion (`app/components/Pip.js`): one inline SVG in the brand colours, posed by prop
  and animated in CSS (`pip-*` in globals.css, all off under prefers-reduced-motion). Waves once in the
  hero, reads and bobs while an answer loads, points at the speech bubble and moves its mouth when the
  short answer lands (cheers on "yes"), sits sorry on a refusal, and is the header mark, favicon
  (`app/icon.png`, `app/apple-icon.png`) and Open Graph image (`app/opengraph-image.png`, rendered from the
  same drawing). Sahir picked the sea lion over a pelican and an abstract mark.
- Friendlier copy: the hero explains what Pip does, "Something happened? You've got options.", loading steps
  in plain words, a "no" with "You can" items adds "You still have options — see what you can do below",
  and the refusal card names four campus offices (Ombuds, Student Legal Services, SAGE, OPHD; URLs checked
  live) before the situations and the library links.
- Prompt: silence is not a "no". When the policies cover the topic but say nothing about the point asked
  the verdict is `n/a` with a bold line saying what they do not cover; a topic the area does not cover is
  `NO_ANSWER`. Found by the full eval (a "grade on a curve" question got "Verdict: no" from a regulation that
  never mentions curves). `lib/sections.js` now parses `n/a` (the regex only took letters, so n/a answers
  had shown their verdict line as text) and folds unknown headings into "Why" under a bold label.
- Router: an explicit `{"area": null}` refuses without a read (0.2¢, < 1 s; it was two area reads); a
  garbled reply still falls back to keyword routing. `max_tokens` 2,000 (one answer in 69 hit 1,600).
- Eval: an n/a answer to an off-corpus question counts as correct and prints as "answer (n/a)"; q64
  accepts the consent clause 160-2 §9.A. Full v3 runs recorded in `eval/results.md` and README.

## 2026-09-18 — v3: 42 policies, routed areas, structured answers
- Corpus v3 (`scripts/catalog.mjs`, `npm run ingest`): 42 policies in six life areas — 34 PPM documents
  (records, conduct, speech & events, safety & discrimination, money & campus life) and 8 Academic Senate
  regulations (grading, add/drop/withdrawal, grade appeals, repeats, probation, minimum progress,
  graduation, the academic integrity policy). New Senate page parser (nested clauses, amendment stamps
  → effective/supersedes dates, one-paragraph regulations), decimal clause labels ("3.1.1"), and a
  space-boundary split for a single 10k-char run-on. 1,902 chunks (was 638), max chunk 1,799 chars.
  `data/areas.json` lists the areas; docs carry `source`, `label`, `area`, `name`, `summary`.
- Routing at the area level (`lib/llm.js`): claude-haiku-4-5 picks the area (and a runner-up) from the
  policy names and summaries (~0.1¢); Sonnet 5 reads that area's 5–9 policies from a per-area 1-hour
  cache; NO_ANSWER re-reads the runner-up once. Keeps an answer at ~2¢ warm on a corpus four times larger.
  Cache-write cost is now logged at the 1-hour rate (2× input). `grounding` reports `area`, `areaName`,
  `routed`, `retried`.
- Structured answers: the model writes Verdict / bold short answer / Why / They can / You can / Steps /
  Deadlines; `lib/sections.js` parses them and `/api/ask` returns `verdict` + `sections` alongside the
  markdown. Citations carry `label` ("PPM 160-2", "Senate Regulation 502"), `docName`, `area`.
- `POST /api/draft`: a request the student can send (records request, grade appeal, grievance), written
  from the same cached area plus the answer's cited clauses.
- Mock mode routes by keyword overlap and fills every section, so the UI and eval run without a key.

- UI v3 — home page: hero, "Something happened?" (eight situation cards with preset questions), "Browse by
  area" (six cards into the library); Examples.js and Knows.js removed. Answer page: Verdict (mark that
  draws itself + short answer), Diagram (numbered timeline for steps, "They can / You can" columns),
  Deadlines with a date calculator, "Why this answer" and Sources behind expanders (chips still highlight
  and scroll to a card), Draft a request (`/api/draft`), Copy answer. Refused card suggests situations
  and links to the library. Progress steps renamed for routing. Chips and cards show the policy label.
- Policy library: `/policies` (areas, cards with date badges) and `/policies/[docId]` (metadata, clauses
  under the manual's headings, find-in-policy filter, closed-section previews), all static; SiteHeader /
  SiteFooter shared with the home page; `sentenceCase` shared.
- Eval: 61 questions (46 answerable across the six areas, 15 refusers) with an `area` field, `eval/check.mjs`
  offline validator, `npm run eval` grouped by area with router accuracy and total cost.
- After the first v3 eval (18 answers, then the key's usage limit): the refusal rule opens the system prompt,
  `max_tokens` 1,600, `grounding.stopReason` reported and logged; the eval's `area` may be a list where two
  policies both answer; the eight home-page situations are eval questions q62–q69; router summaries separate
  filing a grievance (160-11) from how a complaint is processed (200-23).
- Ingest repairs: SR-516 is cited as POLICY-STATEMENT (was empty), Word tables of contents dropped (135-5),
  a Senate clause's bold opening title is its heading (Appendix 2), a date in "Issuing Office" is absent
  (135-9). Areas: shorter blurbs so the cards fit three across on wide screens.

## 2026-09-17
- Project created for LexHack 2026. Next.js scaffold, design doc with fixed data/API contracts.
- Ingest (`npm run ingest`): fetches the PPM "Student Matters" documents into `data/docs.json` and
  `data/corpus.json` — 6 docs, 602 clause-level chunks (PPM 160-9 is unservable upstream). Data committed.
- Retrieval (`lib/retrieve.js`): MiniSearch BM25 over the chunks with stopword removal and prefix
  matching; gate 1 threshold calibrated on the eval (THRESHOLD 3.5).
- `POST /api/ask`: retrieve → gate → Claude (`claude-sonnet-5`, given the clauses only, must cite ids) →
  citation validation. `LLM_MOCK=1` answers with the top clause so everything runs without a key.
- UI: question box with example chips; answer with clickable citation chips; source cards with clause,
  heading, quote, effective date and official link; refusal card listing the covered documents.
- Eval (`npm run eval`): 30 questions, retrieval hit@k, threshold calibration, and an end-to-end tier
  against a running server, written to `eval/results.md`. Day-1 numbers: hit@1 11/22, hit@3 16/22,
  hit@6 17/22, mock end-to-end 24/30.
- Integration: stopwords plus heading/title boost 1 took hit@3 from 10 to 16 of 22; the mock answer no
  longer splits sentences at "$0.10"; inline `[id]` markers for valid citations are kept so the UI can
  render them as chips; package.json is `"type": "module"`; the corpus fixture and the header's
  hardcoded document list were removed now that `data/` is committed.
- Repair: `npm run ingest` falls back to the Internet Archive's newest capture of UCSD's legacy PPM page
  when getdoc.php cannot serve a document, which brings in PPM 160-9 (2023-10-06 revision, linked to the
  capture) — the corpus is now 7 docs / 638 chunks with the six primary docs unchanged. Gate 1 also
  requires term coverage (`MIN_COVERAGE` 0.5: at least half of the question's content words must match
  somewhere in the corpus), so "How much is a parking ticket?" is refused instead of answered from the
  one clause that mentions parking. Eval on the 7-doc corpus: hit@1 11/22, hit@3 15/22, hit@6 17/22,
  gate 1 refuses 3/8 off-corpus questions, mock end-to-end 25/30; `eval/results.md` is stamped with the
  local date.
- v2 — full-policy reading (evening). Retrieval is gone: `lib/retrieve.js`, MiniSearch, `THRESHOLD` and
  `MIN_COVERAGE` are removed. `lib/corpus.js` writes each policy as one plain-text document with clause
  spans; `lib/llm.js` sends all seven as document blocks (74k tokens, prompt-cached) to `claude-opus-5`
  with the API's citation feature on and resolves every cited character range to clauses; `POST /api/ask`
  refuses on `NO_ANSWER` or zero resolved citations and reports `grounding` (documents, input tokens,
  cache hit, model) on every response. The `retrieval` response field is gone; nothing in the UI read it.
- Eval v2: `npm run eval` is end-to-end only. It POSTs the 30 questions to the running server three at a
  time, re-checks every `answerQuote` verbatim on each run, scores answer/refuse on all 30 and
  `cited-expected` / `cited-doc` on the 22 answerable, and exits before any paid call if nothing is
  listening. q12's quote now names an actual government (ASUCSD) and expects the whole authorized list;
  q03 adds the directory-information exhibit; q21 carries `mustCite` because its sentence appears
  verbatim in two sections of PPM 160-11.
- Citation resolution: a cited range that straddles clauses maps to every clause it covers by at least
  half (of the clause or of the citation), each with the cited words from that clause as its quote,
  instead of to the single largest-overlap chunk — the first real-key eval run lost q06, q12, q18 and
  q21 that way, with the model citing the right passage and the server crediting the parent lead-in.
  Final eval (real key): 30/30 answer/refuse, cited-expected 22/22, cited-doc 22/22, cache hits 30/30,
  median 12.9 s.
- Docs rewritten for v2 (README, PROGRESS); the v1 retrieval numbers stay in the README as the reason
  retrieval was removed.
- Repair after the independent verifier pass: DESIGN.md's architecture and contract sections carry the
  measured figures (74k corpus tokens, a citation resolved to every clause it covers, `inputTokens` 74025)
  instead of the pre-measurement ~41k / single-clause wording; q21's eval note no longer says "retrieval";
  PROGRESS.md records the API usage-limit blocker (the key is capped until 2026-10-01).
- Default model is now Claude Sonnet 5 with a 1-hour cache on the policy corpus: about $0.02 per answer instead of $0.05, and no repeated cache rebuilds between sporadic questions. `STANDING_MODEL` switches it back.
- New look: warm paper background, "Know where you stand." hero, a large search field, six example-question cards, a progress card while the policies are read, a "Short answer" callout with clause pills, sticky source cards that quote the clause with its effective date and a link to the official policy, and honest not-covered / error states. Works at phone width through 2560 px.
- Answers now open with a one-line bold verdict before the explanation.
- A citation to a whole list now shows as one source card quoting the items, instead of one card per item.
- Evaluation re-run on the default Sonnet 5 model: 30/30 decisions, 22/22 citations, 5.1 s median.
