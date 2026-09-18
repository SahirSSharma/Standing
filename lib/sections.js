// The answer's structure, parsed from the model's markdown (contract: DESIGN.md "Answer format").
// The model writes "Verdict: yes|no|depends", one bold short-answer line, then optional "## Why",
// "## They can", "## You can", "## Steps", "## Deadlines" sections. Everything stays markdown with the
// inline " [<chunk id>]" citation markers, so the UI renders chips inside each part.

const SECTIONS = { why: 'why', 'they can': 'theyCan', 'you can': 'youCan', steps: 'steps', deadlines: 'deadlines' };
const VERDICTS = new Set(['yes', 'no', 'depends']);

/**
 * @param {string} text the full answer markdown
 * @returns {{verdict: string|null, short: string, why: string, theyCan: string[], youCan: string[], steps: string[], deadlines: string[], answer: string}}
 * `answer` is the markdown without the Verdict line (what "Copy answer" copies); list sections are one
 * markdown item per entry, bullets and numbers stripped.
 */
export function parseSections(text) {
  const out = { verdict: null, short: '', why: '', theyCan: [], youCan: [], steps: [], deadlines: [] };
  const lines = text.split('\n');
  let i = 0;
  // Verdict line, if present, is first.
  while (i < lines.length && !lines[i].trim()) i++;
  const v = lines[i]?.trim().match(/^\**verdict:?\**\s*\**([a-z]+)\**\.?$/i);
  if (v) { out.verdict = VERDICTS.has(v[1].toLowerCase()) ? v[1].toLowerCase() : null; i++; }
  const kept = lines.slice(i);
  // Short answer: the first bold line.
  while (i < lines.length && !lines[i].trim()) i++;
  const s = lines[i]?.trim().match(/^\*\*(.+?)\*\*(.*)$/);
  if (s && !s[2].replace(/\s*\[[^\]]+\]/g, '').trim()) { out.short = s[1] + s[2]; i++; }
  // Sections.
  let current = 'why';
  const buf = { why: [], theyCan: [], youCan: [], steps: [], deadlines: [] };
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    const h = line.match(/^#{1,4}\s*(.+?)\s*:?\s*$/);
    if (h && SECTIONS[h[1].toLowerCase()]) { current = SECTIONS[h[1].toLowerCase()]; continue; }
    if (line) buf[current].push(line);
  }
  out.why = buf.why.join('\n').trim();
  for (const k of ['theyCan', 'youCan', 'steps', 'deadlines']) {
    out[k] = buf[k].map((l) => l.replace(/^([-*•]|\d+[.)])\s+/, '').trim()).filter(Boolean);
  }
  out.answer = kept.join('\n').trim();
  return out;
}
