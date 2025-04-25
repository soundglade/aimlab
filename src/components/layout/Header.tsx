import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  Sun,
  Moon,
  ScrollText,
  Megaphone,
} from "lucide-react";
import { useTheme } from "next-themes";
import { timeAgo } from "@/lib/time";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Header({ showChangelog }: { showChangelog: boolean }) {
  const { theme, setTheme } = useTheme();

  const latest = changelog[0];

  return (
    <header className="relative flex h-16 w-full max-w-4xl items-center justify-between px-4 py-3 md:py-4">
      <nav className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-medium">/ AIM Lab</span>
        </Link>
      </nav>

      {showChangelog && (
        <div className="absolute left-1/2 mt-1 hidden -translate-x-1/2 flex-col items-center opacity-70 hover:opacity-100 md:flex">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hover:bg-accent group h-auto w-full justify-start px-3 py-1 transition-colors"
              >
                <div className="flex w-full items-center justify-between gap-2 overflow-hidden text-left">
                  <span className="text-muted-foreground flex items-center gap-1.5 truncate text-sm font-normal">
                    <Megaphone className="mr-1 h-3.5 w-3.5" />
                    {latest.text}
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap text-xs">
                    {timeAgo(latest.date)}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              id="changelog-card"
              className="mt-2 w-[370px] max-w-md space-y-2 rounded-xl border p-3"
              align="center"
            >
              <ul className="space-y-2">
                {changelog.slice(1).map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0"
                  >
                    <span className="truncate text-sm">{item.text}</span>
                    <span className="text-muted-foreground whitespace-nowrap text-xs">
                      {timeAgo(item.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      )}

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

const changelog = [
  {
    text: "Instant player published",
    date: "2025-04-25T16:00:00Z",
  },
  {
    text: "New domain: meditationlab.ai",
    date: "2025-04-25T13:00:00Z",
  },
  {
    text: "Introduce newsletter",
    date: "2025-04-25T10:00:00Z",
  },
  {
    text: "Add playback buttons for instant reader",
    date: "2025-04-22T17:00:00Z",
  },
  {
    text: "First draft of instant reader",
    date: "2025-04-21T12:00:00Z",
  },
  {
    text: "Upload meditation cover image",
    date: "2025-04-11T12:00:00Z",
  },
  {
    text: "Two new voices available",
    date: "2025-04-11T09:00:00Z",
  },
  {
    text: "Reddit posts displayed on landing page",
    date: "2025-04-08T12:00:00Z",
  },
  {
    text: "Ending bell added to meditation player",
    date: "2025-04-07T12:00:00Z",
  },
];
