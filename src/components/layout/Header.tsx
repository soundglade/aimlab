import Link from "next/link";
import { Sparkles, Wrench, Users, MessageSquare } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between w-full max-w-4xl px-4 py-6">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-medium">AIM Lab</span>
      </Link>

      <nav className="flex items-center gap-4 mt-[1px] md:gap-5">
        <Link
          href="/#experiments"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-1"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden md:block">Experiments</span>
        </Link>
        <Link
          href="/#tools"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-1"
        >
          <Wrench className="w-4 h-4" />
          <span className="hidden md:block">Tools</span>
        </Link>
        <Link
          href="/#community"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-1"
        >
          <Users className="w-4 h-4" />
          <span className="hidden md:block">Community</span>
        </Link>
        <Link
          href="/feedback"
          className="flex items-center px-3 py-1 text-sm font-medium bg-accent text-accent-foreground hover:text-primary-foreground hover:bg-primary rounded-md transition-colors gap-1"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden md:block">Feedback</span>
        </Link>
      </nav>
    </header>
  );
}
