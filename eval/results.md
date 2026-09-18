# Eval results — 2026-09-17

Server: http://localhost:3000/api/ask. 61 questions (46 answerable, 15 off-corpus), 1 at a time, sorted by area with refusers last.
area = where the expected clauses live; routed = grounding.area the answer was read from, "(via runner-up)" when the first area
answered NO_ANSWER and the runner-up was read (grounding.retried). cited-expected = a returned citation id is in expectedChunks (a question
with mustCite additionally requires those ids); cited-doc = a citation points into the expected policy (partial credit). "top cited ids"
are the first three citations returned. cache = grounding.cacheRead.

| id | area | expect | got | routed | cited-expected | cited-doc | top cited ids | ms | cache |
|---|---|---|---|---|---|---|---|---|---|
| q01 | records | answer | answer | records | yes | yes | `160-2#5.A`, `160-2#5.G.2`, `160-2#5.D` | 10623 | no |
| q02 | records | answer | answer | records | yes | yes | `160-2#5.D`, `160-2#5.G.4`, `160-2#11.B` | 9599 | yes |
| q03 | records | answer | answer | records | yes | yes | `160-2#8.A`, `160-2#3.D`, `160-2#4.B.1` | 17464 | yes |
| q04 | records | answer | answer | records | yes | yes | `160-2#9.A`, `160-2#9.A.1`, `160-2#8.A` | 12178 | yes |
| q05 | records | answer | answer | records | yes | yes | `160-2#9.A.7.a`, `160-2#9.A.7`, `480-3#DISCLOSURE-OF-PERSONAL-INFORMATION-TO-OTHERS.2` | 11678 | yes |
| q06 | records | answer | answer | records | yes | yes | `160-2#15.A`, `160-2#15.A.2`, `160-2#15.A.3` | 8538 | yes |
| q07 | records | answer | answer | records | yes | yes | `160-3#III`, `160-3#IV.E`, `160-3#IV.A` | 10578 | yes |
| q08 | records | answer | answer | records | yes | yes | `160-3#IV.A`, `160-3#II`, `160-3#V.2` | 6876 | yes |
| q50 | records | answer | answer | records | yes | yes | `135-5#III.A`, `135-5#III.A.1`, `135-5#III.A.2` | 11426 | yes |
| q51 | records | answer | answer | records | yes | yes | `135-9#POLICY-SUMMARY`, `135-9#POLICY-STATEMENT.2.d`, `135-9#APPENDIX-A-DISALLOWED-ACTIVITIES.2` | 8631 | yes |
| q14 | conduct | answer | answer | conduct | yes | yes | `160-10#POLICY-STATEMENT.E.2`, `160-10#POLICY-STATEMENT.E.4`, `160-10#POLICY-STATEMENT.B.5.e` | 7821 | no |
| q15 | conduct | answer | answer | conduct | yes | yes | `160-10#RESPONSIBILITIES.8.a`, `160-10#POLICY-STATEMENT.B.5.a`, `160-10#POLICY-STATEMENT.B.5.c` | 12758 | yes |
| q16 | conduct | answer | answer | conduct | yes | yes | `160-10#POLICY-STATEMENT.A.1`, `160-10#POLICY-STATEMENT.A.1.a`, `160-10#POLICY-STATEMENT.A.1.b` | 12700 | yes |
| q17 | conduct | answer | answer | conduct | yes | yes | `160-10#POLICY-STATEMENT.J.3`, `160-10#POLICY-STATEMENT.J.4`, `160-10#POLICY-STATEMENT.J.5` | 6244 | yes |
| q18 | conduct | answer | answer | academics | no | no | `SR-502#B.1`, `SR-502#B.2`, `SR-502#B.3` | 8457 | no |
| q21 | conduct | answer | answer | safety | no | no | `200-23#IV.A`, `200-23#IV.D`, `200-23#IV.A.2` | 9761 | no |
| q22 | conduct | answer | answer | records | no | no | `160-2#13.C.1`, `160-2#13.C.2`, `160-2#13.D.1` | 14487 | yes |
| q52 | conduct | answer | answer | conduct | yes | yes | `SR-APPX2#I.C.A.1`, `SR-APPX2#I.C.C.A`, `SR-APPX2#I.C.C.D` | 12576 | yes |
| q53 | conduct | answer | error: HTTP 502 | — | — | — | — | 334 | — |
| q54 | conduct | answer | error: HTTP 502 | — | — | — | — | 218 | — |
| q31 | academics | answer | error: HTTP 502 | — | — | — | — | 266 | — |
| q32 | academics | answer | error: HTTP 502 | — | — | — | — | 231 | — |
| q33 | academics | answer | error: HTTP 502 | — | — | — | — | 241 | — |
| q34 | academics | answer | error: HTTP 502 | — | — | — | — | 184 | — |
| q35 | academics | answer | error: HTTP 502 | — | — | — | — | 224 | — |
| q36 | academics | answer | error: HTTP 502 | — | — | — | — | 239 | — |
| q37 | academics | answer | error: HTTP 502 | — | — | — | — | 160 | — |
| q12 | speech | answer | error: HTTP 502 | — | — | — | — | 227 | — |
| q13 | speech | answer | error: HTTP 502 | — | — | — | — | 314 | — |
| q19 | speech | answer | error: HTTP 502 | — | — | — | — | 230 | — |
| q20 | speech | answer | error: HTTP 502 | — | — | — | — | 235 | — |
| q38 | speech | answer | error: HTTP 502 | — | — | — | — | 264 | — |
| q39 | speech | answer | error: HTTP 502 | — | — | — | — | 231 | — |
| q40 | speech | answer | error: HTTP 502 | — | — | — | — | 240 | — |
| q41 | speech | answer | error: HTTP 502 | — | — | — | — | 228 | — |
| q09 | safety | answer | error: HTTP 502 | — | — | — | — | 233 | — |
| q10 | safety | answer | error: HTTP 502 | — | — | — | — | 240 | — |
| q11 | safety | answer | error: HTTP 502 | — | — | — | — | 235 | — |
| q42 | safety | answer | error: HTTP 502 | — | — | — | — | 368 | — |
| q43 | safety | answer | error: HTTP 502 | — | — | — | — | 259 | — |
| q44 | safety | answer | error: HTTP 502 | — | — | — | — | 247 | — |
| q45 | safety | answer | error: HTTP 502 | — | — | — | — | 226 | — |
| q46 | money | answer | error: HTTP 502 | — | — | — | — | 175 | — |
| q47 | money | answer | error: HTTP 502 | — | — | — | — | 239 | — |
| q48 | money | answer | error: HTTP 502 | — | — | — | — | 234 | — |
| q49 | money | answer | error: HTTP 502 | — | — | — | — | 233 | — |
| q23 | — | refuse | error: HTTP 502 | — | — | — | — | 190 | — |
| q24 | — | refuse | error: HTTP 502 | — | — | — | — | 278 | — |
| q25 | — | refuse | error: HTTP 502 | — | — | — | — | 244 | — |
| q26 | — | refuse | error: HTTP 502 | — | — | — | — | 228 | — |
| q27 | — | refuse | error: HTTP 502 | — | — | — | — | 225 | — |
| q28 | — | refuse | error: HTTP 502 | — | — | — | — | 232 | — |
| q29 | — | refuse | error: HTTP 502 | — | — | — | — | 255 | — |
| q30 | — | refuse | error: HTTP 502 | — | — | — | — | 233 | — |
| q55 | — | refuse | error: HTTP 502 | — | — | — | — | 243 | — |
| q56 | — | refuse | error: HTTP 502 | — | — | — | — | 302 | — |
| q57 | — | refuse | error: HTTP 502 | — | — | — | — | 234 | — |
| q58 | — | refuse | error: HTTP 502 | — | — | — | — | 214 | — |
| q59 | — | refuse | error: HTTP 502 | — | — | — | — | 248 | — |
| q60 | — | refuse | error: HTTP 502 | — | — | — | — | 229 | — |
| q61 | — | refuse | error: HTTP 502 | — | — | — | — | 240 | — |

**Answered/refused correct:** 18/61 (30%) — false refusals 0 (none), false answers 0 (none), errors 43 (q53, q54, q31, q32, q33, q34, q35, q36, q37, q12, q13, q19, q20, q38, q39, q40, q41, q09, q10, q11, q42, q43, q44, q45, q46, q47, q48, q49, q23, q24, q25, q26, q27, q28, q29, q30, q55, q56, q57, q58, q59, q60, q61).
**Citations (46 answerable):** cited-expected 15/46 (33%), cited-doc 15/46 (33%).
**Router (46 answerable):** right area 15/46 (33%), misses q18, q21, q22, q53, q54, q31, q32, q33, q34, q35, q36, q37, q12, q13, q19, q20, q38, q39, q40, q41, q09, q10, q11, q42, q43, q44, q45, q46, q47, q48, q49; routed via runner-up on 0 of 61 questions (none).
**Cost:** 109.8¢ total (grounding.cost summed over 61 questions).
**Latency:** median 10623 ms, mean 10689 ms over 18 completed calls. **Cache:** area prefix read from cache on 14/61 (23%).

## Summary

The server decided answer-vs-refuse correctly on 18 of 61 questions. Of the 46 answerable questions, 15 cited an expected clause and 15 cited at least the right policy; the clause misses are q18, q21, q22, q53, q54, q31, q32, q33, q34, q35, q36, q37, q12, q13, q19, q20, q38, q39, q40, q41, q09, q10, q11, q42, q43, q44, q45, q46, q47, q48, q49. The router read the right area on 15 of 46 answerable questions and fell back to the runner-up area 0 times; the run cost about 109.8¢. Answers took 10623 ms at the median, with the prompt cache serving the area on 14 of 61 calls; 43 calls failed (q53, q54, q31, q32, q33, q34, q35, q36, q37, q12, q13, q19, q20, q38, q39, q40, q41, q09, q10, q11, q42, q43, q44, q45, q46, q47, q48, q49, q23, q24, q25, q26, q27, q28, q29, q30, q55, q56, q57, q58, q59, q60, q61).
