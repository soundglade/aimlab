import Link from "next/link";
import { Sparkles, MessageSquare, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

import { Changelog } from "@/components/layout/changelog";

export function Header({ showChangelog }: { showChangelog: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="relative flex h-16 w-full max-w-4xl items-center justify-between px-4 py-3 md:py-4">
      <nav className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-medium">/ AIM Lab</span>
        </Link>
      </nav>

      <Changelog show={showChangelog} />

      <nav className="mt-[1px] flex items-center gap-4 md:gap-5">
        <Link
          href="/instant"
          className="text-muted-foreground hover:text-foreground md:hover:bg-accent -mx-2 -mr-3 flex items-center rounded-md px-2 py-1 text-sm transition-colors md:-mr-1"
        >
          <Sparkles className="h-4 w-4" />
        </Link>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground md:hover:bg-accent -mx-1 flex items-center rounded-md px-2 py-1 text-sm transition-colors md:-mx-3"
        >
          <Sun className="hidden h-4 w-4 dark:block" />
          <Moon className="block h-4 w-4 dark:hidden" />
        </button>
        <Link
          href="/feedback"
          aria-label="Feedback"
          className="bg-accent text-accent-foreground hover:text-primary-foreground hover:bg-primary flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
        </Link>
      </nav>
    </header>
  );
}
