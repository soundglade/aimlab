import { GetServerSideProps } from "next";
import Head from "next/head";
import { Card } from "@/components/ui/card";
import { MeditationPlayer } from "@/components/player/meditation-player";
import { MeditationSummary } from "@/components/player/meditation-summary";
import { Meditation } from "@/components/types";
import { Layout } from "@/components/layout/layout-component";
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
          <title key="title">Meditation not found | AIM Lab</title>
          <meta
            key="description"
            name="description"
            content="AIM Lab - The AI Meditation Playground"
          />
        </Head>
        <Card className="p-6">
          <h1 className="text-center text-2xl">Meditation not found</h1>
          <p className="text-muted-foreground text-center">
            {error || "Failed to load meditation"}
          </p>
        </Card>
      </Layout>
    );
  }

  const pageTitle = `${metadata.title} | AIM Lab`;
  const pageDescription = "AIM Lab - The AI Meditation Playground";
  const pageUrl = `https://meditationlab.ai/m/${meditationId}`;
  const ogImage =
    metadata.coverImageUrl || "https://meditationlab.ai/og-image-2.jpg";

  const displaySummary = metadata.description || metadata.coverImageUrl;

  return (
    <Layout>
      <Head>
        <title key="title">{pageTitle}</title>
        <meta key="description" name="description" content={pageDescription} />
        <meta key="og:title" property="og:title" content={pageTitle} />
        <meta key="og:url" property="og:url" content={pageUrl} />
        <meta
          key="og:description"
          property="og:description"
          content={pageDescription}
        />
        <meta key="og:image" property="og:image" content={ogImage} />
        <meta
          key="twitter:title"
          property="twitter:title"
          content={pageTitle}
        />
        <meta key="twitter:url" property="twitter:url" content={pageUrl} />
        <meta
          key="twitter:description"
          property="twitter:description"
          content={pageDescription}
        />
        <meta key="twitter:image" property="twitter:image" content={ogImage} />
      </Head>
      <div className="container mx-auto max-w-3xl px-4 pb-8 pt-2 md:pt-8">
        {displaySummary ? (
          <MeditationSummary
            meditationId={meditationId}
            meditation={metadata}
            audioUrl={audioUrl}
          />
        ) : (
          <MeditationPlayer
            meditation={metadata}
            meditationId={meditationId}
            audioUrl={audioUrl}
          />
        )}
      </div>
    </Layout>
  );
}
