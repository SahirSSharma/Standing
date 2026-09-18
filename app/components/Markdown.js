"use client";
import CiteChip from "./CiteChip";

// Just enough markdown for a policy answer: paragraphs, ### headings, - / 1. lists, **bold**, and
// a bare citation id in the text (e.g. "160-2#5.A", with or without brackets) becomes a clickable
// pill. No HTML is ever injected.

const MARKER = /\s*\[?\b\d{3}-\d+#[A-Za-z0-9.\-]+\]?/g;

// If the answer opens with a bold line, that line is the short answer; the rest is the explanation.
export function splitLead(text) {
  const lines = text.split("\n");
  const i = lines.findIndex((l) => l.trim());
  if (i === -1) return { lead: "", rest: "" };
  const m = lines[i].trim().match(/^\*\*(.+?)\*\*(.*)$/);
  if (!m || m[2].replace(MARKER, "").trim()) return { lead: "", rest: text };
  return { lead: m[1] + m[2], rest: lines.slice(i + 1).join("\n") };
}

// Plain text for the clipboard: no markers, no bold, no list bullets beyond a dash.
export function plainText(text) {
  return text.replace(MARKER, "").replace(/\*\*/g, "").replace(/^#+\s*/gm, "").trim();
}

export default function Markdown({ text, citations, activeId, onSelect, onHover, inline: inlineOnly }) {
  const byId = new Map(citations.map((c) => [c.id, c]));
  // Longest ids first so "160-2#5.A" cannot shadow "160-2#5.A.1".
  const escaped = [...byId.keys()]
    .sort((a, b) => b.length - a.length)
    .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const inlineRe = new RegExp(
    `(\\*\\*[^*]+\\*\\*${escaped.length ? `|\\[?(?:${escaped.join("|")})\\]?` : ""})`,
  );

  function inline(str) {
    return str.split(inlineRe).map((part, i) => {
      if (!part) return null;
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      const c = byId.get(part.replace(/^\[|\]$/g, ""));
      if (c) {
        return (
          <span key={i} className="mx-0.5 align-middle">
            <CiteChip citation={c} active={c.id === activeId} onSelect={onSelect} onHover={onHover} />
          </span>
        );
      }
      return part;
    });
  }

  if (inlineOnly) return inline(text.replace(/\s+/g, " ").trim());

  // Group consecutive lines: list items into a list, prose into a paragraph; blank line ends a group.
  const blocks = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const type = !line
      ? null
      : /^#+\s/.test(line) ? "h" : /^[-*] /.test(line) ? "ul" : /^\d+\. /.test(line) ? "ol" : "p";
    const last = blocks[blocks.length - 1];
    if (!type) blocks.push(null);
    else if (type !== "h" && last && last.type === type) last.lines.push(line);
    else blocks.push({ type, lines: [line] });
  }

  return blocks
    .filter(Boolean)
    .map((b, i) => {
      if (b.type === "h") {
        return <h3 key={i} className="pt-2 text-lg font-semibold">{inline(b.lines[0].replace(/^#+\s*/, ""))}</h3>;
      }
      if (b.type === "p") {
        return <p key={i}>{inline(b.lines.join(" "))}</p>;
      }
      const items = b.lines.map((l, j) => <li key={j}>{inline(l.replace(/^([-*]|\d+\.) /, ""))}</li>);
      return b.type === "ul" ? (
        <ul key={i} className="list-disc space-y-2.5 pl-5 marker:text-gold-deep">{items}</ul>
      ) : (
        <ol key={i} className="list-decimal space-y-2.5 pl-5 marker:font-semibold marker:text-gold-deep">{items}</ol>
      );
    });
}
