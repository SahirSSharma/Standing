# Eval results — 2026-09-17

Server: http://localhost:3000/api/ask. 30 questions (22 answerable, 8 off-corpus), 1 at a time.
cited-expected = a returned citation id is in expectedChunks (q21 additionally requires its mustCite id); cited-doc = a citation
points into the expected policy (partial credit). "top cited ids" are the first three citations returned. cache = grounding.cacheRead.

| id | expect | got | cited-expected | cited-doc | top cited ids | ms | cache |
|---|---|---|---|---|---|---|---|
| q01 | answer | answer | yes | yes | `160-2#5.A`, `160-2#5.G.3`, `160-2#5.F` | 6994 | yes |
| q02 | answer | answer | yes | yes | `160-2#5.D`, `160-2#5.C`, `160-2#5.G.4` | 5096 | yes |
| q03 | answer | answer | yes | yes | `160-2#3.D`, `160-2#4.B.1`, `160-2#8.A` | 8291 | yes |
| q04 | answer | answer | yes | yes | `160-2#9.A`, `160-2#4.B`, `160-2#5.F.1` | 7505 | yes |
| q05 | answer | answer | yes | yes | `160-2#9.A.7`, `160-2#9.A.7.a`, `160-2#12.B` | 7252 | yes |
| q06 | answer | answer | yes | yes | `160-2#15`, `160-2#13.C.1`, `160-2#13.C.2` | 6851 | yes |
| q07 | answer | answer | yes | yes | `160-3#I`, `160-3#V.1`, `160-3#V.2` | 5936 | yes |
| q08 | answer | answer | yes | yes | `160-3#IV.A`, `160-3#II`, `160-3#V.2` | 6662 | yes |
| q09 | answer | answer | yes | yes | `160-6#POLICY-STATEMENT.II`, `160-6#POLICY-STATEMENT.III.B`, `160-6#POLICY-STATEMENT.III.A` | 7367 | yes |
| q10 | answer | answer | yes | yes | `160-6#PROCEDURES.I.D`, `160-6#POLICY-STATEMENT.III.A`, `160-6#PROCEDURES.I.A` | 5061 | yes |
| q11 | answer | answer | yes | yes | `160-6#RESPONSIBILITIES.I.I` | 4015 | yes |
| q12 | answer | answer | yes | yes | `160-8#POLICY-STATEMENT`, `160-8#POLICY-SUMMARY` | 3454 | yes |
| q13 | answer | answer | yes | yes | `160-8#POLICY-STATEMENT`, `160-8#REVISION-HISTORY` | 4000 | yes |
| q14 | answer | answer | yes | yes | `160-10#POLICY-STATEMENT.E.2`, `160-10#POLICY-STATEMENT.E.4`, `160-10#POLICY-STATEMENT.B.5.a` | 5054 | yes |
| q15 | answer | answer | yes | yes | `160-10#RESPONSIBILITIES.8.a`, `160-10#POLICY-STATEMENT.B.5.a`, `160-10#POLICY-STATEMENT.B.5.c` | 7362 | yes |
| q16 | answer | answer | yes | yes | `160-10#POLICY-STATEMENT.A.1`, `160-10#POLICY-STATEMENT.A.1.a`, `160-10#POLICY-STATEMENT.A.1.b` | 9249 | yes |
| q17 | answer | answer | yes | yes | `160-10#POLICY-STATEMENT.J.3`, `160-10#POLICY-STATEMENT.J.4`, `160-10#POLICY-STATEMENT.J.5` | 5734 | yes |
| q18 | answer | answer | yes | yes | `160-10#POLICY-STATEMENT.I.2.a`, `160-10#POLICY-STATEMENT.I.1`, `160-10#POLICY-STATEMENT.I.4` | 5817 | yes |
| q19 | answer | answer | yes | yes | `160-9#POLICY-STATEMENT.A.2`, `160-9#POLICY-STATEMENT.A.3` | 4732 | yes |
| q20 | answer | answer | yes | yes | `160-9#POLICY-STATEMENT.B.2`, `160-9#DEFINITIONS.B` | 4648 | yes |
| q21 | answer | answer | yes | yes | `160-11#4.B.1`, `160-11#4.B.2`, `160-11#4.B.3` | 5839 | yes |
| q22 | answer | answer | yes | yes | `160-11#3`, `160-11#4.A.1`, `160-11#4.A.2` | 5486 | yes |
| q23 | refuse | refuse | — | — | — | 3050 | yes |
| q24 | refuse | refuse | — | — | — | 2706 | yes |
| q25 | refuse | refuse | — | — | — | 1225 | yes |
| q26 | refuse | refuse | — | — | — | 3055 | yes |
| q27 | refuse | refuse | — | — | — | 2811 | yes |
| q28 | refuse | refuse | — | — | — | 2308 | yes |
| q29 | refuse | refuse | — | — | — | 3138 | yes |
| q30 | refuse | refuse | — | — | — | 2614 | yes |

**Answered/refused correct:** 30/30 (100%) — false refusals 0 (none), false answers 0 (none), errors 0 (none).
**Citations (22 answerable):** cited-expected 22/22 (100%), cited-doc 22/22 (100%).
**Latency:** median 5096 ms, mean 5110 ms over 30 completed calls. **Cache:** corpus prefix read from cache on 30/30 (100%).

## Summary

The server decided answer-vs-refuse correctly on 30 of 30 questions. Of the 22 answerable questions, 22 cited an expected clause and 22 cited at least the right policy; the clause misses are none. Answers took 5096 ms at the median, with the prompt cache serving the corpus on 30 of 30 calls.
