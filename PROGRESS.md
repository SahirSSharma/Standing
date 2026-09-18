# Progress

Deadline: **Sept 27, 2026, 2:00 pm PDT** (5 pm EDT). Target submission: Sept 26.

| Day | Date | Goal | Status |
|---|---|---|---|
| 1 | Sep 17 | Repo, contracts, corpus ingest, cited Q&A end-to-end with the real key, eval harness | done — details below |
| 2–4 | Sep 18–20 | Cited Q&A end-to-end with real key; eval ≥ target; refusal gate tuned | done on day 1 (30/30, 22/22) — see below |
| 5–7 | Sep 21–23 | UI polish (1336–2560 px), staging on Vercel, real students try it | |
| 8 | Sep 24 | Demo video (2–3 min) + README final | |
| 9 | Sep 25 | Buffer, second-institution ingest if time | |
| 10 | Sep 26 | Devpost submission complete | |

## Day 1 — what works (2026-09-17)
- `npm run ingest`: 7 docs / 638 clause chunks in `data/`; PPM 160-9 comes from the Internet Archive's
  capture of UCSD's legacy page because getdoc.php cannot serve it. Committed.
- `POST /api/ask` with the real key: the model reads all 7 policies (74k tokens, served from the prompt
  cache after the first call) and answers with citations resolved to clauses. Verified field-for-field
  against the DESIGN.md contract (`reason` only when refused, 8 citation fields, `grounding` on both
  answered and refused responses). "Can UCSD share my grades with my parents?" → answered in 9.3 s with
  8 citations into PPM 160-2; "How much is a parking ticket?" → refused in 2.6 s. 400 on bad input,
  405 on GET.
- `npm run eval` with the real key: 30/30 answer/refuse correct, cited-expected 22/22, cited-doc 22/22,
  cache hits 30/30, median 12.9 s (`eval/results.md`). The first run scored 18/22 on cited-expected;
  all four misses were the server crediting a straddling citation to the parent clause, fixed in
  `lib/corpus.js` with no change to the questions or the prompt.
- `LLM_MOCK=1` still runs the UI and the eval plumbing without a key (it answers with the closest clause
  and never refuses).
- UI renders the answer, citation chips, source cards and the refusal card (verified by SSR greps);
  nothing in the UI read the removed `retrieval` field.
- `npm run build` and `npx eslint .` are clean.
- Vercel: project linked, `ANTHROPIC_API_KEY` set for Preview, and a preview deployment is live
  (https://standing-6bbczggh5-sss-4bfd.vercel.app) — built from the day-1 retrieval code before the v2
  pivot; the next push rebuilds it on v2.

## Blocker — API usage limit (found 2026-09-17, late)
- The `ANTHROPIC_API_KEY` in `.env.local` hit its Console usage limit after roughly 70 real answers in one evening (two full 30-question eval runs plus probes): every request
  now fails with 400 "You have reached your specified API usage limits. You will regain access on 2026-10-01
  at 00:00 UTC", which `/api/ask` reports as 502. The deadline is 2026-09-27 and the Vercel Preview uses
  the same key, so the deployed product 502s on every real answer until the limit is raised. Fix: raise the
  spend limit for this key's workspace in the Anthropic Console (Settings → Limits) or switch to a fresh key,
  then re-run `npm run eval` (the independent verifier got q01–q07 through, 7/7 correct, before the cap
  tripped; `eval/results.md` still holds the full day-1 run).

## Not yet verified
- The UI in a real browser at 1336–2560 px: chip→card highlight and layout are implemented but unseen.
  A citation over a list emits one chip per item (q12 puts ten chips on one sentence) — needs a look.
- The v2 build on Vercel: answers take ~12 s against a 60 s function limit, and cache behaviour across
  cold functions is unmeasured.
- Answers vary run to run and the eval grades only the decision and the citation ids, not the prose.
  A second question set nobody tuned against would be a fairer number.
- Cost and latency: measured ~$0.05 and ~12 s per answer on Opus 5; default is now Sonnet 5 (~$0.02 per answer, faster) with a 1-hour corpus cache — Sonnet eval pending the key's usage limit.

## Budget — $20 of API credit for the rest of the project (from 2026-09-18)
Rules so it lasts: agents run with `LLM_MOCK=1` only — real-key calls are made by hand; `npm run eval`
runs once per change to `lib/llm.js` or the prompt (sequential, ~$0.90); answers are capped at 1,500
output tokens; the corpus cache lives for an hour; every call logs its estimated cost.

| Use | Budget |
|---|---|
| Evals (≤4 more full runs) | $4 |
| Live verification on staging | $1 |
| Sahir + friends testing, demo video takes | $6 |
| Judges (Sept 27 onward, ~150 questions) | $4 |
| Reserve | $5 |
