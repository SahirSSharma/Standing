"use client";
import CiteChip from "./CiteChip";

// Just enough markdown for a policy answer: paragraphs, - / 1. lists, **bold**, and
// a bare citation id in the text (e.g. "160-2#5.A") becomes a clickable chip.
// No HTML is ever injected.
export default function Markdown({ text, citations, activeId, onSelect }) {
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
            <CiteChip citation={c} active={c.id === activeId} onSelect={onSelect} />
          </span>
        );
      }
      return part;
    });
  }

  // Group consecutive lines: list items into a list, prose into a paragraph; blank line ends a group.
  const blocks = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const type = !line ? null : /^[-*] /.test(line) ? "ul" : /^\d+\. /.test(line) ? "ol" : "p";
    const last = blocks[blocks.length - 1];
    if (!type) blocks.push(null);
    else if (last && last.type === type) last.lines.push(line);
    else blocks.push({ type, lines: [line] });
  }

  return blocks
    .filter(Boolean)
    .map((b, i) => {
      if (b.type === "p") {
        return <p key={i}>{inline(b.lines.join(" ").replace(/^#+\s*/, ""))}</p>;
      }
      const items = b.lines.map((l, j) => <li key={j}>{inline(l.replace(/^([-*]|\d+\.) /, ""))}</li>);
      return b.type === "ul" ? (
        <ul key={i} className="list-disc space-y-1 pl-5">{items}</ul>
      ) : (
        <ol key={i} className="list-decimal space-y-1 pl-5">{items}</ol>
      );
    });
}
