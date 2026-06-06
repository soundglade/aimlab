import {
  OPEN_MEADOW_URL,
  GITHUB_REPO_URL,
} from "@/lib/deactivation";
import { useWebsiteDeactivation } from "@/hooks/use-website-deactivation";

/**
 * Thin sitewide banner shown when DEACTIVATE_WEBSITE is on. Tells visitors the
 * project has ended and points them to Open Meadow and the open-source repo.
 */
export function DeactivationBanner() {
  const { deactivated } = useWebsiteDeactivation();

  if (!deactivated) return null;

  return (
    <div className="w-full bg-primary/90 px-4 py-2 text-center text-sm text-primary-foreground">
      AIM Lab has ended, but the archive lives on. Continue your practice on{" "}
      <a
        href={OPEN_MEADOW_URL}
        className="font-medium underline underline-offset-2"
      >
        Open Meadow
      </a>{" "}
      or{" "}
      <a
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium underline underline-offset-2"
      >
        host it yourself
      </a>
      .
    </div>
  );
}
