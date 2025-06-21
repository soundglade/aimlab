import Link from "next/link";
import { Layout } from "@/components/layout/layout-component";
import { Meditation } from "@/components/types";
import { getLatestMeditations } from "@/lib/latest-meditations";
import { GetServerSideProps } from "next";
import removeMarkdown from "remove-markdown";

interface MeditationsIndexProps {
  latestMeditations: (Meditation & {
    timestamp?: number;
    timeAgo: string;
    link: string;
  })[];
}

export default function MeditationsIndex({
  latestMeditations,
}: MeditationsIndexProps) {
  return (
    <Layout>
      <header className="mb-4 mt-8 text-center sm:mb-10 md:mt-14">
        <h1 className="mb-3 text-3xl tracking-tight">Meditations</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Explore all meditations created and shared by the community
        </p>
      </header>

      <div className="mx-auto mb-10 max-w-3xl space-y-4 px-2">
        {latestMeditations.length > 0 ? (
          <ul className="space-y-4">
            {latestMeditations.map((meditation) => (
              <li key={meditation.link}>
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
                      <h2 className="mb-1 text-lg font-medium">
                        {meditation.title}
                      </h2>
                      {meditation.description && (
                        <div className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                          {removeMarkdown(meditation.description).replace(
                            /\n{2,}/g,
                            "\n"
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {meditation.timeAgo}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center">
            No meditations found
          </p>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const latestMeditations = await getLatestMeditations(Infinity);
  return {
    props: {
      latestMeditations,
    },
  };
};
