// POST /api/ask — see DESIGN.md "API contract". The question is routed to one life area, the model
// reads every policy in it, and the server refuses when it answers NO_ANSWER or when none of its
// citations resolve to a clause in the corpus. The answer's sections are parsed here (lib/sections.js).
import { answer, NO_ANSWER } from '@/lib/llm';
import { citationFor } from '@/lib/corpus';
import { parseSections } from '@/lib/sections';

export const runtime = 'nodejs';
export const maxDuration = 100; // Vercel function timeout: an answer takes ~5–15 s, a runner-up read doubles it, and the SDK client (40 s + one retry) must fit inside

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
    return Response.json({ answer: '', verdict: null, sections: null, citations: [], refused: true, reason: REASON, grounding });
  }

  const { verdict, answer: text, ...sections } = parseSections(llm.answer);
  const citations = llm.citations.map(({ id, quote }) => citationFor(id, quote));
  return Response.json({ answer: text, verdict, sections, citations, refused: false, grounding });
}
