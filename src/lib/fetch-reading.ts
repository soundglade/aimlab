import path from "path";
import fs from "fs/promises";
import { Reading } from "@/components/types";
import slugify from "slugify";

export interface ReadingData {
  readingId: string;
  script: Reading | null;
  error?: string;
}

export async function fetchReadingData(id: string): Promise<ReadingData> {
  try {
    const readingDir = path.join(process.cwd(), "public/storage/readings", id);

    const scriptPath = path.join(readingDir, "script.json");

    try {
      const scriptContent = await fs.readFile(scriptPath, "utf-8");
      const script = JSON.parse(scriptContent);

      const slug = slugify(script.title, { lower: true, strict: true });
      const fullAudio = `/storage/readings/${id}/${slug}.mp3`;
      script.fullAudio = fullAudio;

      return { readingId: id, script };
    } catch (fileError) {
      // If script.json doesn't exist, return 404-like response
      return {
        readingId: id,
        script: null,
        error:
          "Reading not found. The script may not exist or has been removed.",
      };
    }
  } catch (error) {
    console.error("Error loading reading:", error);
    return {
      readingId: id,
      script: null,
      error: "Failed to load reading data.",
    };
  }
}
