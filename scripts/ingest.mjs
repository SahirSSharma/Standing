#!/usr/bin/env node
// Ingest UCSD PPM policy documents into data/docs.json + data/corpus.json (contracts: DESIGN.md).
// Usage: node scripts/ingest.mjs [--all] [PPM# ...]     default: the 7 "Student Matters" docs
// A document getdoc.php cannot serve (160-9: "2 published documents with the same documentID") is
// taken from the Internet Archive's newest capture of UCSD's legacy PPM page instead — same Word
// export, different chrome — and its docs.json url is that capture, so the citation link still works.
import { mkdir, writeFile } from 'node:fs/promises';

const INDEX_URL = 'https://adminrecords.ucsd.edu/ppm/docs/toc160.html';
const docUrl = (id) => `https://secure4.compliancebridge.com/ucsd/public/getdoc.php?file=${id}`;
const legacyUrl = (id) => `https://adminrecords.ucsd.edu/ppm/docs/${id}.html`;
// `2` = newest capture (the archive redirects to its timestamp), `id_` = the page's original bytes.
const archiveUrl = (url) => `https://web.archive.org/web/2id_/${url}`;
const DEFAULT_DOCS = ['160-2', '160-3', '160-6', '160-8', '160-9', '160-10', '160-11'];
const UA = 'Standing/0.1 (LexHack 2026 student project; sequential polite fetches)';
const MAX_CHUNK = 1800;
const OUT_DIR = new URL('../data/', import.meta.url);

// ---------- fetching: sequential, 300 ms apart, 30 s timeout, loud on non-200 ----------
let first = true;
async function get(url) {
  if (!first) await new Promise((r) => setTimeout(r, 300));
  first = false;
  const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res; // callers read .text(); res.url is the final URL after redirects
}

// ---------- html → text ----------
const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ndash: '–', mdash: '—',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', bull: '•' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] !== '#') return ENTITIES[e.toLowerCase()] ?? m;
  return String.fromCodePoint(/^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
});
// Inline tags vanish (Word splits words across spans); block tags become whitespace.
const text = (html) => decode(html.replace(/<\/?(?:span|b|i|u|s|a|strong|em|sup|sub|font)\b[^>]*>/gi, '')
  .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const toIso = (mdy) => (mdy ? mdy.replace(/^(\d\d)\/(\d\d)\/(\d{4})$/, '$3-$1-$2') : null);

// ---------- index: one <tr> per policy: title link, PPM #, category, effective date ----------
function parseIndex(html) {
  const row = /<tr>\s*<td[^>]*>\s*<a[^>]*href=['"][^'"]*getdoc\.php\?file=([^'"&]+)['"][^>]*>(.*?)<\/a>\s*<\/td>\s*<td[^>]*>.*?<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>/gs;
  const rows = [...html.matchAll(row)].map((m) => ({ id: m[1], title: text(m[2]), category: text(m[3]), date: toIso(text(m[4])) }));
  if (!rows.length) throw new Error('index: no rows parsed — page layout changed?');
  return rows;
}

// ---------- one document: metadata header + Word-exported body, in either host's page layout ----------
function metadata(meta) { // "Effective: 10/05/2017 Supersedes: 11/13/2014 ... Issuing Office: Registrars Office"
  const grab = (re) => meta.match(re)?.[1] ?? null;
  return {
    effectiveDate: toIso(grab(/Effective:\s*(\d\d\/\d\d\/\d{4})/)),
    supersedes: toIso(grab(/Supersedes\s*:\s*(\d\d\/\d\d\/\d{4})/)),
    issuingOffice: grab(/Issuing Office:\s*(.*)$/),
  };
}
const bodyLines = (body) => body
  .replace(/<(style|title)[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<!--[\s\S]*?-->/g, '')
  .split(/(?=<(?:p|br|div|td|tr|li|h\d)\b)/i)
  .filter((s) => !/^<p[^>]*MsoToc/i.test(s)) // Word table of contents — not policy text
  .map(text).filter(Boolean);

// compliancebridge: a 60% header cell (metadata <hr> title) and a 60% body cell before a 20% cell.
function parseDoc(html) {
  const cells = html.split("<td width='60%'>");
  if (cells.length < 3) { // bare skeleton with an optional server message after the stylesheet
    throw new Error(text(html.split('</style>').pop()) || 'empty response (no such document)');
  }
  const [meta, title] = cells[1].split('<hr>').map(text);
  return { title, ...metadata(meta), lines: bodyLines(cells[2].slice(0, cells[2].lastIndexOf("<td width='20%'>"))) };
}

// legacy adminrecords page: the same metadata lines above a "[pdf format]" div, then
// <div id="ppm_policy"><h1 class="ppm_title">TITLE</h1> + the Word export.
function parseLegacyDoc(html) {
  const [head, policy] = html.split('<div id="ppm_policy">');
  if (!policy) throw new Error('not a PPM document page (no ppm_policy div)');
  // title left empty: the page's <h1> is all caps, so the caller uses the index row's cased title
  return { title: '', ...metadata(text(head.split('<div id="ppm_pdf">')[0])), lines: bodyLines(policy.slice(policy.indexOf('</h1>') + 5)) };
}

// ---------- clause structure ----------
// A line is a HEADING when its text (after any label) is all caps: "5. INSPECTION AND REVIEW…", "SCOPE",
// "B. INTERPRETATION OF REGULATIONS". Unlabeled headings (SCOPE, POLICY STATEMENT, EXHIBIT A) open a new
// top-level scope; labeled headings and clauses nest by label sequence: a label continues the innermost open
// level whose next value it is, otherwise a first value (1, A, a, I, i) opens a deeper level.
const isCaps = (s) => (s.match(/[A-Z]/g) ?? []).length >= 3 && !/[a-z]/.test(s);
const slug = (s) => s.replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
const ROMAN = { i: 1, v: 5, x: 10 };
const romanValue = (s) => [...s.toLowerCase()].reduce((n, c, k, a) => n + (ROMAN[c] < ROMAN[a[k + 1]] ? -ROMAN[c] : ROMAN[c]), 0);

// "A." "1." "a." "(1)" "iv." "E ." and a bare "4" (period missing) → {label, kinds, rest, bare} | null.
function parseLabel(line) {
  const m = line.match(/^(\()?([A-Za-z]|[IVXivx]{2,5}|\d{1,3})(\))?(?:\s?([.)]))?(?:\s+(.*))?$/);
  if (!m) return null;
  const [, open, tok, close, punct, rest = ''] = m;
  const style = open || close || punct === ')' ? 'paren' : punct ? 'dot' : 'bare';
  if (style === 'bare' && !/^\d/.test(tok)) return null;
  const kinds = [];
  if (/^\d/.test(tok)) kinds.push({ kind: 'num' + style, value: +tok });
  else if (tok.length === 1) kinds.push({ kind: (tok < 'a' ? 'upper' : 'lower') + style, value: tok.toUpperCase().charCodeAt(0) - 64 });
  if (/^[ivx]+$/i.test(tok)) kinds.push({ kind: (tok < 'a' ? 'ROMAN' : 'roman') + style, value: romanValue(tok) });
  return { label: tok, kinds, rest, bare: style === 'bare' };
}

// Decide where a labeled line goes; mutates the stack. Headings only continue heading levels and vice versa.
function place(stack, lab, heading) {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].heading !== heading) continue;
    const k = lab.kinds.find((k) => k.kind === stack[i].kind && k.value === stack[i].value + 1);
    if (k) { stack.length = i; return k; }
  }
  if (lab.bare) return null; // "80 Staff Personnel Records" is prose, not clause 80
  return lab.kinds.find((k) => k.value === 1) ?? (heading ? lab.kinds[0] : null);
}

function chunkDoc(doc) {
  const nodes = [];   // every heading / clause, in order; text = own paragraph + unlabeled continuations
  const stack = [];   // open label levels: {kind, value, label, heading, path, headingText, section}
  let scope = null;   // current unlabeled top-level heading {slug, text}
  const scopes = new Set();
  let node = null;    // node currently receiving continuation text
  let dropped = 0;    // unlabeled lines before any heading (inner <title>, stamps) — not citable
  const path = () => [scope?.slug, ...stack.map((l) => l.label)].filter(Boolean).join('.');
  const context = () => { // nearest enclosing heading
    const h = stack.findLast((l) => l.heading);
    return h ? { section: h.path, heading: h.headingText } : { section: scope?.slug ?? '', heading: scope?.text ?? '' };
  };
  for (const line of doc.lines) {
    if (line.toUpperCase() === doc.title.toUpperCase()) continue; // running title
    const lab = parseLabel(line);
    const heading = isCaps(lab ? lab.rest : line);
    const k = lab && place(stack, lab, heading);
    if (!k) {
      if (heading) {
        if (scopes.has(slug(line))) continue; // running page header (160-2 repeats "EXHIBIT A" on every exhibit page)
        scope = { slug: slug(line), text: line };
        scopes.add(scope.slug);
        stack.length = 0;
        node = { clause: scope.slug, section: scope.slug, heading: line, text: '' };
        nodes.push(node);
      } else if (node) node.text += ' ' + line;
      else dropped++;
      continue;
    }
    stack.push({ ...k, label: lab.label, heading });
    const level = stack.at(-1);
    level.path = path();
    if (heading) level.headingText = lab.rest;
    node = { clause: level.path, ...context(), text: heading ? '' : lab.rest };
    nodes.push(node);
  }
  return { nodes: nodes.map((n) => ({ ...n, text: n.text.trim() })).filter((n) => n.text), dropped };
}

// Split a long clause on sentence boundaries into parts ≤ MAX_CHUNK chars (one over-long sentence stays whole).
function splitText(t) {
  if (t.length <= MAX_CHUNK) return [t];
  const parts = [];
  let cur = '';
  for (const s of t.split(/(?<=[.;:?!])\s+(?=[A-Z(“"\d])/)) {
    if (cur && cur.length + 1 + s.length > MAX_CHUNK) { parts.push(cur); cur = s; }
    else cur = cur ? `${cur} ${s}` : s;
  }
  return [...parts, cur];
}

// ---------- main ----------
const args = process.argv.slice(2);
const index = parseIndex(await (await get(INDEX_URL)).text());
const ids = args.includes('--all') ? index.map((r) => r.id) : args.filter((a) => !a.startsWith('--'));
const wanted = ids.length ? ids : DEFAULT_DOCS;
const unknown = wanted.filter((id) => !index.some((r) => r.id === id));
if (unknown.length) throw new Error(`not in the PPM index (${index.length} docs): ${unknown.join(', ')}`);

const docs = [], corpus = [], failed = [];
const fetchedAt = new Date().toISOString().slice(0, 10);
for (const id of wanted) {
  const row = index.find((r) => r.id === id);
  let doc, url = docUrl(id);
  try { doc = parseDoc(await (await get(url)).text()); }
  catch (e) {
    console.error(`WARN  ${id} (${row.title}): ${e.message} — falling back to the archived legacy page`);
    try {
      const res = await get(archiveUrl(legacyUrl(id)));
      doc = parseLegacyDoc(await res.text());
      url = res.url.replace('id_/', '/'); // the capture as a viewable page, pinned to its timestamp
      console.error(`WARN  ${id}: ingested from ${url}`);
    } catch (e2) { console.error(`ERROR ${id} (${row.title}): ${e2.message}`); failed.push(id); continue; }
  }
  const { nodes, dropped } = chunkDoc(doc);
  const title = doc.title || row.title;
  docs.push({ docId: id, title, effectiveDate: doc.effectiveDate ?? row.date, supersedes: doc.supersedes,
    issuingOffice: doc.issuingOffice, url, fetchedAt, chars: doc.lines.join('\n').length });
  const clauses = new Set(nodes.map((n) => n.clause));
  const before = corpus.length;
  for (const n of nodes) {
    let parts = splitText(n.text);
    // The split suffix (#5.A.1) could collide with a real sub-clause 5.A.1 — keep such a clause whole instead.
    if (parts.length > 1 && parts.some((_, i) => clauses.has(`${n.clause}.${i + 1}`))) parts = [n.text];
    parts.forEach((t, i) => corpus.push({ id: `${id}#${n.clause}${parts.length > 1 ? `.${i + 1}` : ''}`, docId: id,
      docTitle: title, section: n.section, heading: n.heading, clause: n.clause, text: t,
      effectiveDate: doc.effectiveDate ?? row.date, url }));
  }
  console.log(`${id.padEnd(7)} ${String(corpus.length - before).padStart(4)} chunks  ${title}${dropped ? `  (dropped ${dropped} uncitable lines)` : ''}`);
}

const seen = new Set();
for (const c of corpus) {
  if (seen.has(c.id)) throw new Error(`duplicate chunk id ${c.id} (a split part collides with a real sub-clause)`);
  seen.add(c.id);
}
await mkdir(OUT_DIR, { recursive: true });
await writeFile(new URL('docs.json', OUT_DIR), JSON.stringify(docs, null, 2) + '\n');
await writeFile(new URL('corpus.json', OUT_DIR), JSON.stringify(corpus, null, 2) + '\n');

const sizes = corpus.map((c) => c.text.length).sort((a, b) => a - b);
console.log(`\n${docs.length} docs, ${corpus.length} chunks → data/docs.json, data/corpus.json`);
console.log(`chunk chars min/median/max: ${sizes[0]}/${sizes[sizes.length >> 1]}/${sizes.at(-1)}`);
for (const i of [0, corpus.length >> 1, corpus.length - 1]) console.log(`  sample ${corpus[i].id}  [${corpus[i].heading}]`);
if (failed.length) { console.error(`\n${failed.length} of ${wanted.length} docs could not be ingested: ${failed.join(', ')}`); process.exitCode = 1; }
