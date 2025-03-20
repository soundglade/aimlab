import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-6 mt-10">
      <div className="flex flex-col items-center justify-between max-w-4xl px-4 mx-auto gap-6 md:flex-row">
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="flex items-center mb-1 gap-2">
            <span className="text-sm font-medium">AIM Lab</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            The AI Meditation Playground
          </p>
        </div>

        <div className="text-center md:text-right">
          <p className="mb-1 text-xs text-muted-foreground">Sponsored By</p>
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
                className="flex items-center text-xs gap-2 transition-colors text-muted-foreground hover:text-foreground"
              >
                <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                SoundGlade on Bluesky
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/soundglade/aimlab"
                className="flex items-center text-xs gap-2 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Github className="w-4 h-4" />
                GitHub Repository
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex justify-between max-w-5xl px-4 pt-4 mx-auto mt-6">
        <p className="text-xs text-muted-foreground"></p>
      </div>
    </footer>
  );
}
