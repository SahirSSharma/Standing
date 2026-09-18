import Link from "next/link";

export const container = "mx-auto w-full max-w-[87.5rem] px-5 sm:px-8";

// Brand mark + "Standing" home link on the left, one link on the right: "Ask a question" on the
// policy library pages (default), "What Standing knows" on the home page.
export default function SiteHeader({ link = { href: "/", label: "Ask a question" } }) {
  return (
    <header>
      <div className={`${container} flex items-center justify-between py-5`}>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2.5 rounded-lg text-lg font-semibold tracking-tight"
        >
          <Mark />
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

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#14213d" />
      <path d="M9 10.5h14M9 16h14M9 21.5h7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="18.5" y="19.5" width="6.5" height="4" rx="1" fill="#e9b949" />
    </svg>
  );
}
