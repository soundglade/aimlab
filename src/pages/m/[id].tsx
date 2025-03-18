import { GetServerSideProps } from "next";
import { Card } from "@/components/ui/card";
import path from "path";
import fs from "fs/promises";
import { MeditationPlayer } from "@/components/rila/meditation-player";
import { Meditation } from "@/components/rila/types";
import { Layout } from "@/components/layout/Layout";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const id = params?.id as string;
    const meditationDir = path.join(
      process.cwd(),
      "public/storage/rila/shared-meditations",
      id
    );

    // Read and parse the metadata file
    const metadataPath = path.join(meditationDir, "metadata.json");
    const metadataContent = await fs.readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(metadataContent);

    // Generate the audio URL
    const audioUrl = `/storage/rila/shared-meditations/${id}/audio.mp3`;

    return {
      props: {
        meditationId: id,
        metadata,
        audioUrl,
      },
    };
  } catch (error) {
    console.error("Error loading shared meditation:", error);
    return {
      props: {
        metadata: null,
        audioUrl: null,
        error:
          "Failed to load meditation. It may have expired or been deleted.",
      },
    };
  }
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
        <Card className="p-6">
          <h1 className="text-2xl font-medium text-center mb-6">
            Meditation Not Found
          </h1>
          <p className="text-muted-foreground text-center">
            {error || "Failed to load meditation"}
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <MeditationPlayer
          meditation={metadata}
          meditationId={meditationId}
          audioUrl={audioUrl}
        />
      </div>
    </Layout>
  );
}
