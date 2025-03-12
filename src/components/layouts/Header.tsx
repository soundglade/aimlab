import Link from "next/link";

// Changelog visibility toggle
const DISPLAY_CHANGELOG = false;

export function Header() {
  return (
    <header className="w-full max-w-2xl px-4 py-6 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-medium">AIM Lab</span>
      </Link>

      <nav className="flex items-center gap-6">
        <Link
          href="/about"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          About
        </Link>
        <Link
          href="/experiments"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Experiments
        </Link>
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Blog
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
