import { Icon } from "./Icons";
import { container } from "./SiteHeader";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div
        className={`${container} flex flex-col gap-3 py-7 text-sm text-muted lg:flex-row lg:items-baseline lg:justify-between lg:gap-8`}
      >
        <p className="max-w-xl">Not legal advice. Every answer quotes official UCSD policy — always read the clause.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a
            href="https://github.com/SahirSSharma/Standing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1 rounded font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
          >
            Open source on GitHub
            <Icon name="external" className="size-3.5" />
          </a>
          <p className="inline-flex min-h-11 items-center">Built by a UCSD student for LexHack 2026</p>
        </div>
      </div>
    </footer>
  );
}
