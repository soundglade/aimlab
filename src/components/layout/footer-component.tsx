import Link from "next/link";
import { Github } from "lucide-react";
import { RedditIcon } from "../icons";

export function Footer() {
  return (
    <footer className="mt-0 w-full px-3 py-6 md:mt-6">
      <div className="mx-auto flex max-w-3xl flex-row items-center justify-around px-4">
        <div className="flex w-1/3 flex-col items-start">
          <Link href="/" className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium">AIM Lab</span>
          </Link>
          <p className="text-muted-foreground text-xs">
            <span className="hidden md:inline">The AI Meditation</span>{" "}
            Playground
          </p>
        </div>

        <div className="w-1/3 text-center">
          <p className="text-muted-foreground mb-1 text-xs">Sponsored By</p>
          <a className="text-sm hover:underline" href="https://soundglade.com">
            SoundGlade
          </a>
        </div>

        <div className="w-1/3 text-right">
          <ul>
            <li>
              <Link
                href="https://www.reddit.com/r/AIMeditationLab/"
                className="text-muted-foreground hover:text-foreground pr-0.5 text-xs md:pr-1"
              >
                <RedditIcon className="mr-2 inline-block h-4 w-4" />
                <span className="hidden md:inline">r/AIMeditationLab</span>
                <span className="md:hidden">Reddit</span>
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/soundglade/aimlab"
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                <Github className="mr-2 inline-block h-4 w-4" />
                GitHub <span className="hidden md:inline">Repository</span>
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
