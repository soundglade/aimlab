import { GetServerSideProps } from "next";
import Head from "next/head";
import { Card } from "@/components/ui/card";
import { Reading } from "@/components/types";
import { Layout } from "@/components/layout/layout-component";
import { fetchReadingData } from "@/lib/fetch-reading";
import { ReadingSummary } from "@/components/player/reading-summary";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const readingData = await fetchReadingData(id);

  return {
    props: readingData,
  };
};

export default function PublicReading({
  readingId,
  script,
  error,
}: {
  readingId: string;
  script: Reading | null;
  error?: string;
}) {
  if (error || !script) {
    return (
      <Layout>
        <Head>
          <title key="title">Meditation Not Found | AIM Lab</title>
          <meta
            key="description"
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

  const pageTitle = `${script.title} | AIM Lab`;
  const pageDescription = "AIM Lab - The AI Meditation Playground";
  const pageUrl = `https://meditationlab.ai/r/${readingId}`;
  const ogImage =
    script.coverImageUrl || "https://meditationlab.ai/og-image-2.jpg";

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
        <ReadingSummary
          readingId={readingId}
          reading={script}
          audioUrl={script.fullAudio || ""}
        />
      </div>
    </Layout>
  );
}
