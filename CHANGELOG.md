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
