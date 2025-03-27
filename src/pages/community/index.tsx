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
    <Layout variant="page">
      <header className="mb-20 text-center">
        <h1 className="mb-3 text-3xl font-medium tracking-tight md:text-4xl">
          Community Meditations
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Explore meditations shared by our community
        </p>
      </header>

      <div className="space-y-6">
        {latestMeditations.length > 0 ? (
          <ul className="space-y-4">
            {latestMeditations.map((meditation) => (
              <li
                key={meditation.link}
                className="hover:bg-muted/50 rounded-lg border p-4 transition-colors"
              >
                <Link href={meditation.link} className="block space-y-2">
                  <h2 className="text-lg font-medium">{meditation.title}</h2>
                  <p className="text-muted-foreground">
                    {meditation.description}
                  </p>
                  <div className="text-muted-foreground flex justify-between text-sm">
                    <span>{meditation.duration}</span>
                    <span>{meditation.timeAgo}</span>
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

export const getStaticProps: GetStaticProps = async () => {
  const latestMeditations = await getLatestMeditations(Infinity);
  return {
    props: {
      latestMeditations,
    },
  };
};
