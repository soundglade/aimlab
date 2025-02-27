import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import path from "path";
import fs from "fs/promises";

// Type for the meditation metadata
interface SharedMeditationProps {
  metadata: any; // We'll type this more specifically once we see the metadata structure
  error?: string;
}

export const getServerSideProps: GetServerSideProps<
  SharedMeditationProps
> = async ({ params }) => {
  try {
    const id = params?.id as string;
    const meditationDir = path.join(
      process.cwd(),
      "public/storage/nada/shared-meditations",
      id
    );

    // Read and parse the metadata file
    const metadataPath = path.join(meditationDir, "metadata.json");
    const metadataContent = await fs.readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(metadataContent);

    return {
      props: {
        metadata,
      },
    };
  } catch (error) {
    console.error("Error loading shared meditation:", error);
    return {
      props: {
        metadata: null,
        error:
          "Failed to load meditation. It may have expired or been deleted.",
      },
    };
  }
};

export default function SharedMeditation({
  metadata,
  error,
}: SharedMeditationProps) {
  const router = useRouter();

  if (error) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Card className="p-6">
          <h1 className="text-2xl font-medium text-center mb-6">
            Meditation Not Found
          </h1>
          <p className="text-muted-foreground text-center">{error}</p>
        </Card>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Card className="p-6">
          <h1 className="text-2xl font-medium text-center mb-6">Loading...</h1>
          <p className="text-muted-foreground text-center">
            Loading meditation...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card className="p-6">
        <h1 className="text-2xl font-medium text-center mb-6">
          {metadata.title || "Shared Meditation"}
        </h1>

        <div className="space-y-4">
          {/* Display meditation steps if available */}
          {metadata.steps?.map((step: any, idx: number) => (
            <div key={idx} className="p-3 rounded bg-muted/50">
              {step.type === "heading" && (
                <div
                  className={
                    step.level === 1
                      ? "text-xl font-medium"
                      : "text-lg font-medium"
                  }
                >
                  {step.text}
                </div>
              )}
              {step.type === "speech" && <p>{step.text}</p>}
              {step.type === "pause" && (
                <p className="text-muted-foreground italic">
                  {step.duration}s pause
                  {step.canExtend && " (can be extended)"}
                </p>
              )}
              {step.type === "direction" && (
                <p className="text-primary italic">{step.text}</p>
              )}
              {step.type === "aside" && (
                <p className="text-muted-foreground italic">{step.text}</p>
              )}
            </div>
          ))}

          {/* If no steps available, show raw metadata for debugging */}
          {!metadata.steps && (
            <pre className="p-4 rounded bg-muted font-mono text-sm overflow-auto">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          )}
        </div>
      </Card>
    </div>
  );
}
