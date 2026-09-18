# Progress

Deadline: **Sept 27, 2026, 2:00 pm PDT** (5 pm EDT). Target submission: Sept 26.

| Day | Date | Goal | Status |
|---|---|---|---|
| 1 | Sep 17 | Repo, contracts, corpus ingest, retrieval + API + UI first pass, eval harness | done — details below |
| 2–4 | Sep 18–20 | Cited Q&A end-to-end with real key; eval ≥ target; refusal gate tuned | |
| 5–7 | Sep 21–23 | UI polish (1336–2560 px), staging on Vercel, real students try it | |
| 8 | Sep 24 | Demo video (2–3 min) + README final | |
| 9 | Sep 25 | Buffer, second-institution ingest if time | |
| 10 | Sep 26 | Devpost submission complete | |

## Day 1 — what works (2026-09-17)
- `npm run ingest`: 7 docs / 638 clause chunks in `data/`; PPM 160-9 comes from the Internet Archive's
  capture of UCSD's legacy page because getdoc.php cannot serve it. Committed.
- `POST /api/ask` runs end-to-end with `LLM_MOCK=1`; response verified field-for-field against the
  DESIGN.md contract (`reason` absent when answered, 8 citation fields, `retrieval.k` 6); 400 on bad
  input, 405 on GET. All four example-chip questions answer rather than refuse.
- UI renders the answer, citation chips, source cards and the refusal card (verified by SSR greps).
- `npm run eval`: hit@1 11/22, hit@3 15/22, hit@6 17/22; gate 1 (THRESHOLD 3.5 + MIN_COVERAGE 0.5)
  refuses 0 answerable and 3/8 off-corpus questions; mock end-to-end 25/30.
- `npm run build` and `npx eslint .` are clean.

## Not yet verified
- The real-key path (`ANTHROPIC_API_KEY` set) has never been exercised. Gate 2 (`NO_ANSWER`) is untested,
  and on this corpus it still carries most of the refusal load: five of the eight off-corpus eval questions
  (e.g. "How do I appeal a parking ticket I got on campus?") share real vocabulary with the policies and are
  answered in mock mode.
- The UI in a real browser at 1336–2560 px: chip→card highlight and layout are implemented but unseen.
- Retrieval hit@3 target is 80%; day 1 is 68%. The remaining misses are paraphrase gaps BM25 cannot close
  on its own (day 2–4 work: query expansion or a reranker).
- No Vercel preview deployment yet.
