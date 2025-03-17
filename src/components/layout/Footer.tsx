import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-6 mt-10">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">AIM Lab</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            The AI Meditation Petri Dish
          </p>
        </div>

        <div className="text-center md:text-right">
          <p className="text-muted-foreground text-xs mb-1">Sponsored By</p>
          <div className="text-sm flex items-center">
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
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <div className="h-4 w-4 rounded-full bg-blue-400"></div>
                SoundGlade on Bluesky
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
          </ul>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 mt-6 pt-4 flex justify-between">
        <p className="text-xs text-muted-foreground"></p>
      </div>
    </footer>
  );
}
