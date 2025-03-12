import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-6 mt-auto">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">AIM Lab</span>
          </div>
          <p className="text-xs text-muted-foreground">
            The AI Meditation Petri Dish
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Open source project • 2023
          </p>
          <p className="text-xs text-muted-foreground">
            Hosted at github.com/soundglade/aimlab
          </p>
        </div>

        <div className="text-center md:text-right">
          <p className="text-sm mb-2">Sponsored By</p>
          <div className="flex items-center gap-4">
            <Link
              href="https://soundglade.com"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-xs">
                SS
              </div>
              <span className="text-sm">SoundGlade</span>
            </Link>
          </div>
        </div>

        <div className="hidden md:block">
          <p className="text-sm mb-2">Connect With Us</p>
          <ul className="space-y-1">
            <li>
              <Link
                href="https://bsky.app/profile/soundglade.bsky.social"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <div className="h-4 w-4 rounded-full bg-blue-400"></div>
                SoundGlade on Bluesky
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/soundglade"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                GitHub: SoundGlade
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/soundglade/aimlab"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                GitHub Repository
              </Link>
            </li>
            <li>
              <Link
                href="https://soundglade.com"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <div className="h-4 w-4 rounded bg-primary/10"></div>
                SoundGlade Website
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 mt-6 pt-4 flex justify-between">
        <p className="text-xs text-muted-foreground"></p>
      </div>
    </footer>
  );
}
