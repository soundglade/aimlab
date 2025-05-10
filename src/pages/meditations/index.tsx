import Link from "next/link";
import { Layout } from "@/components/layout/layout-component";
import { Meditation } from "@/components/types";
import { getLatestMeditations } from "@/lib/latest-meditations";
import { GetServerSideProps } from "next";
import { MarkdownDescription } from "@/components/ui/markdown-description";

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
      <header className="mb-10 mt-8 text-center md:mt-14">
        <h1 className="mb-3 text-3xl tracking-tight">Meditations</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Explore all meditations created and shared by the community
        </p>
      </header>

      {featured.length > 0 && (
        <section className="mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-4 text-xl font-semibold tracking-tight text-center">
              Featured Meditations
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((meditation) => (
                <li
                  key={meditation.link}
                  className="bg-background border rounded-lg p-4 flex flex-col h-full"
                >
                  <Link href={meditation.link} className="hover:underline">
                    <h3 className="text-lg font-medium mb-2 line-clamp-2">
                      {meditation.title}
                    </h3>
                  </Link>
                  <span className="text-muted-foreground text-xs mb-2">
                    {meditation.timeAgo}
                  </span>
                  {meditation.coverImageUrl && (
                    <img
                      src={meditation.coverImageUrl}
                      alt="Cover"
                      className="rounded mb-3 mx-auto block max-h-[200px] max-w-full object-cover"
                      style={{ maxWidth: 200, maxHeight: 200 }}
                    />
                  )}
                  {meditation.description && (
                    <div className="mt-1">
                      <MarkdownDescription content={meditation.description} />
                    </div>
                  )}
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
                  className="hover:bg-accent bg-background flex justify-between gap-6 rounded-lg border px-3 py-2 transition-colors"
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
