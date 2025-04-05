import { GetServerSideProps } from "next";
import Head from "next/head";
import { Card } from "@/components/ui/card";
import { MeditationPlayer } from "@/components/player/meditation-player";
import { Meditation } from "@/components/types";
import { Layout } from "@/components/layout/Layout";
import { fetchMeditationData } from "@/lib/fetch-meditation";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const meditationData = await fetchMeditationData(id);

  return {
    props: meditationData,
  };
};

export default function PublicMeditation({
  meditationId,
  metadata,
  audioUrl,
  error,
}: {
  meditationId: string;
  metadata: Meditation | null;
  audioUrl: string | null;
  error?: string;
}) {
  if (error || !metadata || !audioUrl) {
    return (
      <Layout>
        <Head>
          <title>Meditation Not Found | AIM Lab</title>
          <meta
            name="description"
            content="AIM Lab - The AI Meditation Playground"
          />
        </Head>
        <Card className="p-6">
          <h1 className="mb-6 text-center text-2xl">Meditation Not Found</h1>
          <p className="text-muted-foreground text-center">
            {error || "Failed to load meditation"}
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{metadata.title} | AIM Lab</title>
        <meta property="og:title" content={`${metadata.title} | AIM Lab`} />
        <meta
          property="og:description"
          content="AIM Lab - The AI Meditation Playground"
        />
        <meta
          name="description"
          content="AIM Lab - The AI Meditation Playground"
        />
      </Head>
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <MeditationPlayer
          meditation={metadata}
          meditationId={meditationId}
          audioUrl={audioUrl}
        />
      </div>
    </Layout>
  );
}
