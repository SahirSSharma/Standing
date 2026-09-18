// POST /api/draft — a request the student can send, written from the answer they were given and the
// same area's policies. Body: {question, answer, citations: [chunk ids]}; response: {letter, grounding}.
import { draft } from '@/lib/llm';
import { chunkById } from '@/lib/corpus';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body must be JSON.' }, { status: 400 });
  }
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  const answer = typeof body?.answer === 'string' ? body.answer.trim() : '';
  const citations = Array.isArray(body?.citations) ? body.citations.filter((id) => typeof id === 'string' && chunkById(id)) : [];
  if (question.length < 3 || question.length > 500 || answer.length < 3 || answer.length > 8000 || citations.length === 0) {
    return Response.json({ error: 'question (3–500 chars), answer (3–8000 chars) and at least one known citation id are required.' }, { status: 400 });
  }
  try {
    const { letter, grounding } = await draft({ question, answer, citations: citations.slice(0, 12) });
    return Response.json({ letter, grounding });
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status ?? 500 });
  }
}
