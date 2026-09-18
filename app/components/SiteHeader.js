import Link from "next/link";
import Pip from "./Pip";

export const container = "mx-auto w-full max-w-[87.5rem] px-5 sm:px-8";

// Pip's face + "Standing" home link on the left, one link on the right: "Ask a question" on the
// policy library pages (default), "What Standing knows" on the home page.
export default function SiteHeader({ link = { href: "/", label: "Ask a question" } }) {
  return (
    <header>
      <div className={`${container} flex items-center justify-between py-5`}>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2.5 rounded-lg text-lg font-semibold tracking-tight"
        >
          <Pip pose="face" className="size-7" />
          Standing
        </Link>
        <Link
          href={link.href}
          className="inline-flex min-h-11 items-center rounded-lg text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          {link.label}
        </Link>
      </div>
    </header>
  );
}
