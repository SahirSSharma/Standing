# Changelog

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
