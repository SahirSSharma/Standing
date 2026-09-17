// POST /api/ask — see DESIGN.md "API contract". Two server-side gates enforce refusal:
// 1. retrieval not confident → refuse without calling the LLM;
// 2. LLM says NO_ANSWER or cites nothing it was shown → refuse.
import { search, isConfident } from '@/lib/retrieve';
import { answer, NO_ANSWER, normalizeMarkers } from '@/lib/llm';

export const runtime = 'nodejs';

const K = 6;
const REASON_NOT_COVERED = "The policies Standing knows don't cover this.";
const REASON_NOT_DIRECT = 'I found related policy text but nothing that answers this directly.';

function refusal(reason, retrieval) {
  return Response.json({ answer: '', citations: [], refused: true, reason, retrieval });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body must be JSON.' }, { status: 400 });
  }
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  if (question.length < 3 || question.length > 500) {
    return Response.json({ error: 'question must be a string of 3–500 characters.' }, { status: 400 });
  }

  const results = search(question, K);
  const retrieval = { topScore: Math.round((results[0]?.normScore ?? 0) * 1000) / 1000, k: K };
  if (!isConfident(results)) return refusal(REASON_NOT_COVERED, retrieval);

  const chunks = results.map((r) => r.chunk);
  let llm;
  try {
    llm = await answer({ question, chunks });
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status ?? 500 });
  }

  const byId = new Map(chunks.map((c) => [c.id, c]));
  const citedIds = llm.citedIds.filter((id) => byId.has(id)); // drop ids the model was not shown
  if (llm.answer === NO_ANSWER || citedIds.length === 0) return refusal(REASON_NOT_DIRECT, retrieval);

  const citations = citedIds.map((id) => {
    const c = byId.get(id);
    return {
      id,
      docId: c.docId,
      docTitle: c.docTitle,
      clause: c.clause,
      heading: c.heading,
      quote: c.text.slice(0, 300).trimEnd(),
      effectiveDate: c.effectiveDate,
      url: c.url,
    };
  });
  // Inline "[160-2#5.A]" markers for cited ids stay in the text: the UI renders them as chips.
  const answerText = normalizeMarkers(llm.answer, new Set(citedIds));
  return Response.json({ answer: answerText, citations, refused: false, retrieval });
}
