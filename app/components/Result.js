"use client";
import { useState } from "react";
import { flushSync } from "react-dom";
import Deadlines from "./Deadlines";
import Diagram from "./Diagram";
import Draft, { CopyButton } from "./Draft";
import { Icon } from "./Icons";
import Markdown, { plainText, splitLead } from "./Markdown";
import Refused from "./Refused";
import Sources, { cardId } from "./Sources";
import Verdict from "./Verdict";

// The answer page's two columns from xl up: answer left, sources right. Ask.js puts the question
// form and the loading / error cards in the same left column so every block shares one left edge.
export const COLS = "xl:grid-cols-[minmax(0,62fr)_minmax(0,38fr)] xl:gap-10";

// Verdict and diagram first, text on demand: the short answer beside a mark that draws itself, the
// steps / rights as a diagram, deadlines with a date calculator, then "Why this answer" and the
// quoted sources behind expanders. Every section is optional, so a one-line answer still renders.
export default function Result({ data, docs, onAsk, onReset, question: questionProp }) {
  const { answer = "", citations = [], refused, verdict = null } = data;
  const s = data.sections ?? {};
  const steps = s.steps ?? [];
  const theyCan = s.theyCan ?? [];
  const youCan = s.youCan ?? [];
  const deadlines = s.deadlines ?? [];
  const { lead, rest } = splitLead(answer);
  const short = s.short || lead;
  // The explanation: the parsed "Why" section, or everything after the short line when the answer
  // arrived unstructured. Open by default when there is no diagram to look at instead.
  const why = data.sections ? (s.why ?? "") : rest;
  const hasDiagram = steps.length >= 1 || theyCan.length > 0 || youCan.length > 0;

  const [pinnedId, setPinnedId] = useState(null); // clicked chip: stays highlighted
  const [hoverId, setHoverId] = useState(null); // hovered / focused chip: highlighted while it lasts
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(!hasDiagram && deadlines.length === 0);

  // The product promise is "cited or refused". An empty or uncited answer is shown as a refusal.
  if (refused || !answer.trim() || citations.length === 0) {
    return (
      <div className={`grid grid-cols-[minmax(0,1fr)] ${COLS}`}>
        <Refused docs={docs} onAsk={onAsk} />
      </div>
    );
  }

  const question = questionProp ?? "";
  const activeId = hoverId ?? pinnedId;

  // A chip anywhere on the page opens the source cards, then scrolls to the one it points at —
  // flushSync so the card exists before the scroll.
  function select(id) {
    flushSync(() => {
      setPinnedId(id);
      setSourcesOpen(true);
    });
    document.getElementById(cardId(id))?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  const md = { citations, activeId, onSelect: select, onHover: setHoverId };

  // Entrance stagger runs down the page: verdict (0–1), diagram, deadlines, then the expanders.
  const diagramFirst = 2;
  const deadlinesFirst = Math.min(diagramFirst + steps.length + theyCan.length + youCan.length, 10);
  const whyIndex = Math.min(deadlinesFirst + deadlines.length, 11);

  // Below xl the blocks stack in DOM order — answer, sources, then the actions — so the quoted
  // clauses come before "Copy answer". From xl the sources column spans both rows on the right and
  // the actions sit directly under the answer.
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)] gap-8 ${COLS} xl:grid-rows-[auto_1fr]`}>
      <article className="space-y-6 xl:col-start-1 xl:row-start-1">
        <Verdict verdict={verdict} short={short} md={md} options={youCan.length} />
        <Diagram steps={steps} theyCan={theyCan} youCan={youCan} md={md} first={diagramFirst} />
        <Deadlines deadlines={deadlines} md={md} first={deadlinesFirst} />
        {why && (
          <section className="rise rounded-2xl border border-line bg-card shadow-card" style={{ "--i": whyIndex }}>
            <button
              type="button"
              onClick={() => setWhyOpen((o) => !o)}
              aria-expanded={whyOpen}
              aria-controls="why-panel"
              className="flex min-h-11 w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left text-lg font-semibold sm:px-6"
            >
              Why this answer
              <Icon name="chevron" className={`size-5 shrink-0 transition-transform ${whyOpen ? "rotate-180" : ""}`} />
            </button>
            {whyOpen && (
              <div id="why-panel" className="rise space-y-4 border-t border-line px-5 pb-5 pt-4 leading-[1.7] sm:px-6">
                <Markdown text={why} {...md} />
              </div>
            )}
          </section>
        )}
      </article>

      <aside className="xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:sticky xl:top-6 xl:self-start">
        <Sources
          citations={citations}
          activeId={activeId}
          open={sourcesOpen}
          onToggle={() => setSourcesOpen((o) => !o)}
          onSelect={select}
          onHover={setHoverId}
          first={whyIndex + 1}
        />
      </aside>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-5 xl:col-start-1 xl:row-start-2 xl:self-start">
        {question && <Draft question={question} answer={answer} citations={citations.map((c) => c.id)} />}
        <CopyButton text={plainText(answer)} label="Copy answer" copied="Copied" status="Answer copied to clipboard" />
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center rounded font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
        >
          Ask another question
        </button>
      </div>
    </div>
  );
}
