import Link from "next/link";
import { Layout } from "@/components/layout/layout-component";
import { Meditation } from "@/components/types";
import { getLatestMeditations } from "@/lib/latest-meditations";
import { GetServerSideProps } from "next";
import removeMarkdown from "remove-markdown";

// Hardcoded featured meditation IDs
const FEATURED_MEDITATION_IDS =
  process.env.FEATURED_MEDITATIONS?.split(",") || [];

interface MeditationsIndexProps {
  featuredMeditations: (Meditation & {
    timestamp?: number;
    timeAgo: string;
    link: string;
  })[];
  latestMeditations: (Meditation & {
    timestamp?: number;
    timeAgo: string;
    link: string;
  })[];
}

// Component to render meditation cards
function MeditationCard({
  meditation,
}: {
  meditation: Meditation & {
    timestamp?: number;
    timeAgo: string;
    link: string;
  };
}) {
  return (
    <Link
      href={meditation.link}
      className="hover:bg-accent bg-background flex gap-4 rounded-lg p-4 transition-colors"
    >
      {meditation.coverImageUrl && (
        <div className="flex-shrink-0">
          <img
            src={meditation.coverImageUrl}
            alt="Cover"
            className="h-20 w-20 rounded object-cover"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h2 className="mb-1 text-lg font-medium">{meditation.title}</h2>
          {meditation.description && (
            <div className="text-muted-foreground mb-2 line-clamp-2 text-sm">
              {removeMarkdown(meditation.description).replace(/\n{2,}/g, "\n")}
            </div>
          )}
        </div>
        <span className="text-muted-foreground text-xs">
          {meditation.timeAgo}
        </span>
      </div>
    </Link>
  );
}

export default function MeditationsIndex({
  featuredMeditations,
  latestMeditations,
}: MeditationsIndexProps) {
  return (
    <Layout>
      <header className="mb-10 mt-8 text-center sm:mb-12">
        <h1 className="mb-3 text-3xl tracking-tight">Public meditations</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Explore all meditations created and shared by the community
        </p>
      </header>

      <div className="mx-auto mb-10 w-full max-w-3xl space-y-8 px-4">
        {/* Featured Meditations Section */}
        {featuredMeditations.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl">Featured meditations</h2>
            <ul className="space-y-4">
              {featuredMeditations.map((meditation) => (
                <li key={meditation.link}>
                  <MeditationCard meditation={meditation} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* All Meditations Section */}
        <section>
          <h2 className="mb-4 text-xl">All meditations</h2>
          {latestMeditations.length > 0 ? (
            <ul className="space-y-4">
              {latestMeditations.map((meditation) => (
                <li key={meditation.link}>
                  <MeditationCard meditation={meditation} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center">
              No meditations found
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const allMeditations = await getLatestMeditations(Infinity);

  // Extract meditation ID from link (e.g., "/m/abc123" -> "abc123")
  const getMeditationId = (link: string) =>
    link.replace("/m/", "").replace("/r/", "");

  // Separate featured and regular meditations
  const featuredMeditations = allMeditations.filter((meditation) =>
    FEATURED_MEDITATION_IDS.includes(getMeditationId(meditation.link))
  );

  const latestMeditations = allMeditations;

  return {
    props: {
      featuredMeditations,
      latestMeditations,
    },
  };
};
