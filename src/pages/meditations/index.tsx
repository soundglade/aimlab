import Link from "next/link";
import { Layout } from "@/components/layout/layout-component";
import { Meditation } from "@/lib/latest-meditations";
import { getLatestMeditations } from "@/lib/latest-meditations";
import { GetServerSideProps } from "next";

interface CommunityIndexProps {
  latestMeditations: Meditation[];
}

export default function CommunityIndex({
  latestMeditations,
}: CommunityIndexProps) {
  return (
    <Layout>
      <header className="mb-10 mt-8 text-center md:mt-14">
        <h1 className="mb-3 text-3xl tracking-tight">Meditations</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Explore all meditations created and shared by the community
        </p>
      </header>

      <div className="mb-10 space-y-6 px-2">
        {latestMeditations.length > 0 ? (
          <ul className="space-y-3">
            {latestMeditations.map((meditation) => (
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
