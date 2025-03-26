import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-10 w-full py-6">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium">AIM Lab</span>
          </Link>
          <p className="text-muted-foreground text-xs">
            The AI Meditation Playground
          </p>
        </div>

        <div className="text-center md:text-right">
          <p className="text-muted-foreground mb-1 text-xs">Sponsored By</p>
          <div className="flex items-center text-sm">
            <a className="hover:underline" href="https://soundglade.com">
              SoundGlade
            </a>
          </div>
        </div>

        <div className="hidden md:block">
          <ul className="space-y-1">
            <li>
              <Link
                href="https://bsky.app/profile/soundglade.bsky.social"
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs transition-colors"
              >
                <BlueSkyIcon className="h-4 w-4" />
                SoundGlade on Bluesky
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/soundglade/aimlab"
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub Repository
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-5xl justify-between px-4 pt-4">
        <p className="text-muted-foreground text-xs"></p>
      </div>
    </footer>
  );
}

const BlueSkyIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 360 320" fill="currentColor" className={className}>
    <path d="M180 142c-16.3-31.7-60.7-90.8-102-120C38.5-5.9 23.4-1 13.5 3.4 2.1 8.6 0 26.2 0 36.5c0 10.4 5.7 84.8 9.4 97.2 12.2 41 55.7 55 95.7 50.5-58.7 8.6-110.8 30-42.4 106.1 75.1 77.9 103-16.7 117.3-64.6 14.3 48 30.8 139 116 64.6 64-64.6 17.6-97.5-41.1-106.1 40 4.4 83.5-9.5 95.7-50.5 3.7-12.4 9.4-86.8 9.4-97.2 0-10.3-2-27.9-13.5-33C336.5-1 321.5-6 282 22c-41.3 29.2-85.7 88.3-102 120Z"></path>
  </svg>
);
