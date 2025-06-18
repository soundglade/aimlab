import { GetServerSideProps } from "next";
import Head from "next/head";
import crypto from "crypto";
import { Card } from "@/components/ui/card";
import { Reading } from "@/components/types";
import { Layout } from "@/components/layout/layout-component";
import { fetchReadingData } from "@/lib/fetch-reading";
import { ReadingSummary } from "@/components/player/reading-summary";

/**
 * Generates a unique owner key for a meditation/reading
 */
function generateOwnerKey(id: string): string {
  const secret = process.env.JWT_SECRET || "fallback-secret-key";
  return crypto.createHmac("sha256", secret).update(id).digest("hex");
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const id = params?.id as string;
  const readingData = await fetchReadingData(id);

  // If there's an error or no script, return it as-is
  if (readingData.error || !readingData.script) {
    return {
      props: readingData,
    };
  }

  // Check if the reading is public
  const isPublic = readingData.script.public === true;

  if (!isPublic) {
    // For private readings, check if user has valid ownerKey
    // Next.js provides parsed cookies in req.cookies
    const ownerKey = req.cookies[`meditation-ownerKey-${id}`];

    if (!ownerKey) {
      // No ownerKey found, return not found
      return {
        props: {
          readingId: id,
          script: null,
          error:
            "Meditation not found. The script may not exist or has been removed.",
        },
      };
    }

    // Validate ownerKey against the expected ownerKey for this reading
    const expectedOwnerKey = generateOwnerKey(id);
    if (ownerKey !== expectedOwnerKey) {
      // Invalid ownerKey, return not found
      return {
        props: {
          readingId: id,
          script: null,
          error:
            "Meditation not found. The script may not exist or has been removed.",
        },
      };
    }
  }

  return {
    props: readingData,
  };
};

export default function ReadingPage({
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
