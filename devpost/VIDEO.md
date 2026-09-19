# Demo video — plan, script, recording checklist

LexHack 2026 rules: **three minutes or less**, on YouTube, Vimeo or Loom. Target **2:45**; 3:00 is a
hard ceiling, and a video that runs over is the cheapest way to lose points you already earned.
Judging weights: real-world impact 25 %, technical quality 25 %, UX & accessibility 20 %,
originality 15 %, presentation 15 %.

Record on **https://mystanding.xyz** with the URL bar visible. It is the public address and the only one
that should ever be on screen.

## The one decision: one flow, end to end

**Grade appeal.** It is the only preset that touches every surface in a single take — situation card →
quick picks → verdict → timeline diagram (a grade appeal is a process) → deadlines with the date
calculator → cite chip into Academic Senate Regulation 502 → **Draft a request**. That last click is the
payoff: it is the thing a student actually needs.

Then **one refusal** — **"Can my landlord in La Jolla raise my rent in the middle of my lease?"**, which
the router turns away in ~1.4 s (eval q26) — real time, no cut. **Not** "How much is a parking ticket?":
v3 has a parking policy, and the eval shows that question now answered `n/a` in 19.8 s (q24), which kills
the beat. Protest chips and sliders get 4–5 s of b-roll at most. A second full answer costs 20 s of the 180
and adds nothing.

## Rubric map — what each beat is buying

| Beat | Time | Scores |
|---|---|---|
| The moment the rules matter, deadline already closed | 0:00–0:20 | impact |
| Quick picks, verdict-first answer, cite chip, timeline, date calculator | 0:20–1:20 | UX, impact |
| Draft a request | 1:20–1:35 | impact, originality |
| Refusal card with real offices; "silence is never a no" | 1:35–1:57 | originality, technical credibility |
| Architecture + eval numbers | 1:57–2:22 | technical |
| Keyboard, verdict-first hierarchy, reduced motion | 2:22–2:36 | accessibility |
| UC-wide, then any school + end card | 2:36–2:45 | impact, presentation |

For a room of lawyers, three things carry the most weight: **every claim traceable to a clause with its
effective date**, **an honest refusal**, and **"not legal advice" on screen**. All three are in the cut.

## Shot list and narration

~385 words. Read it aloud with a timer before recording; if it runs past 2:50, cut words, not shots.

**1 · Hook — 0:00–0:18.** Screen: home page already loaded, Pip waving. No title card, no face, no intro
music. The product is on screen from frame one.

> Every UCSD student hits a moment where the rules suddenly matter — a conduct notice, a grade that feels
> wrong. The answers exist, in hundreds of pages of official policy written for administrators. So most
> students ask a friend, or nobody, and find out about the ten-day window after it closed.

**2 · What it is — 0:18–0:30.** Slow scroll over the eight situation cards.

> This is Standing. Forty-two official UC San Diego policies — the Policy and Procedure Manual and the
> Academic Senate regulations, nineteen hundred clauses. Ask in plain words, or start from what happened.

**3 · Quick picks — 0:30–0:45.** Click "My professor graded me unfairly". Pick *Not about my work*, *Yes*
(talked to the instructor), drag the weeks slider to 3. Click ask.

> I'll take the grade appeal. Before answering, Pip asks two to four questions — chips and sliders, no
> typing — so the answer is about my situation, not the general case.

**4 · The wait — 0:45–0:50.** Hold 2–3 s on Pip reading, then jump cut. Burn in a small label with the
take's **real** elapsed time: `12 s — cut`. Never hide the latency; compress it and say the number.
Production answers have run 8–15 s warm (eval median 7.4 s, the verified production answer 15 s), so time
the take with a stopwatch and record the voiceover afterwards with the number that actually happened.

**5 · The answer — 0:50–1:00.** Verdict chip and the bold answer line, full width.

> \[N\] seconds later: a verdict first — yes, no, depends, or not covered — then one line that actually
> answers the question.

`[N]` is the take's measured time, not a number written in advance.

**6 · The citation — 1:00–1:12.** Click a cite chip. It scrolls to the clause, quoted, with the effective
date and the official link. Hover the link so the real UCSD URL shows in the status bar.

> Every claim carries the clause it came from: the policy's own words, its effective date, a link to the
> official page. Citations aren't typed by the model — they come back as character ranges into the
> document and get mapped to the clause.

**7 · Timeline and deadline — 1:12–1:20.** Scroll to the diagram, then the date calculator; pick a date
and let the computed deadline land.

> The process is drawn as a timeline, and "within two weeks" becomes a date.

The date picker only appears on a deadline that contains a duration, so aim at the first deadline **with a
date field**, not simply the first one.

Say the phrase the take actually rendered. Senate Regulation 502 sets the grade-appeal clock in
*two weeks* (§B.2), *ten days* (§C.2.b), *one month* (§D.2) and *one week* (§D.3.a) — the calculator
parses all of those. **"Ten business days" is the conduct and grievance window, not the grade appeal**;
don't carry it over from the written copy.

**8 · The draft — 1:20–1:35.** Click "Draft a request". This is a second model call (`/api/draft`), so
treat it like beat 4: hold ~2 s, jump cut, burn in the measured time. Then scroll the letter once.

> And the question every student actually has next — what do I send? — is one click. The appeal, built
> from the same clauses the answer cited.

**9 · The refusal — 1:35–1:57.** New question: "Can my landlord in La Jolla raise my rent in the middle
of my lease?" **Real time, no cut** — the speed is the point, and a rent question is one a legal audience
will immediately recognise as out of scope for campus policy. Then the refusal card, with the offices.

> Ask something the policies don't cover and Standing says so in about a second and a half, and names the
> people who can help — including free Student Legal Services, which handles exactly this. And when the
> policies cover the topic but are silent on your exact point, it says that too. Silence never becomes
> a no.

**10 · Under the hood — 1:57–2:22.** One still slide, four lines, then the eval numbers as a card. No
code on screen; code does not read at YouTube compression.

> A small model routes the question to one of six areas. Sonnet 5 reads every policy in that area with the
> API's citation feature on. Each area is prompt-cached, so an answer costs about two cents. Sixty-nine
> graded questions, every completed one decided right: fifty-three of fifty-four cited the exact expected
> clause, the router was right every time, seven-point-four-second median, a dollar fourteen for the run.

Slide text, verbatim — these must match `SUBMISSION.md` exactly, judges read both:
```
route to 1 of 6 areas (Haiku 4.5)  →  read every policy in that area (Sonnet 5, prompt-cached)
citations = character ranges → mapped back to clauses  →  no clause resolves = refuse

69 questions · every completed decision right · 53/54 expected clause · 54/54 router
7.4 s median · $1.14 per full run
```

**11 · Accessibility — 2:22–2:36.** Tab through the picks and open an expander with the keyboard, focus
ring visible.

> The whole thing works from the keyboard, the answer opens with the verdict and keeps the reasoning
> behind an expander, and every animation is off under reduced motion.

**12 · Close — 2:36–2:45.** End card: wordmark, `mystanding.xyz`, `Not legal advice.`

> Ten UC campuses next, then as many schools as I can reach. Every student should be able to type what
> happened and get the actual rule. Standing — know where you stand.

## Cuts, decided in advance

399 narration words is ~2:40 of speech before a single on-screen pause, and the real-time refusal, the
citation scroll and the date picker all need room. Realistic runtime is 2:50–2:58. If the rough cut runs
long, take these in order — decided now, not in the edit:

1. Beat 9's second sentence ("And when the policies cover the topic but are silent…") — 20 words for
   something not visible on screen.
2. Beat 10's "a dollar fourteen for the run" — the slide already carries it.
3. Beat 2's "the Policy and Procedure Manual and the Academic Senate regulations".

## What not to say

- No invented users or testimonials in the narration. Everything spoken is something the repo, the eval or
  the live site can back up.
- No "AI-powered", no "revolutionary", no model name-dropping beyond the one architecture line.
- Don't claim the quick picks change the answer unless beat 3 was verified against the real model first
  (see pre-flight).

## Pre-flight — do these before the 24th, not on the day

| # | Check | Cost | Why |
|---|---|---|---|
| 1 | One refusal on production (`Can my landlord in La Jolla raise my rent in the middle of my lease?`) | ~0.2 ¢ | The Sept 17 usage limit 502'd every answer; confirm the production key is alive well before the shoot |
| 2 | Run the grade-appeal preset **with picks** once against the real model | ~2–4 ¢ | Quick picks have never been run against the real model (PROGRESS). If it misbehaves, drop beat 3's claim rather than discover it mid-take |
| 3 | Rehearse the keyboard beat on `LLM_MOCK=1` | $0 | Tab order and focus rings are unverified by eye. If it's broken, cut beat 11 — don't fake it |
| 4 | Warm the grade area ~1 minute before each take | ~2 ¢ | A cold production function took 18 s; the area cache lives an hour |

Three takes of the main flow ≈ 10 ¢, against the $5 budgeted for demo takes.

## Recording

- CleanShot, fixed **1920 × 1080** window, browser zoom 110–125 % so the type survives YouTube.
- Clean profile: no bookmarks bar, no extensions, no other tabs, notifications off (Do Not Disturb).
- **Record the screen silent, then the voiceover over the cut.** Talking while clicking turns 3 takes
  into 12.
- Burn in captions — judges watch a lot of these, often at low volume.
- If a call stalls (the client times out at 40 s and retries once), stop the take, warm again, re-shoot.
  Shoot the main flow 3+ times and pick.

## Upload

- YouTube, **Unlisted or Public — never Private.** Open the link in an incognito window before pasting it
  anywhere. A private link is the most common way a hackathon video silently scores zero.
- Paste the link into `devpost/SUBMISSION.md` § 5 and the Devpost form.
- Deadline **Sept 27, 2:00 pm PDT** — an afternoon deadline, not midnight. Recording on the 24th leaves
  margin for one re-cut; don't let editing eat it.
