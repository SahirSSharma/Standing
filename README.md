# Standing

**Know where you stand.** Ask anything about your rights as a UCSD student — records, grievances,
conduct procedures, student organizations — and get an answer anchored to the exact clause of the
official policy, with its effective date and a link to the source. If the policies don't answer it,
Standing says so instead of guessing.

Built for [LexHack 2026](https://lexhack-2026.devpost.com/) · Track: Access to Justice & Civic Tech

_Status: day 1 — see PROGRESS.md._

## Run locally
```bash
npm install
npm run ingest        # fetches the 7 student-facing UCSD PPM documents → data/
npm run dev           # http://localhost:3000
npm run eval          # retrieval + answer/refusal evaluation → eval/results.md
```
Set `ANTHROPIC_API_KEY` for real answers, or `LLM_MOCK=1` to run without a key.

See [DESIGN.md](DESIGN.md) for architecture and data contracts, [CHANGELOG.md](CHANGELOG.md) for
history.
