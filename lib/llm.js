// Two model calls per question. 1) Route: a small model reads the six life areas (policy names and
// one-line summaries) and picks the area most likely to answer, plus a runner-up. 2) Answer: Claude
// reads every policy in that area (one document block each, 45–65k tokens, prompt-cached per area for
// an hour) with the API's citation feature on, so each cited passage comes back as a char range into a
// document rather than as text the model typed. Ranges are resolved to clause chunks here; a range that
// resolves to nothing is dropped, and the route refuses on zero citations. If the answer is NO_ANSWER
// and the router named a runner-up area, that area is read once more before refusing.
import Anthropic from '@anthropic-ai/sdk';
import { areas, areaById, chunks, chunkById, docById, resolve } from './corpus.js';

// Sonnet 5 by default: with an area served from cache an answer costs about 2¢. STANDING_MODEL overrides.
const MODEL = process.env.STANDING_MODEL || 'claude-sonnet-5';
const ROUTER_MODEL = process.env.STANDING_ROUTER_MODEL || 'claude-haiku-4-5-20251001';
// Server-side refusal fallbacks are an Opus/Fable-tier feature; other models reject the parameter.
const USE_FALLBACKS = /^claude-(opus|fable)/.test(MODEL);
export const NO_ANSWER = 'NO_ANSWER';
const MOCK = () => process.env.LLM_MOCK === '1' || !process.env.ANTHROPIC_API_KEY;

// The answer's shape is parsed by lib/sections.js; every section is optional.
const SYSTEM = `You are Standing, a plain-language guide to UC San Diego's official student policies.
Answer only from the documents provided. If they do not answer the question, reply with exactly ${NO_ANSWER} and nothing else.
Cite the passages you relied on; a passage that merely mentions the topic is not a passage that answers the question.
Write for a student in a hurry: short, concrete, no jargon, and never quote a clause at length — say what it means in your own words. Use exactly this shape and leave out any section that does not apply:

Verdict: yes, no, depends, or n/a (n/a for how-to questions)
**One bold line that directly answers the question as asked, e.g. Generally no — not without your written consent.**
## Why
One to three short sentences.
## They can
- What the university, an office or an instructor may do — at most four bullets.
## You can
- What the student may do or is entitled to — at most four bullets.
## Steps
1. The process in order, one step per line, naming who does it — at most six steps.
## Deadlines
- Each time limit the policy sets, written as "<what>: within <time> of <event>".

Every bullet, step and deadline is one sentence of at most 20 words. If the documents do not answer the question, reply with exactly: ${NO_ANSWER}`;

const ROUTER_SYSTEM = `You route a UC San Diego student's question to the group of policies most likely to answer it. Reply with JSON only, no prose: {"area": "<id>", "second": "<id or null>"}. "second" is the next most likely group, or null if no other group could plausibly answer.`;
const ROUTER_MENU = areas
  .map((a) => `${a.id} — ${a.name}\n${a.docs.map((d) => `  - ${d.name}: ${d.summary}`).join('\n')}`)
  .join('\n\n');

const DRAFT_SYSTEM = `You write short, polite, formal requests that a UC San Diego student can send to the university, based only on the policies provided and on the answer the student was given.
Format: a "To:" line naming the office or role the policy says handles this, a "Subject:" line, then the message. Under 220 words. Refer to the policy by its label and clause (e.g. PPM 160-2 §8.A, Senate Regulation 502 §B.2) where it gives the student the right or sets the deadline. Put anything the student must fill in inside [square brackets] — never invent names, dates, courses or facts the student did not state. End with a signature line "[Your name]" and "[PID]". No preamble before "To:" and nothing after the signature.`;

// One document block per policy in the area, catalog order (document_index points into area.docs).
// cache_control on the last block caches the area's whole prefix; the question comes after it.
// 1-hour TTL: traffic is sporadic (a student now, a judge in 40 minutes), and re-writing 50k tokens
// into the cache costs far more than keeping it warm.
const BLOCKS = new Map(areas.map((a) => [a.id, a.docs.map((d, i) => ({
  type: 'document',
  source: { type: 'text', media_type: 'text/plain', data: d.text },
  title: d.title,
  context: `${d.label}, effective ${d.effectiveDate}`,
  citations: { enabled: true },
  ...(i === a.docs.length - 1 && { cache_control: { type: 'ephemeral', ttl: '1h' } }),
}))]));

let client;
const api = () => (client ??= new Anthropic());

/**
 * @returns {Promise<{answer: string, citations: {id: string, quote: string}[], grounding: object}>}
 * `answer` is NO_ANSWER when the policies don't cover the question; otherwise it carries an inline
 * " [<chunk id>]" marker after each cited passage (the UI renders those as chips). `citations` lists
 * each id once, with the cited words from that clause; `grounding` is the accounting the route reports.
 */
export async function answer({ question }) {
  if (MOCK()) return mockAnswer(question);
  const routed = await route(question);
  let result = await ask(question, routed.area);
  let retried = false;
  if (result.answer === NO_ANSWER && routed.second) {
    retried = true;
    const again = await ask(question, routed.second);
    again.cost += result.cost;
    if (again.answer !== NO_ANSWER) result = again;
    else result.cost = again.cost;
  }
  const area = areaById(result.area);
  return {
    answer: result.answer,
    citations: result.citations,
    grounding: {
      area: area.id, areaName: area.name, documents: area.docs.length,
      routed: routed.second ? [routed.area, routed.second] : [routed.area], retried,
      inputTokens: result.inputTokens, cacheRead: result.cacheRead, model: result.model,
      stopReason: result.stopReason, // "max_tokens" means the answer was cut off (the Deadlines section goes first)
      cost: round(result.cost + routed.cost),
    },
  };
}

// One answering call over one area.
async function ask(question, areaId) {
  const area = areaById(areaId);
  let res;
  try {
    res = await api().beta.messages.create({
      model: MODEL,
      // Answers run ~1000 tokens; 1600 keeps Deadlines (the last section) from being cut off silently and
      // caps the worst-case output cost at 1.6¢ on Sonnet 5. stop_reason is logged and reported either way.
      max_tokens: 1600,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      // Server-side refusal fallback (Claude API skill default for Opus 5): a safety-classifier
      // decline is re-run on Anthropic's recommended substitute instead of surfacing as a refusal.
      ...(USE_FALLBACKS && { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }),
      system: SYSTEM,
      messages: [{ role: 'user', content: [...BLOCKS.get(areaId), { type: 'text', text: `Question: ${question}` }] }],
    });
  } catch (err) {
    throw toHttpError(err);
  }
  const u = res.usage;
  const base = {
    area: areaId, model: res.model, stopReason: res.stop_reason, cost: estimateCost(u, MODEL, `answer/${areaId}`, res.stop_reason),
    inputTokens: (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0),
    cacheRead: (u.cache_read_input_tokens ?? 0) > 0,
  };
  if (res.stop_reason === 'refusal') return { ...base, answer: NO_ANSWER, citations: [] };

  let text = '';
  const citations = [];
  for (const block of res.content) {
    if (block.type !== 'text') continue;
    const ids = new Set();
    for (const c of block.citations ?? []) {
      const doc = area.docs[c.document_index];
      for (const span of resolve(doc, c.start_char_index, c.end_char_index)) {
        const { id } = span.chunk;
        if (ids.has(id)) continue;
        ids.add(id);
        if (!citations.some((x) => x.id === id)) citations.push({ id, quote: quote(doc, c, span) });
      }
    }
    // Markers go before the block's trailing whitespace so they stay on the cited sentence's line.
    const trailing = block.text.match(/\s*$/)[0];
    const markers = [...ids].map((id) => ` [${id}]`).join('');
    text += block.text.slice(0, block.text.length - trailing.length) + markers + trailing;
  }
  text = text.trim();
  if (new RegExp(`^${NO_ANSWER}\\b`).test(text)) return { ...base, answer: NO_ANSWER, citations: [] };
  return { ...base, answer: text, citations };
}

// Which area to read. The small model sees every policy's name and one-line summary (~2k tokens,
// ~0.2¢); anything it returns that is not an area id falls back to the keyword router.
async function route(question) {
  if (MOCK()) return mockRoute(question);
  let res;
  try {
    res = await api().messages.create({
      model: ROUTER_MODEL,
      max_tokens: 60,
      system: ROUTER_SYSTEM,
      messages: [{ role: 'user', content: `Areas:\n\n${ROUTER_MENU}\n\nQuestion: ${question}` }],
    });
  } catch (err) {
    throw toHttpError(err);
  }
  const cost = estimateCost(res.usage, ROUTER_MODEL, 'route');
  const text = res.content.map((b) => b.text ?? '').join('');
  const pick = (key) => {
    const id = text.match(new RegExp(`"${key}"\\s*:\\s*"([a-z]+)"`))?.[1];
    return areaById(id) ? id : null;
  };
  const area = pick('area');
  if (!area) {
    console.warn(`[standing] router returned no area (${JSON.stringify(text)}); using keyword routing`);
    return { ...mockRoute(question), cost };
  }
  const second = pick('second');
  return { area, second: second !== area ? second : null, cost };
}

/**
 * A request the student can send, written from the same area's policies (cache hit) plus the answer
 * they were given. `citations` are chunk ids from that answer.
 * @returns {Promise<{letter: string, grounding: object}>}
 */
export async function draft({ question, answer: given, citations }) {
  const cited = citations.map((id) => chunkById(id)).filter(Boolean);
  const areaId = cited.length ? docById(cited[0].docId).area : (await route(question)).area;
  if (MOCK()) return mockDraft(question, cited, areaId);
  const context = cited.map((c) => `${docById(c.docId).label} §${c.clause}: ${c.text.slice(0, 400)}`).join('\n');
  let res;
  try {
    res = await api().beta.messages.create({
      model: MODEL,
      max_tokens: 700,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      system: DRAFT_SYSTEM,
      messages: [{ role: 'user', content: [...BLOCKS.get(areaId), { type: 'text',
        text: `The student asked: ${question}\n\nThe answer they were given:\n${given}\n\nClauses that answer relied on:\n${context}\n\nWrite the request.` }] }],
    });
  } catch (err) {
    throw toHttpError(err);
  }
  const u = res.usage;
  const letter = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  const area = areaById(areaId);
  return { letter, grounding: { area: area.id, areaName: area.name, documents: area.docs.length,
    inputTokens: (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0),
    cacheRead: (u.cache_read_input_tokens ?? 0) > 0, model: res.model, cost: estimateCost(u, MODEL, `draft/${areaId}`) } };
}

// The cited words that fall inside one clause, without the "[<clause>] " label the document text
// carries — a straddling citation gives each clause's card its own passage.
function quote(doc, c, span) {
  const text = doc.text.slice(Math.max(c.start_char_index, span.start), Math.min(c.end_char_index, span.end));
  return text.replace(/^\[[^\]]*\]\s*/, '').trim().slice(0, 300);
}

// ---------- mock: LLM_MOCK=1 or no key. No network, so the UI and eval plumbing run without a key ----------
const words = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3));
// The chunks sharing the most question words, best first (ties keep corpus order).
function rank(question, n) {
  const q = words(question);
  return chunks
    .map((c, i) => ({ c, i, score: [...words(c.text)].filter((w) => q.has(w)).length }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, n)
    .map((x) => x.c);
}
function mockRoute(question) {
  const [best, next] = rank(question, 12).map((c) => docById(c.docId).area).filter((a, i, all) => all.indexOf(a) === i);
  return { area: best ?? areas[0].id, second: next ?? null, cost: 0 };
}
const sentences = (t) => t.split(/(?<=[.!?])\s+/); // "$0.10" and "Section 5.A" stay intact
// The mock answer exercises every section of the answer shape, each line cited, so the UI can be built without a key.
function mockAnswer(question) {
  const areaId = mockRoute(question).area;
  const [a, b, c] = rank(question, 3);
  const area = areaById(areaId);
  const line = (chunk, k = 0) => `${sentences(chunk.text)[k] ?? sentences(chunk.text)[0]} [${chunk.id}]`;
  const text = [
    'Verdict: depends',
    `**${sentences(a.text)[0]}** [${a.id}]`,
    '', '## Why', line(a, 1), line(b),
    '', '## They can', `- ${line(b, 1)}`,
    '', '## You can', `- ${line(c)}`,
    '', '## Steps', `1. ${line(a)}`, `2. ${line(c, 1)}`,
    '', '## Deadlines', `- Appeal: within 10 business days of the written decision [${b.id}]`,
  ].join('\n');
  const citations = [a, b, c].filter((x, i, all) => all.indexOf(x) === i).map((x) => ({ id: x.id, quote: x.text.slice(0, 300).trim() }));
  return { answer: text, citations, grounding: { area: area.id, areaName: area.name, documents: area.docs.length,
    routed: [area.id], retried: false, inputTokens: 0, cacheRead: false, model: 'mock', stopReason: 'end_turn', cost: 0 } };
}
function mockDraft(question, cited, areaId) {
  const area = areaById(areaId);
  const refs = cited.map((c) => `${docById(c.docId).label} §${c.clause}`).join(', ');
  const letter = `To: [Office named in the policy]\nSubject: Request under ${refs || 'university policy'}\n\nDear [Name],\n\nI am writing about the following: ${question}\n\nUnder ${refs || 'university policy'}, I am asking that [what you want]. Please let me know the next step and any deadline that applies.\n\nThank you,\n[Your name]\n[PID]`;
  return { letter, grounding: { area: area.id, areaName: area.name, documents: area.docs.length, inputTokens: 0, cacheRead: false, model: 'mock', cost: 0 } };
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

// List prices per token (input, 1-hour cache write = 2× input, cache read = 0.1× input, output).
const PRICES = {
  'claude-sonnet-5': [2e-6, 4e-6, 0.2e-6, 10e-6],
  'claude-opus-5': [5e-6, 10e-6, 0.5e-6, 25e-6],
  'claude-haiku-4-5-20251001': [1e-6, 2e-6, 0.1e-6, 5e-6],
};
const round = (cents) => Math.round(cents * 10) / 10;
// Rough spend per call, logged so the budget is visible; unknown models are priced as Sonnet 5.
function estimateCost(u, model, label, stop = '') {
  const [inp, write, read, out] = PRICES[model] ?? PRICES['claude-sonnet-5'];
  const usd = (u.input_tokens ?? 0) * inp + (u.cache_creation_input_tokens ?? 0) * write
    + (u.cache_read_input_tokens ?? 0) * read + (u.output_tokens ?? 0) * out;
  const cents = round(usd * 100);
  console.log(`[standing] ${label} ${model} in=${u.input_tokens} cacheWrite=${u.cache_creation_input_tokens ?? 0} cacheRead=${u.cache_read_input_tokens ?? 0} out=${u.output_tokens}${stop && stop !== 'end_turn' ? ` stop=${stop}` : ''} ≈${cents}¢`);
  return cents;
}
