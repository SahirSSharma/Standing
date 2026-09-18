// POST /api/ask — see DESIGN.md "API contract". The model reads every policy; the server refuses
// when it answers NO_ANSWER or when none of its citations resolve to a clause in the corpus.
import { answer, NO_ANSWER } from '@/lib/llm';
import { chunkById } from '@/lib/corpus';

export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel function timeout; an answer takes ~12 s

const REASON = "The policies Standing knows don't answer this.";

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

  let llm;
  try {
    llm = await answer({ question });
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status ?? 500 });
  }

  const { grounding } = llm;
  if (llm.answer === NO_ANSWER || llm.citations.length === 0) {
    return Response.json({ answer: '', citations: [], refused: true, reason: REASON, grounding });
  }

  const citations = llm.citations.map(({ id, quote }) => {
    const c = chunkById(id);
    return {
      id,
      docId: c.docId,
      docTitle: c.docTitle,
      clause: c.clause,
      heading: c.heading,
      quote,
      effectiveDate: c.effectiveDate,
      url: c.url,
    };
  });
  return Response.json({ answer: llm.answer, citations, refused: false, grounding });
}
