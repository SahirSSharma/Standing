# Run sheet for the recording agent (CleanShot X)

Machine-followable version of `VIDEO.md`. Every string in **bold quotes** is literal on-screen text —
click or wait for that exact text, don't pattern-match loosely. Timecodes are positions in the **final
cut**, not stopwatch time during recording.

**Shooting order is not assembly order: A → B → C → D → E → G → F.** SEG-F replaces the answer with the
refusal card, so the keyboard clip (G), which needs a live answer page, must be shot before it.

Record **nine separate clips**, not one continuous take. Each clip is trimmed at its own boundaries, so
model latency between clips costs nothing in the edit and no frame-accurate cutting is needed.

---

## 0 · Preconditions — verify before the first clip

| # | Check | How |
|---|---|---|
| 1 | Browser window exactly **1920 × 1080**, Chrome, zoom **110 %** | `⌘0` then `⌘+` once |
| 2 | Clean profile: no bookmarks bar (`⌘⇧B`), no extensions visible, one tab | visual |
| 3 | macOS **Do Not Disturb** on; menu-bar clock and notifications won't appear in the crop | Control Centre |
| 4 | URL bar reads **`mystanding.xyz`** and nothing else, ever | visual |
| 5 | Desktop icons hidden | CleanShot → Hide Desktop Icons |
| 6 | Page loads and Pip waves | open `https://mystanding.xyz` |

**Hard rule:** the URL bar reads `mystanding.xyz` and nothing else. If any other address appears, discard
the clip and reload from `mystanding.xyz`.

## 1 · CleanShot settings

- **Record Screen**, region locked to the browser window. Trigger with `open "cleanshot://record-screen"`;
  if the URL scheme is disabled, enable it in CleanShot Settings → Advanced, or use the menu-bar item.
  Stop with the **Stop** button in the menu bar.
- Capture at **60 fps**, no webcam, **no microphone, no computer audio** — voiceover is laid over the cut
  afterwards.
- Turn **on** "Show clicks" / click highlighting so the judge can follow the cursor.
- Do a **10-second dry run first**: record, stop, confirm the file lands and the crop is right. Everything
  after this depends on that crop being correct.
- Save clips to `~/Desktop/Standing Video/` as `SEG-A.mp4` … `SEG-G.mp4`.

## 2 · Warm-up — mandatory, ≤ 60 s before SEG-B

A cold production function has taken 18 s; the prompt cache for an area lives about an hour.

1. Ask **"My professor graded me unfairly. Can I appeal my grade and how?"** on the live site. Wait for the
   answer. **Do not record this.**
2. Reload to a clean home page.
3. Start SEG-B within a minute.

Repeat the warm-up if more than ~30 minutes pass between clips.

---

## 3 · The clips

Every clip: start the recording, **hold 1 s before the first action** and **1 s after the last** so there
is trim margin. Move the cursor deliberately — slow, straight, no hunting.

### SEG-A · Home → situation cards **(final cut 0:00–0:30)**

| t | Action | Wait for |
|---|---|---|
| +0.0 s | Page already loaded at the top, cursor parked bottom-right | **"Know where you stand."** visible, Pip mid-wave |
| +2.0 s | Hold still — let Pip's wave finish | — |
| +4.0 s | Scroll down slowly (~250 px/s) to the situation cards | **"I want to appeal a grade"** visible |
| +9.0 s | Hold on the eight cards, cursor drifting across them | — |
| +12.0 s | Stop | — |

> **Narration over it:** Every UCSD student hits a moment where the rules suddenly matter — a conduct
> notice, a grade that feels wrong. The answers exist, in hundreds of pages of official policy written for
> administrators. So most students ask a friend, or nobody, and find out about the ten-day window after it
> closed.
>
> This is Standing. Forty-two official UC San Diego policies — the Policy and Procedure Manual and the
> Academic Senate regulations, nineteen hundred clauses. Ask in plain words, or start from what happened.

### SEG-B · Quick picks → the answer lands **(final cut 0:30–0:58)**

This clip contains the real wait. **Log two wall-clock timestamps**: the moment **"Get my answer"** is
clicked and the moment the verdict renders. Their difference is `[N]`, the number the voiceover says. Do
not guess it in advance — production answers have run 8–15 s.

| t | Action | Wait for |
|---|---|---|
| +0.0 s | Click **"I want to appeal a grade"** | panel headed **"Tell Pip a bit more"** |
| +2.0 s | Click chip **"Not about my work"** (under **"What do you think went wrong?"**) | chip shows selected |
| +4.0 s | Click **"Yes"** under **"Talked to the instructor yet?"** — it is the right-hand chip; **"No"** comes first | toggle shows selected |
| +6.0 s | Drag the **"Weeks since the grade was posted"** slider from 1 to **3** — drag it, don't arrow it, the motion reads on camera | label reads **"3 weeks"** |
| +9.0 s | **Log timestamp T1.** Click **"Get my answer"** | — |
| +9.5 s | Do not move the cursor. Pip switches to reading | Pip's reading pose |
| — | Wait however long it takes | the verdict chip and the bold answer line render |
| — | **Log timestamp T2.** Hold 3 s on the answer | — |
| — | Stop | — |

`[N] = round(T2 − T1)`. Write it into the voiceover script and burn it into the cut as a small label
`[N] s — cut` at the jump.

> **Narration:** I'll take the grade appeal. Before answering, Pip asks two to four questions — chips and
> sliders, no typing — so the answer is about my situation, not the general case.
>
> \[N\] seconds later: a verdict first — yes, no, depends, or not covered — then one line that actually
> answers the question.

**Abort rule:** if nothing renders within 45 s, the call stalled (the client times out at 40 s and retries
once). Stop the recording, reload, warm up again, re-shoot the whole clip.

### SEG-C · The citation **(final cut 0:58–1:12)**

| t | Action | Wait for |
|---|---|---|
| +0.0 s | From the answer top, hover the first inline cite chip — pause 1 s so the highlight reads | chip highlighted |
| +1.5 s | Click it | the page scrolls to the source card |
| +3.0 s | Hold on the quoted clause: the policy's words, the **effective date**, the official link | — |
| +5.0 s | Hover the official link — hold 2 s so the real `ucsd.edu` URL shows in the status bar | URL visible bottom-left |
| +8.0 s | Stop | — |

> **Narration:** Every claim carries the clause it came from: the policy's own words, its effective date, a
> link to the official page. Citations aren't typed by the model — they come back as character ranges into
> the document and get mapped to the clause.

### SEG-D · Timeline and deadline **(final cut 1:12–1:20)**

| t | Action | Wait for |
|---|---|---|
| +0.0 s | Scroll up to the diagram — the numbered timeline | diagram fully in frame |
| +2.0 s | Scroll down to the **"Deadlines"** section | **"Deadlines"** heading visible |
| +3.5 s | Click the date field next to the first deadline **that has one** — the picker only renders on a deadline containing a duration ("two weeks", "ten days") — and pick **today's date** | the computed date appears |
| +6.0 s | Hold 2 s on the computed date | — |
| +8.0 s | Stop | — |

**Read what's on screen.** Senate Regulation 502 sets the grade-appeal clock in *two weeks*, *ten days*,
*one month*, *one week*. "Ten business days" is the conduct/grievance window — if it isn't on screen,
don't say it.

> **Narration:** The process is drawn as a timeline, and "within two weeks" becomes a date.

### SEG-E · Draft a request **(final cut 1:20–1:35)**

A second model call. Same treatment as SEG-B: **log T1 at the click, T2 when the letter renders.**

| t | Action | Wait for |
|---|---|---|
| +0.0 s | Scroll to the actions row, hover **"Draft a request"** 1 s | button visible |
| +1.5 s | **Log T1.** Click **"Draft a request"** | — |
| — | Wait | the letter renders below the button |
| — | **Log T2.** Hold 1 s, then scroll the letter slowly, top to bottom | — |
| — | Hover **"Copy request"** — do not click | — |
| — | Stop | — |

> **Narration:** And the question every student actually has next — what do I send? — is one click. The
> appeal, built from the same clauses the answer cited.

### SEG-F · The refusal **(final cut 1:35–1:57) — real time, no cut** · shoot LAST

The speed is the point: the router turns this away with no policy read at all — 1.4 s in the eval (q26) —
so this clip runs uncut.

**Do not use "How much is a parking ticket?"** V3 added a parking policy; the eval records that question
answered `n/a` in 19.8 s (q24), not refused. The rent question is a router-null refusal and lands better
for a legal audience: the card points at free Student Legal Services, who actually handle landlord-tenant.

| t | Action | Wait for |
|---|---|---|
| +0.0 s | Scroll to the question field, click it, select all, delete | field empty |
| +1.5 s | Type **"Can my landlord in La Jolla raise my rent in the middle of my lease?"** at a human pace (~8 chars/s) | text in field |
| +5.0 s | Click **"Ask"** | — |
| — | **Do not cut.** Let the wait play | card headed **"That one isn’t in the 42 policies Pip has read"** (curly apostrophe) |
| — | Hold 2 s on the card, then hover each of the four offices in turn — **Office of the Ombuds**, **Student Legal Services**, **SAGE**, **OPHD** — ~1 s each | — |
| — | Stop | — |

> **Narration:** Ask something the policies don't cover and Standing says so in about a second and a half,
> and names the people who can help — including free Student Legal Services, which handles exactly this.
> And when the policies cover the topic but are silent on your exact point, it says that too. Silence
> never becomes a no.

### SEG-G · Keyboard **(final cut 2:22–2:36)** · shoot BEFORE SEG-F

Shoot this **only if the dry run on `LLM_MOCK=1` showed a clean tab order and a visible focus ring.** If it
didn't, skip the clip and cut the narration line — do not fake it.

| t | Action | Wait for |
|---|---|---|
| +0.0 s | Back on an answer page. Cursor parked off to one side, untouched for the whole clip | — |
| +1.0 s | `Tab` slowly through the quick-pick controls, ~0.7 s apart, 5–6 stops | focus ring moves visibly |
| +6.0 s | `Tab` to **"Why this answer"**, press `Return` | expander opens |
| +9.0 s | `Tab` to **"Sources"**, press `Return` | expander opens |
| +12.0 s | Stop | — |

> **Narration:** The whole thing works from the keyboard, the answer opens with the verdict and keeps the
> reasoning behind an expander, and every animation is off under reduced motion.

### STILL-H · Architecture slide **(final cut 1:57–2:22)** — a static frame

Build it as a small HTML file in `devpost/` and screenshot it at 1920 × 1080 with the same CleanShot crop,
so it matches the footage.

Paper background `#FAF7F2`, ink `#14213D`, gold rule `#E9B949`. Verbatim, two blocks:

```
route to 1 of 6 areas (Haiku 4.5)  →  read every policy in that area (Sonnet 5, prompt-cached)
citations = character ranges → mapped back to clauses  →  no clause resolves = refuse
```
```
69 questions · every completed decision right · 53/54 expected clause · 54/54 router
7.4 s median · $1.14 per full run
```

> **Narration:** A small model routes the question to one of six areas. Sonnet 5 reads every policy in that
> area with the API's citation feature on. Each area is prompt-cached, so an answer costs about two cents.
> Sixty-nine graded questions, every completed one decided right: fifty-three of fifty-four cited the exact
> expected clause, the router was right every time, seven-point-four-second median, a dollar fourteen for
> the run.

### STILL-I · End card **(final cut 2:36–2:45)** — a static frame, built and shot the same way

Pip, the wordmark, then two lines: **mystanding.xyz** and **Not legal advice.**

> **Narration:** Ten UC campuses next, then as many schools as I can reach. Every student should be able to
> type what happened and get the actual rule. Standing — know where you stand.

---

## 4 · Final cut — assembly order

| In | Out | Source | Note |
|---|---|---|---|
| 0:00 | 0:30 | SEG-A | opens on the product, no title card |
| 0:30 | 0:45 | SEG-B (picks) | |
| 0:45 | 0:50 | SEG-B (reading) | hold 2–3 s of Pip reading, then jump cut; burn in `[N] s — cut` |
| 0:50 | 0:58 | SEG-B (answer) | |
| 0:58 | 1:12 | SEG-C | |
| 1:12 | 1:20 | SEG-D | |
| 1:20 | 1:24 | SEG-E (click + 2 s wait) | jump cut, burn in the measured draft time |
| 1:24 | 1:35 | SEG-E (letter) | |
| 1:35 | 1:57 | SEG-F | uncut |
| 1:57 | 2:22 | STILL-H | |
| 2:22 | 2:36 | SEG-G | omit if not shot; pull everything after up by 14 s |
| 2:36 | 2:45 | STILL-I | |

Target **2:45**, ceiling **3:00**. If the rough cut runs long, take the cuts in the order listed in
`VIDEO.md` § "Cuts, decided in advance".

## 5 · Stop rules for the agent

1. **Never** let an address other than `mystanding.xyz`, a notification, or a second browser tab into a
   frame. Any of them: discard and re-shoot.
2. If a call stalls past 45 s, stop, reload, warm up, re-shoot that clip.
3. Shoot SEG-B and SEG-F **three times each** and keep all takes; they carry the two real waits.
   **Reload the page between SEG-B takes.** The answer cache is a client-side `Map` in `Ask.js`: without a
   reload, take 2 of the same pick combination returns instantly, with no reading pose and `[N]` ≈ 0.
4. Never type into the site anything except the two strings in this sheet.
5. Report back, per clip: filename, duration, and for SEG-B and SEG-E the measured `T2 − T1` in seconds.
   The voiceover cannot be recorded until those two numbers exist.
