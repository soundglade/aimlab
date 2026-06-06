/**
 * Single source of truth for the "project ended" deactivation flag.
 *
 * Flip everything with one boolean: set `DEACTIVATE_WEBSITE=true` in the
 * environment. When deactivated:
 *  - paid generation endpoints are blocked (see src/middleware.ts)
 *  - a sitewide banner points visitors to Open Meadow + the GitHub repo
 *  - the landing page stops sourcing Reddit posts
 *  - the /instant create form is disabled (saved meditations still work)
 *
 * Client components read the public runtime projection from /api/public-config
 * so the flag can be changed without rebuilding the client bundle.
 */

export const OPEN_MEADOW_URL = "https://openmeadow.ai/?from=aimlab";
export const GITHUB_REPO_URL = "https://github.com/soundglade/aimlab";

/** Server-side check (API routes, getServerSideProps, middleware). */
export function isWebsiteDeactivated(): boolean {
  return process.env.DEACTIVATE_WEBSITE === "true";
}
