# Eval results — 2026-09-18

Server: http://localhost:3000/api/ask. 69 questions (54 answerable, 15 off-corpus), 1 at a time, sorted by area with refusers last.
area = where the expected clauses live; routed = grounding.area the answer was read from, "(via runner-up)" when the first area
answered NO_ANSWER and the runner-up was read (grounding.retried). cited-expected = a returned citation id is in expectedChunks (a question
with mustCite additionally requires those ids); cited-doc = a citation points into the expected policy (partial credit). "top cited ids"
are the first three citations returned. cache = grounding.cacheRead. got = "answer (n/a)" when the server answered with
Verdict: n/a (the policies cover the topic but not the point asked); for an off-corpus question that counts as correct.

| id | area | expect | got | routed | cited-expected | cited-doc | top cited ids | ms | cache |
|---|---|---|---|---|---|---|---|---|---|
| q01 | records | answer | answer | records | yes | yes | `160-2#5.A`, `160-2#5.B`, `160-2#5.C` | 8244 | yes |
| q02 | records | answer | answer | records | yes | yes | `160-2#5.D`, `480-3#ACCESS-TO-PERSONAL-INFORMATION-BY-SUBJECT-INDIVIDUAL.4`, `160-2#5.G.4` | 10476 | yes |
| q03 | records | answer | answer | records | yes | yes | `160-2#3.D`, `160-2#8.A`, `160-2#8.A.1` | 10718 | yes |
| q04 | records | answer | answer | records | yes | yes | `160-2#3.J.2`, `160-2#4.B`, `160-2#9.A.3` | 11775 | yes |
| q05 | records | answer | answer | records | yes | yes | `160-2#9.A.7.a`, `135-5#III.E`, `160-2#9.A.7` | 10955 | yes |
| q06 | records | answer | answer (n/a) | records | yes | yes | `160-2#15.A`, `160-2#15.A.2`, `160-2#15.A.3` | 6945 | yes |
| q07 | records | answer | answer | records | yes | yes | `160-3#I`, `160-3#III`, `160-3#II` | 8911 | yes |
| q08 | records | answer | answer | records | yes | yes | `160-3#IV.A`, `160-3#II`, `160-3#V.2` | 7388 | yes |
| q50 | records | answer | answer | records | yes | yes | `135-5#III.A.1`, `135-5#III.A.2`, `135-5#II` | 15662 | yes |
| q51 | records | answer | answer | records | yes | yes | `135-9#POLICY-STATEMENT.2.d`, `135-9#APPENDIX-A-DISALLOWED-ACTIVITIES.2`, `135-9#APPENDIX-A-DISALLOWED-ACTIVITIES.5` | 7948 | yes |
| q64 | records | answer | answer | records | no | yes | `160-2#3.J.2`, `160-2#9.A.1`, `160-2#9.A.3` | 10081 | yes |
| q14 | conduct | answer | answer | conduct | yes | yes | `160-10#POLICY-STATEMENT.E.2`, `160-10#POLICY-STATEMENT.E.4` | 6473 | yes |
| q15 | conduct | answer | answer | conduct | yes | yes | `160-10#POLICY-STATEMENT.B.5.b`, `160-10#POLICY-STATEMENT.B.5.c`, `160-10#RESPONSIBILITIES.8.a` | 9430 | yes |
| q16 | conduct | answer | answer | conduct | yes | yes | `160-10#POLICY-STATEMENT.A.1`, `160-10#POLICY-STATEMENT.A.1.a`, `160-10#POLICY-STATEMENT.A.1.b` | 12604 | yes |
| q17 | conduct | answer | answer | conduct | yes | yes | `160-10#POLICY-STATEMENT.J.3`, `160-10#POLICY-STATEMENT.J.4`, `160-10#POLICY-STATEMENT.J.5` | 6655 | yes |
| q18 | conduct | answer | answer | conduct | yes | yes | `160-10#POLICY-STATEMENT.I.1`, `160-10#POLICY-STATEMENT.I.2.a`, `160-10#POLICY-STATEMENT.I.3` | 11119 | yes |
| q21 | conduct | answer | answer | conduct | yes | yes | `160-11#4.B.1`, `160-11#4.B.2`, `160-11#4.B.3` | 7583 | yes |
| q22 | conduct/records | answer | answer | records | yes | yes | `160-2#13.C.1`, `160-2#13.C.2`, `160-2#13.D.1` | 11520 | yes |
| q52 | conduct | answer | answer | conduct | yes | yes | `SR-APPX2#I.C.A.1`, `SR-APPX2#I.C.C.A` | 8323 | yes |
| q53 | conduct | answer | answer | conduct | yes | yes | `200-28#RESPONSIBILITIES.A`, `200-28#RESPONSIBILITIES.A.2`, `200-28#RESPONSIBILITIES.A.3.a` | 6734 | yes |
| q54 | conduct | answer | answer | conduct | yes | yes | `200-28#RESPONSIBILITIES.B.1`, `200-28#RESPONSIBILITIES.C`, `160-10#POLICY-STATEMENT.A.2` | 7178 | yes |
| q62 | conduct | answer | answer (n/a) | conduct | yes | yes | `160-10#POLICY-STATEMENT.D.3`, `160-10#POLICY-STATEMENT.D.5`, `160-10#POLICY-STATEMENT.D.14` | 13686 | yes |
| q31 | academics | answer | answer | academics | yes | yes | `SR-500#B.2`, `SR-500#B.5` | 7234 | yes |
| q32 | academics | answer | answer | academics | yes | yes | `SR-500#D.1`, `SR-500#D.2` | 6204 | yes |
| q33 | academics | answer | answer | academics | yes | yes | `SR-501#B.2`, `SR-500#F.F.1`, `SR-500#F.F.2` | 7035 | yes |
| q34 | academics | answer | answer | academics | yes | yes | `SR-502#A.1`, `SR-502#A.2`, `SR-500#F.H.1` | 13204 | yes |
| q35 | academics | answer | answer | academics | yes | yes | `SR-505#A`, `SR-505#F.2` | 8669 | yes |
| q36 | academics | answer | answer | academics | yes | yes | `SR-515#B`, `SR-515#C` | 6499 | yes |
| q37 | academics | answer | answer | academics | yes | yes | `SR-600#B.4.C.1`, `SR-600#B.4.C.2`, `SR-600#B.4.C.3` | 7763 | yes |
| q63 | academics | answer | answer | academics | yes | yes | `SR-502#A.1`, `SR-502#A.2`, `SR-502#B.2` | 11609 | yes |
| q68 | academics | answer | answer (n/a) | academics | yes | yes | `SR-515#B` | 7397 | yes |
| q12 | speech | answer | answer (n/a) | speech | yes | yes | `160-8#POLICY-STATEMENT` | 6538 | yes |
| q13 | speech | answer | answer | speech | yes | yes | `160-8#POLICY-STATEMENT`, `160-8#REVISION-HISTORY` | 5658 | yes |
| q19 | speech | answer | answer | speech | yes | yes | `160-9#POLICY-STATEMENT.A.2`, `160-9#POLICY-STATEMENT.A.3` | 5703 | yes |
| q20 | speech | answer | answer | speech | yes | yes | `160-9#POLICY-STATEMENT.B.2` | 6175 | yes |
| q38 | speech | answer | answer | speech | yes | yes | `510-1-IX#POLICY-STATEMENT.E.1.a`, `510-1-IX#POLICY-STATEMENT.E.1.d`, `510-1-IX#POLICY-STATEMENT.E.1.e` | 8258 | yes |
| q39 | speech | answer | answer | speech | yes | yes | `510-1-IX#POLICY-STATEMENT.E.1.e`, `510-1-IX#POLICY-STATEMENT.B.1`, `510-1-IX#POLICY-STATEMENT.E.1.a` | 6725 | yes |
| q40 | speech | answer | answer | speech | yes | yes | `510-1-XIII#PROCEDURES.A`, `510-1-XIII#PROCEDURES.B`, `510-1-XIII#PROCEDURES.C` | 8972 | yes |
| q41 | speech | answer | answer | speech | yes | yes | `510-10#POLICY-STATEMENT.E.2.a`, `510-10#POLICY-STATEMENT.E.2.b`, `510-10#POLICY-STATEMENT.E.3` | 8663 | yes |
| q65 | speech | answer | answer | speech | yes | yes | `510-1-IX#POLICY-STATEMENT`, `510-1-IX#DEFINITIONS.7`, `510-1-IX#POLICY-STATEMENT.B.1` | 18592 | yes |
| q09 | safety | answer | answer | safety | yes | yes | `160-6#POLICY-STATEMENT.I`, `160-6#POLICY-STATEMENT.II`, `160-6#PROCEDURES.I.B` | 10885 | yes |
| q10 | safety | answer | answer | safety | yes | yes | `160-6#POLICY-STATEMENT.III.A`, `160-6#PROCEDURES.I.D`, `160-6#PROCEDURES.I.A` | 6003 | yes |
| q11 | safety | answer | answer | safety | yes | yes | `160-6#RESPONSIBILITIES.I.I` | 5109 | yes |
| q42 | safety | answer | answer | safety | yes | yes | `200-9#IV.B.7.1`, `200-9#IV.B.7.2`, `200-9#IV.B.7.2.2` | 7226 | yes |
| q43 | safety | answer | answer | safety | yes | yes | `200-19#II.C.1`, `200-19#II.A.a`, `200-19#II.A.b` | 9016 | yes |
| q44 | safety | answer | answer | safety | yes | yes | `200-23#IV.C` | 7885 | yes |
| q45 | safety | answer | answer | safety | yes | yes | `230-017#b.3`, `230-017#b.1` | 5889 | yes |
| q67 | safety | answer | answer | safety | yes | yes | `200-19#II.A`, `200-19#II.A.a`, `200-19#II.A.b` | 15146 | yes |
| q46 | money | answer | answer | money | yes | yes | `300-70#III.E`, `300-70#IV.D`, `300-70#IV.E` | 11696 | yes |
| q47 | money | answer | answer | money | yes | yes | `545-2#PROCEDURES.4`, `545-2#PROCEDURES.5` | 5625 | yes |
| q48 | money | answer | answer | money | yes | yes | `270-11#POLICY-STATEMENT.3`, `270-11#POLICY-STATEMENT.4` | 5941 | yes |
| q49 | money | answer | answer | money | yes | yes | `270-7#POLICY-STATEMENT`, `270-7#PROCEDURES`, `270-7#FORMS` | 6714 | yes |
| q66 | money | answer | answer | money | yes | yes | `545-2#PROCEDURES.4`, `545-2#PROCEDURES.5` | 6492 | yes |
| q69 | money | answer | answer (n/a) | money | yes | yes | `300-70#III.E` | 4385 | yes |
| q23 | — | refuse | refuse | — | — | — | — | 1350 | no |
| q24 | — | refuse | answer (n/a) | money | — | — | `545-2#PROCEDURES.4`, `545-2#PROCEDURES.5` | 19787 | yes |
| q25 | — | refuse | refuse | — | — | — | — | 8731 | no |
| q26 | — | refuse | refuse | — | — | — | — | 1384 | no |
| q27 | — | refuse | refuse | — | — | — | — | 1361 | no |
| q28 | — | refuse | answer (n/a) | academics | — | — | `SR-501#C`, `SR-501#C.3` | 6523 | yes |
| q29 | — | refuse | answer (n/a) | safety | — | — | `200-16#III`, `200-16#IV.B` | 25305 | yes |
| q30 | — | refuse | refuse | — | — | — | — | 1287 | no |
| q55 | — | refuse | refuse | — | — | — | — | 1407 | no |
| q56 | — | refuse | answer (n/a) | academics | — | — | `SR-500#A.3`, `SR-500#A.2` | 6838 | yes |
| q57 | — | refuse | refuse | money | — | — | — | 2228 | yes |
| q58 | — | refuse | refuse | — | — | — | — | 1379 | no |
| q59 | — | refuse | error: timeout after 90 s | — | — | — | — | 146777 | — |
| q60 | — | refuse | error: timeout after 90 s | — | — | — | — | 93695 | — |
| q61 | — | refuse | error: timeout after 90 s | — | — | — | — | 167307 | — |

**Answered/refused correct:** 66/69 (96%) — false refusals 0 (none), false answers 3 (q59, q60, q61), errors 3 (q59, q60, q61).
**Citations (54 answerable):** cited-expected 53/54 (98%), cited-doc 54/54 (100%).
**Router (54 answerable):** right area 54/54 (100%), misses none; routed via runner-up on 0 of 69 questions (none).
**Cost:** 114.3¢ total (grounding.cost summed over 69 questions).
**Latency:** median 7397 ms, mean 8286 ms over 66 completed calls. **Cache:** area prefix read from cache on 59/69 (86%).

## Summary

The server decided answer-vs-refuse correctly on 66 of 69 questions, and answered off-corpus q59, q60, q61 instead of refusing. Of the 54 answerable questions, 53 cited an expected clause and 54 cited at least the right policy; the clause misses are q64. The router read the right area on 54 of 54 answerable questions and fell back to the runner-up area 0 times; the run cost about 114.3¢. Answers took 7397 ms at the median, with the prompt cache serving the area on 59 of 69 calls; 3 calls failed (q59, q60, q61).
