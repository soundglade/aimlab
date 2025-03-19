import Link from "next/link";
import { Lightbulb, Wrench, Users, MessageSquare } from "lucide-react";

export function Header() {
  return (
    <header className="w-full max-w-4xl px-4 py-6 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-medium">AIM Lab</span>
      </Link>

      <nav className="flex items-center gap-2 mt-[1px] md:gap-5">
        <Link
          href="/#experiments"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Lightbulb className="h-4 w-4" />
          <span>Experiments</span>
        </Link>
        <Link
          href="/#tools"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Wrench className="h-4 w-4" />
          <span>Tools</span>
        </Link>
        <Link
          href="/#community"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Users className="h-4 w-4" />
          <span>Community</span>
        </Link>
        <Link
          href="/feedback"
          className="text-sm bg-accent text-accent-foreground hover:text-primary-foreground hover:bg-primary px-3 py-1 rounded-md transition-colors font-medium flex items-center gap-1"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Feedback</span>
        </Link>
      </nav>
    </header>
  );
}
