import { GetStaticProps } from "next";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Meditation } from "@/lib/latest-meditations";
import { getLatestMeditations } from "@/lib/latest-meditations";

interface CommunityIndexProps {
  latestMeditations: Meditation[];
}

export default function CommunityIndex({
  latestMeditations,
}: CommunityIndexProps) {
  return (
    <Layout>
      <header className="mb-10 mt-10 text-center md:mt-14">
        <h1 className="mb-3 text-3xl font-medium tracking-tight md:text-4xl">
          Community Meditations
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Explore meditations shared by our community
        </p>
      </header>

      <div className="mb-10 space-y-6 px-2">
        {latestMeditations.length > 0 ? (
          <ul className="space-y-4">
            {latestMeditations.map((meditation) => (
              <li key={meditation.link}>
                <Link
                  href={meditation.link}
                  className="hover:bg-accent flex justify-between gap-6 rounded-lg border p-4 transition-colors"
                >
                  <h2 className="text-md">{meditation.title}</h2>
                  <span className="text-muted-foreground text-sm">
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

export const getStaticProps: GetStaticProps = async () => {
  const latestMeditations = await getLatestMeditations(Infinity);
  return {
    props: {
      latestMeditations,
    },
  };
};
