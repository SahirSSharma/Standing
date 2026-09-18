# Progress

Deadline: **Sept 27, 2026, 2:00 pm PDT** (5 pm EDT). Target submission: Sept 26.

| Day | Date | Goal | Status |
|---|---|---|---|
| 1 | Sep 17 | Repo, contracts, corpus ingest, cited Q&A end-to-end with the real key, eval harness | done — details below |
| 2–4 | Sep 18–20 | Cited Q&A end-to-end with real key; eval ≥ target; refusal gate tuned | done on day 1 (30/30, 22/22) — see below |
| 5–7 | Sep 21–23 | UI polish (1336–2560 px), staging on Vercel, real students try it | UI redesign shipped to staging Sep 18 (verified 390–2560 px); Sahir's verdict Sep 18: "too boring, too few policies" → v3 below |
| 8 | Sep 24 | Demo video (2–3 min) + README final | |
| 9 | Sep 25 | Buffer, second-institution ingest if time | |
| 10 | Sep 26 | Devpost submission complete | copy, thumbnail and gallery ready in `devpost/SUBMISSION.md` (Sep 18) — Sahir pastes them; video (Sep 24) and the live link (production, on his OK) still to add |

## v3 — 42 policies, visual answers (started 2026-09-18, Sahir's call)
Sahir: "too boring and has too little policies" + "diagrams / easy / animations, less text at first, then the
user decides to expand". Chosen (all four): situations → rights sheets, browsable policy library, draft a
request letter, deadline calculator (stretch, last).

| # | Task | Status |
|---|---|---|
| 1 | Catalog of 42 policies in 6 areas (34 PPM + 8 Senate), Senate parser, decimal labels | done — 1,902 chunks |
| 2 | Area router (Haiku) + per-area cached answer + runner-up retry; structured answer; `/api/draft` | done — live smoke test: grade appeal, 13 clauses, 19.9¢ cold / ~2¢ warm |
| 3 | DESIGN.md contracts (docs/areas/API/answer format) | done |
| 4 | Home: situations + areas + fewer words | done (agent built, verifier passed, my fixes: wide-screen 3-column areas, card hints) |
| 5 | Answer page: verdict, diagram, deadlines + calculator, expanders, draft a request | done (verified at 390–2560 on the mock; real answers checked in the eval) |
| 6 | Policy library `/policies` + `/policies/[docId]` | done (42 static pages) |
| 7 | Eval: +questions for the new areas, router accuracy, one real run | done — 69 questions validated; three full runs in "Eval runs" below |
| 8 | Verify 390–2560 px, lint, build, staging deploy, curl-verify, docs, commit | done — staging https://standing-18u8jirge-sss-4bfd.vercel.app (pages, icons, a router refusal in 2 s and a real grade-appeal answer through the Vercel function all verified with `vercel curl`) |
| 9 | Full 69-question eval once the limit was raised; fix what it finds | done — see "Eval runs" below: "no from silence" fixed in the prompt, `n/a` parsed, router-null refusals without a read |
| 10 | Pip the sea lion + friendlier, more positive copy (Sahir's call, Sep 18 evening) | done — hero wave, loading read, verdict point-and-talk, refusal with real offices, favicon/OG; verified 390–2560 on the mock, real answers screenshotted |
| 11 | Quick picks: short questions + sliders per situation, editable above the answer, "Update answer", session cache (Sahir's call, Sep 18 night; no spend) | done on the mock — 30 Playwright assertions (request bodies, dirty state, cache hits, skip path) at 390–2560; real-model behaviour unverified (~16¢ to check) |
| 12 | Devpost package: paste-ready copy for every form field, 1200×800 thumbnail, nine 3:2 gallery frames (`devpost/`) | done, $0 — the answer frames replay a real answer recorded earlier (`vercel curl` smoke test), the rest is the mock server's real UI; video and live link pending |

## Devpost, production and the .xyz domain (2026-09-18, afternoon)
- `devpost/SUBMISSION.md` holds every form field in order (name 8 chars, pitch 188 of 200, About in
  Markdown with a "Tech stack & credits" section because the rules require every API, framework and
  third-party tool listed, built-with tags, links, a checklist). `devpost/thumbnail.png` is 1200×800;
  `devpost/gallery/` has nine 3:2 frames. The rules also fix the video at **three minutes or less**
  (YouTube, Vimeo or Loom) and score impact 25 / technical 25 / UX 20 / originality 15 / presentation 15.
- **"Try it out" has no live link yet.** Staging is behind Vercel's deployment login, there is no
  production deployment (`vercel ls --prod` is empty) and `ANTHROPIC_API_KEY` exists only for Preview.
  The public repo satisfies the rules on its own, but the deployed link is what "functioning
  prototype" is scored on. On Sahir's go: `vercel env add ANTHROPIC_API_KEY production` (paste the key),
  `vercel deploy --prod --yes`, then curl `/`, `/policies`, `/policies/SR-515` and one router refusal
  (0.2¢) and one real answer (2–25¢) on the production URL before reporting; then the domain.
- **Free .xyz domain (sponsor perk):** promo code `LXH26`, 350 first-come, valid to Oct 31 2026, one
  year free. Register at gen.xyz/register: search the name → Go to checkout → set the term to **1 year**
  (3 years voids the code) → Recommended Add-Ons (leave as is) → Information & Checkout → code LXH26 →
  Apply (total must read $15.00 before and $0.00 after; any other price means the name is premium, pick
  another) → contact details → PayPal → Submit Order → click the verification email within 15 days or
  the domain is suspended. Unregistered on Sep 18 per the registry's RDAP: `knowwhereyoustand.xyz`
  (first choice — the tagline), `askpip.xyz`, `wheredoistand.xyz`, `yourstanding.xyz`,
  `trystanding.xyz`, `standingucsd.xyz`; `standing.xyz`, `standingapp.xyz` and `whereyoustand.xyz` are
  taken. Pointing it at Vercel waits for production: `vercel domains add <name>` prints the records to
  enter under Manage DNS at gen.xyz/account.

## Blocker — API usage limit hit AGAIN (2026-09-18, during the v3 eval) — RESOLVED the same evening
Sahir raised the Console limit; every run below happened after that. Kept for the record:
The first v3 eval run got 18 answers in (all 18 decisions right, 15/18 cited the expected clause) and then
every call failed with 400 "You have reached your specified API usage limits. You will regain access on
2026-10-01" — the Console **monthly spend limit** for the key's workspace, not the credit balance. The $20
credit is untouched by this; the limit is a separate cap. Until it is raised, staging and the eval 502 on
every real question. Fix (Sahir): Console → Settings → Limits → the workspace's monthly spend limit → set
it to at least the credit balance (or remove it). Then `npm run eval` once (≈$3.00 for 69 questions).
Spent so far today: ≈$3.60 (two v2 evals, the crashed one, the v3 smoke test, 18 v3 answers).

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

## Not yet verified (updated 2026-09-18, late)
- Pip's motion by a human eye: the wave in the hero, the point-and-talk at the answer and the reading bob
  while loading are CSS animations that a screenshot cannot show. Everything else on the page is verified
  in Chrome at 390–2560 px (mock content) and with real answers at 1920 and 390.
- Answers vary run to run and the eval grades only the decision and the citation ids, not the prose.
  A second question set nobody tuned against would be a fairer number.
- Quick picks with the real model: whether the answer actually changes with "amplified sound" or "week 8"
  and whether the router keeps the longer question in the same area. About eight warm calls (~16¢); not
  run, per Sahir's no-more-spend instruction. The eval's q62–q69 grade the presets without picks. The three
  situation shortcuts on the refusal card open the same picks panel through the same handler, but the mock
  never refuses, so that path has no test.
- Vercel under load: one real answer through the deployed function took 18 s with a warm cache; how the
  per-area cache behaves when many students hit cold functions at once is unmeasured.

## Eval runs (v3, 69 questions; full tables in `eval/results.md` for the latest)
| Run (2026-09-18) | Decisions | Expected clause | Router | Cost | Notes |
|---|---|---|---|---|---|
| 1 — first full run, cold caches | 67/69 | 52/54 | 54/54 | $2.46 | 2 "false answers" were honest n/a answers the parser couldn't read; 1 real defect: "no" inferred from silence (grading curves) |
| 2 — prompt rule for silence, router-null refusals | 66/69 (+3 API timeouts) | 51/51 completed | 51/51 | $2.02 | n/a answers still mis-scored (parser), fixed after; the 3 timeouts re-asked by hand: all right |
| 3 — parser reads n/a, unknown headings folded, max_tokens 2000 | 66/66 completed (+3 API timeouts) | 53/54 | 54/54 | $1.14 | the 3 timeouts were the last three refusers during an API stall; re-asked: refused in < 1 s each |

The stalls (calls hanging 90–170 s while a fresh process reached the same model in 0.6 s) look like a hung
connection in the long-lived local `next start` process rather than the API itself; the SDK client now
times out at 40 s with one retry (a fresh connection) so a hung one cannot eat a whole request. Rule for
the demo takes on Sept 24: restart `next start` right before recording. The committed `eval/results.md`
for run 3 still prints "false answers 3 (q59, q60, q61)" for those three timeouts; the scorer was fixed
right after the run to count an error as an error, not a false answer, and a rerun was not worth $1.14.

## Budget — $20 of API credit for the rest of the project (from 2026-09-18; revised after the v3 eval)
Rules so it lasts: agents run with `LLM_MOCK=1` only — real-key calls are made by hand; `npm run eval`
runs once per change to `lib/llm.js`, the prompt or the router summaries (sequential, area by area, ≈$2.46 cold or ≈$1.14 warm
for 69 questions of which ≈$1.20 is the six cache writes); answers are capped at 2,000 output tokens; each
area's cache lives for an hour; every call logs its estimated cost and stop reason.

| Use | Budget | Spent so far |
|---|---|---|
| Evals (v2 ×2 + one crashed run + v3 partial $2.25; three full v3 runs $2.46 + $2.02 + $1.14) | $8 | $7.87 — no more full runs unless the prompt or router changes |
| Live verification (smoke tests, hand re-asks of eval misses, real-answer screenshot passes) | $1 | $0.75 |
| Sahir + friends testing, demo video takes | $5 | $0 |
| Judges (Sept 27 onward, ~150 questions ≈ $3 + cache writes) | $4 | $0 |
| Reserve | $2 | — |
Total spent ≈ $8.60 of $20 (2026-09-18, late evening).
