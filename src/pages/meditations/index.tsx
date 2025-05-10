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
  const featured = latestMeditations.filter(
    (m) => m.description || m.coverImageUrl
  );
  const regular = latestMeditations.filter(
    (m) => !m.description && !m.coverImageUrl
  );

  return (
    <Layout>
      <header className="mb-4 mt-8 text-center sm:mb-10 md:mt-14">
        <h1 className="mb-3 text-3xl tracking-tight">Meditations</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Explore all meditations created and shared by the community
        </p>
      </header>

      {featured.length > 0 && (
        <section className="mb-3 sm:mb-12">
          <div className="mx-auto max-w-4xl px-2">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-4">
              {featured.map((meditation) => (
                <li key={meditation.link}>
                  <Link
                    href={meditation.link}
                    className="hover:bg-accent bg-background group relative flex h-full max-h-64 flex-col overflow-hidden rounded-lg px-4 py-2 transition-colors"
                  >
                    <h3 className="mb-2 text-lg">{meditation.title}</h3>
                    <span className="text-muted-foreground mb-2 text-xs">
                      {meditation.timeAgo}
                    </span>
                    {meditation.coverImageUrl && (
                      <img
                        src={meditation.coverImageUrl}
                        alt="Cover"
                        className="mx-auto mb-3 block max-h-[200px] max-w-full rounded object-cover"
                        style={{ maxWidth: 200, maxHeight: 200 }}
                      />
                    )}
                    {meditation.description && (
                      <div className="text-muted-foreground mt-1 overflow-hidden text-sm">
                        {removeMarkdown(meditation.description).replace(
                          /\n{2,}/g,
                          "\n"
                        )}
                      </div>
                    )}
                    {/* Gradient always at the bottom of the card */}
                    <div className="from-background group-hover:from-accent pointer-events-none absolute left-0 top-[216px] h-10 w-full bg-gradient-to-t to-transparent transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="mb-10 space-y-6 px-2">
        {regular.length > 0 ? (
          <ul className="space-y-3">
            {regular.map((meditation) => (
              <li key={meditation.link}>
                <Link
                  href={meditation.link}
                  className="hover:bg-accent bg-background flex justify-between gap-6 rounded-lg px-3 py-2 transition-colors"
                >
                  <h2>{meditation.title}</h2>
                  <span className="text-muted-foreground whitespace-nowrap text-sm">
                    {meditation.timeAgo}
                  </span>
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
