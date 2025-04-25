import Link from "next/link";
import { Sparkles, MessageSquare, Sun, Moon, ScrollText } from "lucide-react";
import { useTheme } from "next-themes";
import { RedditIcon } from "@/components/icons";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex w-full max-w-4xl items-center justify-between px-4 py-3 md:py-4">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-medium">AIM Lab</span>
      </Link>

      <nav className="mt-[1px] flex items-center gap-4 md:gap-5">
        <Link
          href="/meditations"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          <ScrollText className="h-4 w-4" />
          <span className="hidden md:block">Meditations</span>
        </Link>
        <Link
          href="/composer"
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
          className="bg-accent text-accent-foreground hover:text-primary-foreground hover:bg-primary flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden md:block">Feedback</span>
        </Link>
      </nav>
    </header>
  );
}
