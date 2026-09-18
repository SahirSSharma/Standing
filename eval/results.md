# Eval results — 2026-09-17

Corpus: 638 chunks over 7 docs. K = 6.
Score = `normScore` (BM25 ÷ query-term count); coverage = share of the question's content terms matched anywhere in
the corpus. Gate 1 passes when score ≥ THRESHOLD (3.5) and coverage ≥ MIN_COVERAGE (0.5). hit@k = at least one
expected chunk in the top k. "expected rank" is the position of the first expected chunk in the full ranking (miss = not
matched at all).

| id | expect | question | top score | coverage | top chunk | expected rank | end-to-end |
|---|---|---|---|---|---|---|---|
| q01 | answer | How long does UCSD have to let me see my student records after I ask? | 10.988 | 0.86 | `160-2#5.A` | 1 | ok, cite yes |
| q02 | answer | Can UCSD charge me for copies of my own records? | 26.023 | 1.00 | `160-2#5.D` | 1 | ok, cite yes |
| q03 | answer | What information about me can UCSD hand out to anyone without asking me first? | 3.763 | 0.86 | `160-2#9.A.9` | 6 | ok, cite no |
| q04 | answer | Can I dispute a grade by asking the university to correct my student record? | 10.110 | 0.67 | `160-2#13.C.2.c` | 3 | ok, cite no |
| q05 | answer | If UCSD gets a subpoena for my records, do they have to tell me? | 7.621 | 0.50 | `160-2#9.A.7.a` | 3 | ok, cite no |
| q06 | answer | Where do I file a complaint if UCSD violates my FERPA rights? | 20.489 | 0.80 | `160-2#15.A.1` | 1 | ok, cite yes |
| q07 | answer | Am I required to check my UCSD email? | 5.955 | 1.00 | `160-2#INSTRUCTIONS` | miss | ok, cite no |
| q08 | answer | Can I have my @ucsd.edu email forwarded to my personal Gmail? | 12.185 | 0.80 | `160-3#IV.A` | 1 | ok, cite yes |
| q09 | answer | If a student dies, who at UCSD gets notified first? | 3.955 | 0.60 | `160-2#13.C.1` | 95 | ok, cite no |
| q10 | answer | When a student dies, does the campus-wide notice say how they died? | 7.208 | 0.57 | `160-6#PROCEDURES.I.D` | 1 | ok, cite yes |
| q11 | answer | Can a student who passed away still be awarded their degree? | 8.115 | 0.50 | `160-6#RESPONSIBILITIES.I.I` | 1 | ok, cite yes |
| q12 | answer | Which student governments does UCSD officially recognize? | 7.983 | 1.00 | `160-8#RELATED-INFORMATION` | 4 | ok, cite no |
| q13 | answer | Is the Seventh College student council an official student government? | 20.883 | 0.86 | `160-8#POLICY-STATEMENT.5` | 1 | ok, cite yes |
| q14 | answer | I got a student conduct notice. How many days do I have to set up a meeting with the conduct officer? | 15.842 | 0.73 | `160-10#POLICY-STATEMENT.E.2.a` | 1 | ok, cite yes |
| q15 | answer | Can I bring someone with me to my student conduct meeting? | 10.886 | 0.60 | `160-10#POLICY-STATEMENT.F.6` | 8 | ok, cite no |
| q16 | answer | Can UCSD discipline me for something that happened off campus? | 5.308 | 0.60 | `160-6#SCOPE` | 3 | ok, cite no |
| q17 | answer | How long does a conduct violation stay on my record? | 12.865 | 0.80 | `160-10#POLICY-STATEMENT.J.3` | 1 | ok, cite yes |
| q18 | answer | Who reviews my appeal if I'm an undergrad? | 7.615 | 1.00 | `160-10#POLICY-STATEMENT.I.2.a` | 1 | ok, cite yes |
| q19 | answer | Is wearing a mask on campus a conduct violation? | 21.836 | 1.00 | `160-10#POLICY-STATEMENT.C.6.c` | 1 | ok, cite yes |
| q20 | answer | Can I ask for a different conduct officer if I think mine is biased against me? | 7.004 | 0.50 | `160-10#POLICY-STATEMENT.F.19` | 11 | ok, cite no |
| q21 | answer | How long do I have to file a discrimination grievance against a staff member? | 6.161 | 1.00 | `160-2#TYPES-AND-LOCATIONS-OF-STUDENT-RECORDS-AND-THE-OFFICIALS-RESPONSIBLE-FOR-THEIR-MAINTENANCE.2` | 27 | ok, cite no |
| q22 | answer | Who looks into a grievance about my privacy rights being violated? | 14.138 | 0.80 | `160-2#15` | 2 | ok, cite no |
| q23 | refuse | How much does it cost to live in the dorms at UCSD this year? | 2.046 | 0.60 | `160-2#TYPES-AND-LOCATIONS-OF-STUDENT-RECORDS-AND-THE-OFFICIALS-RESPONSIBLE-FOR-THEIR-MAINTENANCE.3` | miss | ok |
| q24 | refuse | How do I appeal a parking ticket I got on campus? | 5.552 | 0.60 | `160-6#RESPONSIBILITIES.I.O` | miss | WRONG (answered) |
| q25 | refuse | When is the financial aid application deadline for next year? | 8.146 | 1.00 | `160-2#TYPES-AND-LOCATIONS-OF-STUDENT-RECORDS-AND-THE-OFFICIALS-RESPONSIBLE-FOR-THEIR-MAINTENANCE.4` | miss | WRONG (answered) |
| q26 | refuse | Can my landlord in La Jolla raise my rent in the middle of my lease? | 4.793 | 0.43 | `160-2#EXHIBIT-A` | miss | ok |
| q27 | refuse | What is the late homework policy in CSE 100? | 5.643 | 0.60 | `160-10#POLICY-SUMMARY` | miss | WRONG (answered) |
| q28 | refuse | How do I take a medical leave of absence for a quarter? | 10.134 | 1.00 | `160-10#PROCEDURES` | miss | WRONG (answered) |
| q29 | refuse | Will my F-1 visa be affected if I drop below 12 units? | 1.576 | 0.83 | `160-10#POLICY-STATEMENT.G.7.b` | miss | ok |
| q30 | refuse | Can I change my dining plan halfway through the quarter? | 3.726 | 0.67 | `160-10#REVISION-HISTORY.1` | miss | WRONG (answered) |

**Retrieval (22 answerable):** hit@1 11/22 (50%), hit@3 15/22 (68%), hit@6 17/22 (77%).
**Refusal calibration (8 refusable):** top scores 1.576–10.134; answerable top scores 3.763–26.023. overlap: max refusable 10.134 ≥ min answerable 3.763; no single threshold separates them.
Gate 1 (THRESHOLD 3.5, MIN_COVERAGE 0.5): 0 answerable would be refused (none), 5 refusable would pass to the LLM (q24, q25, q27, q28, q30).
**End-to-end:** refused-vs-answered correct 25/30 (83%); citation hits an expected chunk 11/22 (50%).

## Summary

Retrieval alone finds an expected clause at rank 1 for 11 of 22 answerable questions and within the top 6 for 17; the misses (q07@-, q09@95, q15@8, q20@11, q21@27; id@rank) are where the paraphrase gap is. The eight off-corpus questions top out at 10.134 against a minimum answerable score of 3.763, so the score alone is not cleanly separable on this set; with term coverage, gate 1 puts 5 questions on the wrong side. End-to-end, the server answered/refused correctly on 25/30 and cited an expected clause on 11/22 answerable questions (when the server runs in LLM_MOCK mode the citation is only the top chunk, so this tracks hit@1).
