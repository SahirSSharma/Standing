// Answer step: Claude reads every policy (one document block each, ~74k tokens, prompt-cached) and
// answers with the API's citation feature on, so each cited passage comes back as a char range
// into a document rather than as text the model typed. Those ranges are resolved to clause chunks
// here; a range that resolves to nothing is dropped, and the route refuses on zero citations.
import Anthropic from '@anthropic-ai/sdk';
import { chunks, docs, resolve } from './corpus.js';

const MODEL = 'claude-opus-5';
export const NO_ANSWER = 'NO_ANSWER';

const SYSTEM = `You are Standing, a plain-language guide to UC San Diego's official student policies.
Answer only from the documents provided. Cite the passages you relied on; a passage that merely mentions the topic is not a passage that answers the question.
Write plain language a student can act on, and keep it short — a brief paragraph or a few bullets.
If the documents do not answer the question, reply with exactly: ${NO_ANSWER}`;

// One document block per policy, same order as corpus.docs (document_index points into it).
// cache_control on the last block caches the whole corpus prefix; the question comes after it.
const DOCUMENTS = docs.map((d, i) => ({
  type: 'document',
  source: { type: 'text', media_type: 'text/plain', data: d.text },
  title: d.title,
  context: `PPM ${d.docId}, effective ${d.effectiveDate}`,
  citations: { enabled: true },
  ...(i === docs.length - 1 && { cache_control: { type: 'ephemeral' } }),
}));

let client;

/**
 * @returns {Promise<{answer: string, citations: {id: string, quote: string}[], grounding: object}>}
 * `answer` is NO_ANSWER when the policies don't cover the question; otherwise it carries an inline
 * " [<chunk id>]" marker after each cited passage (the UI renders those as chips). `citations` lists
 * each id once, with the cited text; `grounding` is the token accounting the route reports.
 */
export async function answer({ question }) {
  if (process.env.LLM_MOCK === '1' || !process.env.ANTHROPIC_API_KEY) return mockAnswer(question);

  client ??= new Anthropic();
  let res;
  try {
    res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      // Server-side refusal fallback (Claude API skill default for Opus 5): a safety-classifier
      // decline is re-run on Anthropic's recommended substitute instead of surfacing as a refusal.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      messages: [{ role: 'user', content: [...DOCUMENTS, { type: 'text', text: `Question: ${question}` }] }],
    });
  } catch (err) {
    throw toHttpError(err);
  }

  const u = res.usage;
  const grounding = {
    documents: docs.length,
    inputTokens: u.input_tokens + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0),
    cacheRead: (u.cache_read_input_tokens ?? 0) > 0,
    model: res.model,
  };
  if (res.stop_reason === 'refusal') return { answer: NO_ANSWER, citations: [], grounding };

  let text = '';
  const citations = [];
  for (const block of res.content) {
    if (block.type !== 'text') continue;
    const ids = new Set();
    for (const c of block.citations ?? []) {
      const chunk = resolve(c.document_index, c.start_char_index, c.end_char_index);
      if (!chunk || ids.has(chunk.id)) continue;
      ids.add(chunk.id);
      if (!citations.some((x) => x.id === chunk.id)) citations.push({ id: chunk.id, quote: c.cited_text.trim().slice(0, 300) });
    }
    // Markers go before the block's trailing whitespace so they stay on the cited sentence's line.
    const trailing = block.text.match(/\s*$/)[0];
    const markers = [...ids].map((id) => ` [${id}]`).join('');
    text += block.text.slice(0, block.text.length - trailing.length) + markers + trailing;
  }
  text = text.trim();
  if (new RegExp(`^${NO_ANSWER}\\b`).test(text)) return { answer: NO_ANSWER, citations: [], grounding };
  return { answer: text, citations, grounding };
}

// LLM_MOCK=1 (or no key): the chunk sharing the most question words, first two sentences, cited.
// No network, so the UI and eval plumbing run without ANTHROPIC_API_KEY.
const words = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3));
function mockAnswer(question) {
  const q = words(question);
  let best = chunks[0];
  let bestScore = -1;
  for (const c of chunks) {
    const score = [...words(c.text)].filter((w) => q.has(w)).length;
    if (score > bestScore) [best, bestScore] = [c, score];
  }
  // Split on whitespace after sentence punctuation, so "$0.10" or "Section 5.A" stays intact.
  const sentences = best.text.split(/(?<=[.!?])\s+/);
  return {
    answer: `${sentences.slice(0, 2).join(' ')} [${best.id}]`,
    citations: [{ id: best.id, quote: best.text.slice(0, 300).trim() }],
    grounding: { documents: docs.length, inputTokens: 0, cacheRead: false, model: 'mock' },
  };
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
