import Link from "next/link";

// Changelog visibility toggle
const DISPLAY_CHANGELOG = false;

export function Header() {
  return (
    <header className="w-full max-w-4xl px-4 py-6 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-medium">AIM Lab</span>
      </Link>

      <nav className="flex items-center gap-2 mt-[1px] md:gap-5">
        <Link
          href="/#experiments"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Experiments
        </Link>
        <Link
          href="/#tools"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Tools
        </Link>
        <Link
          href="/#community"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Community
        </Link>
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
        >
          Blog
        </Link>
        <Link
          href="/feedback"
          className="text-sm bg-accent text-accent-foreground hover:text-primary-foreground hover:bg-primary px-3 py-1 rounded-md transition-colors font-medium"
        >
          Feedback
        </Link>
        {DISPLAY_CHANGELOG && (
          <Link
            href="/changelog"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Changelog
          </Link>
        )}
      </nav>
    </header>
  );
}
