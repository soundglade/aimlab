import path from "path";
import fs from "fs/promises";
import { Meditation } from "@/components/types";

export interface MeditationData {
  meditationId: string;
  metadata: Meditation | null;
  audioUrl: string | null;
  error?: string;
}

export async function fetchMeditationData(id: string): Promise<MeditationData> {
  try {
    const meditationDir = path.join(
      process.cwd(),
      "public/storage/meditations",
      id
    );

    const metadataPath = path.join(meditationDir, "metadata.json");
    const metadataContent = await fs.readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(metadataContent);
    const audioUrl = `/storage/meditations/${id}/audio.mp3`;

    return { meditationId: id, metadata, audioUrl };
  } catch (error) {
    console.error("Error loading meditation:", error);
    return {
      meditationId: id,
      metadata: null,
      audioUrl: null,
      error: "Failed to load meditation. It may have expired or been deleted.",
    };
  }
}
