# Eval results — 2026-09-17

Corpus: 602 chunks over 6 docs (PPM 160-9 is unservable upstream, see DESIGN.md). K = 6.
Score = `normScore` (BM25 ÷ query-term count), the quantity THRESHOLD (3.5) gates. hit@k = at least one
expected chunk in the top k. "expected rank" is the position of the first expected chunk in the full ranking (miss = not
matched at all).

| id | expect | question | top score | top chunk | expected rank | end-to-end |
|---|---|---|---|---|---|---|
| q01 | answer | How long does UCSD have to let me see my student records after I ask? | 10.825 | `160-2#5.A` | 1 | ok, cite yes |
| q02 | answer | Can UCSD charge me for copies of my own records? | 25.560 | `160-2#5.D` | 1 | ok, cite yes |
| q03 | answer | What information about me can UCSD hand out to anyone without asking me first? | 3.680 | `160-2#9.A.9` | 6 | ok, cite no |
| q04 | answer | Can I dispute a grade by asking the university to correct my student record? | 9.956 | `160-2#13.C.2.c` | 3 | ok, cite no |
| q05 | answer | If UCSD gets a subpoena for my records, do they have to tell me? | 7.446 | `160-2#9.A.7.a` | 3 | ok, cite no |
| q06 | answer | Where do I file a complaint if UCSD violates my FERPA rights? | 20.228 | `160-2#15.A.1` | 1 | ok, cite yes |
| q07 | answer | Am I required to check my UCSD email? | 5.976 | `160-2#INSTRUCTIONS` | miss | ok, cite no |
| q08 | answer | Can I have my @ucsd.edu email forwarded to my personal Gmail? | 12.237 | `160-3#IV.A` | 1 | ok, cite yes |
| q09 | answer | If a student dies, who at UCSD gets notified first? | 3.913 | `160-2#13.C.1` | 94 | ok, cite no |
| q10 | answer | When a student dies, does the campus-wide notice say how they died? | 7.187 | `160-6#PROCEDURES.I.D` | 1 | ok, cite yes |
| q11 | answer | Can a student who passed away still be awarded their degree? | 8.022 | `160-6#RESPONSIBILITIES.I.I` | 1 | ok, cite yes |
| q12 | answer | Which student governments does UCSD officially recognize? | 8.117 | `160-8#RELATED-INFORMATION` | 3 | ok, cite no |
| q13 | answer | Is the Seventh College student council an official student government? | 20.831 | `160-8#POLICY-STATEMENT.5` | 1 | ok, cite yes |
| q14 | answer | I got a student conduct notice. How many days do I have to set up a meeting with the conduct officer? | 15.530 | `160-10#POLICY-STATEMENT.E.2.a` | 1 | ok, cite yes |
| q15 | answer | Can I bring someone with me to my student conduct meeting? | 10.670 | `160-10#POLICY-STATEMENT.F.6` | 8 | ok, cite no |
| q16 | answer | Can UCSD discipline me for something that happened off campus? | 5.296 | `160-6#SCOPE` | 3 | ok, cite no |
| q17 | answer | How long does a conduct violation stay on my record? | 12.543 | `160-10#POLICY-STATEMENT.J.3` | 1 | ok, cite yes |
| q18 | answer | Who reviews my appeal if I'm an undergrad? | 7.525 | `160-10#POLICY-STATEMENT.I.2.a` | 1 | ok, cite yes |
| q19 | answer | Is wearing a mask on campus a conduct violation? | 21.444 | `160-10#POLICY-STATEMENT.C.6.c` | 1 | ok, cite yes |
| q20 | answer | Can I ask for a different conduct officer if I think mine is biased against me? | 6.860 | `160-10#POLICY-STATEMENT.F.19` | 11 | ok, cite no |
| q21 | answer | How long do I have to file a discrimination grievance against a staff member? | 6.282 | `160-2#TYPES-AND-LOCATIONS-OF-STUDENT-RECORDS-AND-THE-OFFICIALS-RESPONSIBLE-FOR-THEIR-MAINTENANCE.2` | 24 | ok, cite no |
| q22 | answer | Who looks into a grievance about my privacy rights being violated? | 13.921 | `160-2#15` | 2 | ok, cite no |
| q23 | refuse | How much does it cost to live in the dorms at UCSD this year? | 2.014 | `160-2#TYPES-AND-LOCATIONS-OF-STUDENT-RECORDS-AND-THE-OFFICIALS-RESPONSIBLE-FOR-THEIR-MAINTENANCE.3` | miss | ok |
| q24 | refuse | How do I appeal a parking ticket I got on campus? | 5.486 | `160-6#RESPONSIBILITIES.I.O` | miss | WRONG (answered) |
| q25 | refuse | When is the financial aid application deadline for next year? | 8.119 | `160-2#TYPES-AND-LOCATIONS-OF-STUDENT-RECORDS-AND-THE-OFFICIALS-RESPONSIBLE-FOR-THEIR-MAINTENANCE.4` | miss | WRONG (answered) |
| q26 | refuse | Can my landlord in La Jolla raise my rent in the middle of my lease? | 4.726 | `160-2#EXHIBIT-A` | miss | WRONG (answered) |
| q27 | refuse | What is the late homework policy in CSE 100? | 6.030 | `160-10#POLICY-SUMMARY` | miss | WRONG (answered) |
| q28 | refuse | How do I take a medical leave of absence for a quarter? | 9.965 | `160-10#PROCEDURES` | miss | WRONG (answered) |
| q29 | refuse | Will my F-1 visa be affected if I drop below 12 units? | 1.556 | `160-10#POLICY-STATEMENT.G.7.b` | miss | ok |
| q30 | refuse | Can I change my dining plan halfway through the quarter? | 3.744 | `160-10#REVISION-HISTORY.1` | miss | WRONG (answered) |

**Retrieval (22 answerable):** hit@1 11/22 (50%), hit@3 16/22 (73%), hit@6 17/22 (77%).
**Refusal calibration (8 refusable):** top scores 1.556–9.965; answerable top scores 3.680–25.560. overlap: max refusable 9.965 ≥ min answerable 3.680; no single threshold separates them.
At THRESHOLD 3.5: 0 answerable would be refused (none), 6 refusable would pass to the LLM (q24, q25, q26, q27, q28, q30).
**End-to-end:** refused-vs-answered correct 24/30 (80%); citation hits an expected chunk 11/22 (50%).

## Summary

Retrieval alone finds an expected clause at rank 1 for 11 of 22 answerable questions and within the top 6 for 17; the misses (q07@-, q09@94, q15@8, q20@11, q21@24; id@rank) are where the paraphrase gap is. The eight off-corpus questions top out at 9.965 against a minimum answerable score of 3.680, so the gate is not cleanly separable on this set (6 questions on the wrong side of 3.5). End-to-end, the server answered/refused correctly on 24/30 and cited an expected clause on 11/22 answerable questions (when the server runs in LLM_MOCK mode the citation is only the top chunk, so this tracks hit@1).
