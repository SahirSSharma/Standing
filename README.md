# Standing

**Know where you stand.** Something happened — a conduct notice, an unfair grade, a parent asking for your
transcript, a protest you want to hold, a parking ticket — and you want to know your rights. Standing reads
the official UC San Diego policies and answers with a verdict, a diagram of the process, the deadlines
that apply, and the exact clauses it relied on, each with its effective date and a link to the source. If
the policies don't answer it, Standing says so instead of guessing. One click drafts the request you can
send; a date picker turns "within ten business days" into a date. Pip, the sea lion, reads along: waves
hello, reads while the answer loads, points at the answer and speaks it, and on a refusal points you to the
campus offices that can help. Pick a situation and Pip asks two to four quick questions first — where
the protest is, how many people, amplified sound or not, who is organising — as chips and sliders, no
typing; the answer is written for that situation, and changing a pick and pressing "Update answer" gets a
new one (a combination already asked comes back instantly).

Built for [LexHack 2026](https://lexhack-2026.devpost.com/) · Track: Access to Justice & Civic Tech ·
Submission copy and images in [devpost/SUBMISSION.md](devpost/SUBMISSION.md)

_Status: v3 in progress — see PROGRESS.md._

## Run locally
```bash
npm install
npm run dev           # http://localhost:3000 — data/ is committed, no ingest needed
npm run eval          # 69 questions against the running server → eval/results.md (≈$2.46 cold, ≈$1.14 with warm caches)
npm run ingest        # re-fetch every policy in scripts/catalog.mjs → data/ (42 docs, see Corpus)
```
Put `ANTHROPIC_API_KEY` in `.env.local` for real answers. `LLM_MOCK=1` (or no key) runs without the
API: the question is routed by keyword overlap and answered with the best-matching clauses laid out in
every section of the answer shape, cited. It never refuses, so it exercises the UI and the eval plumbing,
not the product.

## Stack
- **Next.js 16** (App Router, JavaScript) deployed on **Vercel**; **Tailwind CSS 4** for the UI.
- **@anthropic-ai/sdk** — `claude-haiku-4-5` routes the question to one of six life areas;
  `claude-sonnet-5` (default; `STANDING_MODEL` overrides) reads every policy in that area (5–9 documents,
  45–65k tokens, one document block each) with the API's citation feature on, so every cited passage comes
  back as a character range into a policy rather than as text the model typed. Each area is prompt-cached
  for an hour: the first question writes it, later ones read it back at a tenth of the price (~2¢ an answer).
- No database, no embeddings, no search index, no data build step: `data/corpus.json` is committed and
  loaded once when the route starts.

## How a question is answered
1. `lib/corpus.js` writes each policy as one plain-text document, one paragraph per clause chunk
   (`[5.A] <clause text>`), records where each clause starts and ends, and groups the policies into the
   six areas of `data/areas.json`.
2. `lib/llm.js` asks a small model which area the question belongs to (it sees every policy's name and a
   one-line summary), then sends that area's documents plus the question to Sonnet 5. The reply comes
   back as text blocks, each carrying the passages it relied on as character ranges, in a fixed shape:
   verdict, one bold answer line, why, what they can do, what you can do, steps, deadlines.
3. Every range is mapped to the clause(s) it covers — at least half of the clause or half of the cited
   passage, since a citation often spans a lead-in and its sub-clause. Each clause becomes a citation:
   policy label, clause, heading, the cited words, effective date and official URL. An inline
   `[160-2#5.A]` marker after the sentence is what the UI turns into a chip.
4. The server refuses when the router says no area covers the question (no read at all, ~0.2¢), when the
   model answers `NO_ANSWER` for the routed area and again for the runner-up area, or when none of its
   citations resolve to a clause in the corpus. A refusal is an explicit card that names the campus
   offices that can help, never a blank answer. When the policies cover the topic but not the point
   asked, the verdict is `n/a` and the answer says what they do not cover — silence is never turned into
   a "no".
5. `lib/sections.js` parses the answer's sections so the page can open with the verdict and a diagram —
   a numbered timeline when the policy is a process, "they can / you can" columns otherwise — and keep
   the explanation and the sources behind expanders. `POST /api/draft` writes a request the student can
   send from the same cached area and the cited clauses.

The response shapes are fixed in [DESIGN.md](DESIGN.md).

### Why routing is by area, not by clause
Version 1 ran BM25 over the clause chunks, showed the model the top 6, and refused below a score
threshold. Measured on our own 30-question set, an expected clause was in the top 3 for only 73% of
answerable questions, and the first real question we asked live — "Can UCSD share my grades with my
parents?" — was refused because the answering clause (160-2 §8.A) ranked outside the top 6. Version 2
removed retrieval and let the model read all seven policies (74k tokens). Version 3 has 42 policies
(~305k tokens): reading them all would cost 6¢ a question warm and $1.20 per cold cache write, so the
model now reads one area at a time. Picking one of six areas from policy names is easy where finding one
clause in 1,900 was not, and a wrong pick shows up in the eval as a citation in the wrong policy or a
false refusal.

## Corpus
42 policies (`scripts/catalog.mjs`), 1,902 clause chunks, each carrying its policy's effective date and
official URL:
- **34 UCSD Policy & Procedure Manual documents** — the seven "Student Matters" documents (160-2 records,
  160-3 official email, 160-6, 160-8, 160-9, 160-10 conduct procedures, 160-11 grievances) plus the ones a
  student actually bumps into elsewhere in the manual: electronic-communications privacy, IT acceptable
  use, sexual violence and harassment, discrimination complaints, hazing, disability access, expressive
  activity (protests), major events, alcohol at events, fee refunds, billing holds, parking, license-plate
  readers, scooters, smoking, dogs, lost and found, emergency notifications, visas, and more.
- **8 Academic Senate regulations** — grading (500), add/drop/withdrawal (501), grade appeals (502),
  repeating courses (505), probation (515), minimum progress (516), graduation requirements (600) and the
  academic integrity policy (Appendix 2), with each regulation's newest amendment stamp as its date.

Two PPM documents (160-9, 200-23) are unservable on UCSD's own server — it reports two published
documents with the same id — so `npm run ingest` falls back to the Internet Archive's newest capture of
UCSD's legacy page for them and links citations to that capture.

## Evaluation
`eval/questions.json` holds 69 student-phrased questions: 54 answerable across the six areas (the eight
home-page situations among them), each with the
clause ids that contain the answer, a verbatim `answerQuote` that must appear in one of them, and the area
the router should pick; and 15 the policies cannot answer, worded to share vocabulary with them (dining
prices, grading curves, housing contracts…). `node eval/check.mjs` validates the set offline, and also
checks the eight situations in `lib/situations.js`: each preset question is verbatim in the set and every
combination of quick picks composes to a question the route accepts. The composed questions themselves
(the preset plus "My situation: …") have not been run against the real model yet. `npm run eval`
POSTs the questions to the running server one at a time, area by area, and writes
[eval/results.md](eval/results.md): the answer-or-refuse decision, the citations (a citation counts when it
is an expected clause, or the list containing it with the answer text in its on-screen quote), the router's
area, and the cost. It does not grade the prose.

Latest complete run (v3, 42 policies, 69 questions, 2026-09-18, `claude-sonnet-5` + `claude-haiku-4-5`
router; [eval/results.md](eval/results.md)): 66/66 completed decisions right — 54/54 answers, 12/12
refusals, including four off-corpus questions answered "n/a" with a line saying what the policies do not
cover — 53/54 cited the expected clause, 54/54 cited the right policy, the router chose the right area
54/54 times, 7.4 s median, $1.14 with every area served from the prompt cache. The three remaining
off-corpus questions hit a 90-second client timeout during an API slowdown at the end of the run and were
re-asked by hand afterwards: all three were refused by the router in under a second. Earlier the same
evening, the first full v3 run (67/69, 52/54, $2.46, cold caches) found the one real defect — a "no"
inferred from a regulation's silence on grading curves — which the prompt now rules out.

Before that (v2, 7 policies, 30 questions): 30/30 decisions, 22/22 cited the expected clause, 5.1 s
median, $0.57. The first v3 attempt stopped at 18 answers on the key's usage limit: 18/18 on the decision
and 15/18 on the expected clause, the three misses being two questions that two policies now both answer
(accepted since) and one router miss
(the discrimination-grievance deadline, read from the complaint-procedure policy instead of the student
grievance policy — the router summaries were sharpened).

Reproduce: `npm run build && npx next start -p 3000` with `ANTHROPIC_API_KEY` set, then `npm run eval`.
