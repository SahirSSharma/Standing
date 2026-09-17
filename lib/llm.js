// Answer step: Claude sees ONLY the retrieved clauses and must cite them by chunk id.
// The route validates every cited id against the retrieved set, so the model cannot smuggle in
// a clause it was not shown.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-5';
export const NO_ANSWER = 'NO_ANSWER';

const SYSTEM = `You are Standing, a plain-language guide to UC San Diego's official student policies.
Answer ONLY from the policy clauses in the user message. Rules:
- Every statement must be supported by a clause. Cite it inline with its id in square brackets, exactly as given, e.g. [160-2#5.A]. Never invent or alter clause ids or clause numbers.
- If the clauses do not answer the question, reply with exactly: ${NO_ANSWER}
- Write plain, non-legalistic language a student can act on. Be concise (a short paragraph or a few bullets).
- Do not use knowledge from outside the provided clauses.`;

function formatClauses(chunks) {
  return chunks
    .map((c) => `[${c.id}] ${c.docTitle} — ${c.heading} (clause ${c.clause}, effective ${c.effectiveDate})\n${c.text}`)
    .join('\n\n');
}

/** Every token inside [...] that looks like a chunk id (contains '#'); handles "[a#1, b#2]" too. */
export function parseCitedIds(text) {
  const ids = new Set();
  for (const [, inner] of text.matchAll(/\[([^\]]+)\]/g)) {
    for (const token of inner.split(/[,\s]+/)) if (token.includes('#')) ids.add(token);
  }
  return [...ids];
}

/**
 * Rewrite each "[a#1, b#2]" group in the answer so every id in `valid` stands alone as "[a#1] [b#2]"
 * (the UI renders those as clickable chips); ids not in `valid` are dropped, and a group left
 * empty disappears along with the space before it.
 */
export function normalizeMarkers(text, valid) {
  return text
    .replace(/\s*\[([^\]]*#[^\]]*)\]/g, (_, inner) => {
      const kept = inner.split(/[,\s]+/).filter((token) => valid.has(token));
      return kept.length ? ' ' + kept.map((id) => `[${id}]`).join(' ') : '';
    })
    .trim();
}

// LLM_MOCK=1 (or no key): top chunk's first two sentences, cited. No network, so the UI, eval and
// e2e path all work without ANTHROPIC_API_KEY.
function mockAnswer(chunks) {
  const top = chunks[0];
  // Split on whitespace after sentence punctuation, so "$0.10" or "Section 5.A" stays intact.
  const sentences = top.text.split(/(?<=[.!?])\s+/);
  return { answer: sentences.slice(0, 2).join(' '), citedIds: [top.id] };
}

let client;

/** @returns {Promise<{answer: string, citedIds: string[]}>} answer is NO_ANSWER when the clauses don't cover it */
export async function answer({ question, chunks }) {
  if (process.env.LLM_MOCK === '1' || !process.env.ANTHROPIC_API_KEY) return mockAnswer(chunks);

  client ??= new Anthropic();
  let res;
  try {
    res = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      // Sonnet 5 rejects sampling params (temperature etc.) with a 400, so none are sent.
      // Thinking is off so the whole max_tokens budget goes to the answer itself.
      thinking: { type: 'disabled' },
      system: SYSTEM,
      messages: [{ role: 'user', content: `Policy clauses:\n\n${formatClauses(chunks)}\n\nQuestion: ${question}` }],
    });
  } catch (err) {
    throw toHttpError(err);
  }

  if (res.stop_reason === 'refusal') return { answer: NO_ANSWER, citedIds: [] };
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  if (new RegExp(`^${NO_ANSWER}\\b`).test(text)) return { answer: NO_ANSWER, citedIds: [] };
  return { answer: text, citedIds: parseCitedIds(text) };
}

// One SDK class per status: retryable (429 / 5xx / network) becomes 503, anything else 502.
function toHttpError(err) {
  const retryable =
    err instanceof Anthropic.RateLimitError ||
    err instanceof Anthropic.InternalServerError ||
    err instanceof Anthropic.APIConnectionError;
  const e = new Error(retryable ? 'The answering service is busy; try again in a moment.' : `Answering service error: ${err.message}`);
  e.status = retryable ? 503 : 502;
  return e;
}
