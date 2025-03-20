import Link from "next/link";
import {
  Sparkles,
  Wrench,
  Users,
  MessageSquare,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex items-center justify-between w-full max-w-4xl px-4 py-6">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-medium">AIM Lab</span>
      </Link>

      <nav className="flex items-center gap-4 mt-[1px] md:gap-5">
        <Link
          href="/#experiments"
          className="flex items-center gap-1 text-sm transition-colors text-muted-foreground hover:text-foreground"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden md:block">Experiments</span>
        </Link>
        <Link
          href="/#tools"
          className="flex items-center gap-1 text-sm transition-colors text-muted-foreground hover:text-foreground"
        >
          <Wrench className="w-4 h-4" />
          <span className="hidden md:block">Tools</span>
        </Link>
        <Link
          href="/#community"
          className="flex items-center gap-1 text-sm transition-colors text-muted-foreground hover:text-foreground"
        >
          <Users className="w-4 h-4" />
          <span className="hidden md:block">Community</span>
        </Link>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center px-2 py-1 -mx-1 text-sm transition-colors rounded-md md:-mx-3 text-muted-foreground hover:text-foreground md:hover:bg-accent"
        >
          <Sun className="hidden w-4 h-4 dark:block" />
          <Moon className="block w-4 h-4 dark:hidden" />
        </button>
        <Link
          href="/feedback"
          className="flex items-center gap-1 px-2 py-1 text-sm font-medium transition-colors rounded-md bg-accent text-accent-foreground hover:text-primary-foreground hover:bg-primary"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden md:block">Feedback</span>
        </Link>
      </nav>
    </header>
  );
}
