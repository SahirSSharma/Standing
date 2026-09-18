# Devpost submission — Standing

Everything the LexHack 2026 Devpost form asks for, in form order, ready to paste. Limits checked with
`wc -m`. The rules (lexhack-2026.devpost.com/rules) require: a public repo **or** a deployed link, a
demo video of **at most three minutes** on YouTube, Vimeo or Loom, and **every API, framework and
third-party tool listed** (the "Tech stack & credits" section below). Judging: real-world impact 25 %,
technical quality 25 %, user experience and accessibility 20 %, originality 15 %, presentation 15 %.

---

## 1. Project name (≤ 60 characters)

```
Standing
```

Alternative, if the tagline should show in listings (32 characters):

```
Standing — Know where you stand.
```

## 2. Elevator pitch (≤ 200 characters)

```
Know where you stand. Ask about your rights as a UCSD student and get a plain answer, the steps and deadlines, and the exact policy clause it came from — or an honest “that isn’t covered.”
```

## 3. Thumbnail

`devpost/thumbnail.png` — 1200 × 800 (3:2), Pip and the wordmark on the paper background.

## 4. Image gallery (3:2, up to 15)

All frames are 3:2 viewport captures in Chrome (1800 × 1200; the two short ones 1350 × 900); nothing was spent on them. The answer frames
replay a real Sonnet 5 answer recorded earlier (the grade-appeal preset asked through the Vercel
preview), so the text shown is exactly what the model said to exactly the question in the box.
Upload in this order; Devpost shows the first as the header image when there is no video.

| File | Caption (optional on Devpost) |
|---|---|
| `gallery/01-home.png` | Ask anything, or start from something that happened. |
| `gallery/02-quick-picks.png` | Pick a situation and Pip asks two to four quick questions — chips, yes/no, sliders. No typing. |
| `gallery/03-loading.png` | Pip reads the policies in that area clause by clause. |
| `gallery/04-answer.png` | A verdict, one bold line, and every claim pinned to the clause it came from. |
| `gallery/05-steps.png` | The process as a timeline, and the deadlines with a date calculator. |
| `gallery/06-deadlines-sources.png` | Deadlines with a date calculator, and the 14 cited clauses quoted with their effective date and official link. |
| `gallery/07-library.png` | The 42 policies Standing reads, by area. |
| `gallery/08-policy.png` | Every policy is browsable clause by clause. |
| `gallery/09-refusal.png` | When the policies don't cover it, Standing says so and names the offices that can help. |

## 5. Video demo link

Not recorded yet — planned for Sept 24 (restart `next start` first, see PROGRESS.md). At most three
minutes; YouTube, Vimeo or Loom per the rules. Devpost can be edited until the deadline, so submit
without it and add the link when it exists.

## 6. About the project (Markdown)

Paste everything between the two markers.

<!-- paste from here -->

## Inspiration

Every UCSD student eventually hits a moment where the rules suddenly matter: a conduct notice in the inbox, a grade that feels unfair, a parent asking for a transcript, a protest you want to hold, a parking citation. The answers exist. They are in the campus Policy & Procedure Manual and the Academic Senate regulations — hundreds of pages written for administrators, split across dozens of documents, each with its own deadlines. Most students never read them. They ask a friend, a subreddit, or nobody, and find out about the ten-business-day window after it closes.

Standing is the tool I wanted at those moments: ask in plain words and get an answer that comes with the clause, not a vibe.

## What it does

- **Reads 42 official UC San Diego policies** — 34 Policy & Procedure Manual documents and 8 Academic Senate regulations, 1,902 clauses, every one carrying its effective date and a link to the source.
- **Answers with a verdict first.** Yes, no, depends, or not covered, then one bold line, then the answer as a picture: a numbered timeline when the policy is a process, "they can / you can" columns when it is a set of rights, and the deadlines with a date calculator that turns "within ten business days" into a date.
- **Cites the clause, not the document.** Every claim carries a chip that scrolls to the exact clause it came from, quoted, with its effective date and the official link. The explanation and the sources sit behind expanders so the page opens with the answer, not a wall of text.
- **Says when it can't answer.** If no policy covers the question, Standing refuses and names the campus offices that can help — the Ombuds, Student Legal Services, SAGE, and OPHD. If the policies cover the topic but are silent on the exact point, it says that too, instead of turning silence into a "no".
- **Adapts to your situation.** Pick "I want to hold a protest" and Pip, the sea lion, asks two to four quick questions first — where, how many people, amplified sound, who is organizing — as chips, yes/no buttons and sliders. The answer is written for that situation. Change a pick, press "Update answer", and get a new one; a combination already asked comes back instantly.
- **Drafts the request.** One click writes the records request, grade appeal or grievance you can send, from the same clauses the answer cited.
- **Lets you browse.** A policy library shows every document by area and every clause under the manual's own headings.
- **Is not legal advice**, and says so on every page. It quotes official policy so you know where you stand before you talk to a person.

## How I built it

**Stack.** Next.js 16 (App Router, JavaScript) and Tailwind CSS 4, deployed on Vercel. No database, no embeddings, no search index: the whole corpus is one committed JSON file loaded when the route starts.

**Ingest.** A catalog lists the 42 policies. A script fetches each one from ucsd.edu — the PPM's document endpoint and the Senate manual's pages — and parses it into clause chunks with labels ("5.A", "3.1.1"), headings, effective dates and URLs. Two PPM documents are unservable on UCSD's own server (it reports two published documents with the same id), so the ingest falls back to the Internet Archive's newest capture and links citations there.

**Two models, one read.** A small model (Claude Haiku 4.5) sees the 42 policy names with a one-line summary each and picks one of six life areas — records, academics, conduct, speech and events, safety and discrimination, money and campus life — for about 0.2 ¢. Claude Sonnet 5 then reads every policy in that area (5–9 documents, 45–65k tokens) as document blocks with the Messages API's citation feature on, so every cited passage comes back as a character range into a policy rather than as text the model typed. The server maps each range to the clause or clauses it covers and turns them into citations. Each area is prompt-cached for an hour, so a warm answer costs about 2 ¢.

**A fixed answer shape.** The model writes a verdict line, one bold sentence, then "Why", "They can", "You can", "Steps" and "Deadlines". The server parses those sections so the page can open with the verdict and draw the timeline or the columns from the steps and rights, and put the prose behind an expander.

**Refusals are structural.** The server refuses when the router says no area covers the question (no read at all), when the model answers NO_ANSWER for the routed area and again for the runner-up area, or when none of its citations resolve to a clause in the corpus. A refusal is an explicit card, never a blank answer.

**Quick picks are data.** Each situation lists its picks as plain data — kind, options, and a first-person phrase per value — and one function composes the preset question plus a "My situation: …" sentence. The server and the prompt are unchanged; an offline check makes sure every one of the 204 pick combinations composes to a question the route accepts.

**Evaluation.** 69 student-phrased questions: 54 answerable across the six areas, each with the clause ids that contain the answer and a verbatim quote that must appear in one of them, and 15 the policies cannot answer, worded to share vocabulary with them (dining prices, grading curves, housing contracts). The runner POSTs them to the running server and scores the answer-or-refuse decision, the cited clauses, the router's area and the cost.

## Challenges I ran into

- **Retrieval was the wrong architecture.** Version 1 ran BM25 over the clauses and showed the model the top six. On the first live question — "Can UCSD share my grades with my parents?" — the answering clause ranked outside the top six and the app refused. Version 2 dropped retrieval and let the model read all seven policies. Version 3 grew to 42 policies (about 305k tokens), which would cost 6 ¢ a question warm and over a dollar per cold cache write, so the model now reads one area at a time. Picking one of six areas from policy names is easy where finding one clause in 1,900 was not.
- **Silence is not a "no".** The full eval caught a "Verdict: no" on grading curves from a regulation that never mentions curves. The prompt now distinguishes a topic the policies do not cover (refuse) from a point they are silent on (verdict n/a, with a line saying what they do not cover).
- **Citations that straddle clauses.** The model often cites a lead-in sentence together with its sub-clause; the first real eval run lost four questions to the server crediting the parent clause. A cited range now maps to every clause it covers by at least half.
- **Two policies UCSD's own site cannot serve**, and a Senate manual whose pages nest clauses three deep with amendment stamps for dates. Both needed their own parser.
- **$20 of API credit for the whole project.** The UI was built and verified against a mock mode that answers with the best-matching clauses; the eval runs once per prompt change; every call logs its cost. I still hit the Console's monthly spend limit in the middle of the first full eval and had to raise it.
- **A hung connection that looked like an API outage.** Three calls in a row stalled for 90–170 seconds while a fresh process reached the same model in 0.6 s. The client now times out at 40 s with one retry on a fresh connection.

## Accomplishments that I'm proud of

- On the latest full eval run: 54/54 answerable questions answered, 53/54 citing the expected clause and 54/54 citing the right policy, the router right 54/54 times, every completed off-corpus question refused or answered "not covered", 7.4 s median, $1.14 for the whole run.
- A warm answer costs about 2 ¢, so the tool can actually be left running for students.
- The refusal path is a first-class part of the product, with real offices and real links, not an error state.
- Pip: a single hand-written SVG, posed by prop and animated in CSS, that waves, reads while the answer loads, points at the answer and speaks it, cheers on a yes, and sits sorry on a refusal — off under prefers-reduced-motion.

## What I learned

- Reading whole policies beats retrieving snippets when the corpus is a few hundred thousand tokens and prompt caching makes the read cheap. The hard problem moved from "find the clause" to "pick the area", which is a much easier problem.
- Every real defect was found by the eval, not by reading answers by eye. A question set with the expected clause ids was the most valuable thing I built.
- An honest "not covered" earns more trust than a confident guess — and it has to be designed, with somewhere for the student to go next.

## What's next for Standing

- Run the quick-pick questions against the real model and grade them; today the eval grades the presets, and the composed questions are checked only for shape.
- Have students try it and build a second question set nobody tuned against.
- More of what students actually ask about — housing contracts, financial aid rules — and a second campus, since the corpus is a catalog file and everything downstream is generic.

## Tech stack & credits

- **Next.js 16.3** (App Router, JavaScript), **React 19.2**, **Tailwind CSS 4** with `@tailwindcss/postcss`; **Node.js 24**.
- **Claude Sonnet 5** for answers and request drafts, and **Claude Haiku 4.5** as the area router, through the Anthropic Messages API and the `@anthropic-ai/sdk` package (citations, prompt caching, adaptive thinking).
- **Vercel** for hosting and functions.
- **Geist** and **Geist Mono** typefaces (Vercel) via `next/font/google`.
- **ESLint 9** with `eslint-config-next`.
- **Playwright** with Chrome for UI verification and screenshots during development (not a dependency of the app).
- **Data:** the UC San Diego Policy & Procedure Manual (adminrecords.ucsd.edu) and the UCSD Academic Senate Manual (senate.ucsd.edu), fetched and parsed by the project's own ingest script; the Internet Archive's Wayback Machine for the two PPM documents UCSD's server cannot serve. Office links go to the public pages of the Office of the Ombuds, Student Legal Services, SAGE and OPHD.
- Pip and all icons are hand-written inline SVG; animations are CSS.
- Not affiliated with or endorsed by UC San Diego. Not legal advice.

<!-- paste to here -->

Optional last line for the credits — the rules allow AI coding tools and do not require disclosure;
add it if you want it on the record, delete this note either way:

```
- Written with Claude Code as a pair programmer; every design decision, prompt and line of code is mine to explain.
```

## 7. Built with (tags, up to 25)

```
next.js, react, javascript, tailwind-css, node.js, vercel, anthropic, claude, claude-sonnet-5, claude-haiku-4.5, prompt-caching, svg, css, eslint, playwright, github
```

## 8. "Try it out" links

```
https://github.com/SahirSSharma/Standing
```

Live link: none yet. The staging deployment is protected by Vercel's deployment login, so a judge
cannot open it. A production deployment needs the API key added to the Production environment first
and is waiting on Sahir's go (steps in PROGRESS.md). Add the URL here once it exists, and the .xyz
domain once it points there.

## Before submitting

- [ ] Project name and pitch pasted (limits: 60 / 200, checked with `wc -m`).
- [ ] Thumbnail uploaded.
- [ ] Nine gallery images uploaded in order.
- [ ] Video link added (≤ 3 min).
- [ ] About pasted from the markers; decide on the optional disclosure line.
- [ ] Built-with tags added.
- [ ] GitHub link, then the live link when production exists.
- [ ] Track: Access to Justice & Civic Tech.
