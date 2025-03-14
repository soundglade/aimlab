import fs from "fs/promises";
import path from "path";
import { customAlphabet } from "nanoid";
import { Meditation } from "@/components/rila/types";

const generateMeditationId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  7
);

/**
 * Saves a meditation and its audio to the file system and returns a URL to access it
 * @param audioBuffer The audio buffer containing the meditation audio
 * @param meditation The meditation object with metadata
 * @returns A URL to access the saved meditation, or null if saving failed
 */
export async function saveMeditation(
  audioBuffer: Buffer,
  meditation: Meditation
): Promise<string | null> {
  try {
    // Generate unique ID
    const meditationId = generateMeditationId();

    // Create directory
    const saveDir = path.join(
      process.cwd(),
      "public/storage/rila/shared-meditations",
      meditationId
    );
    await fs.mkdir(saveDir, { recursive: true });

    // Save metadata
    await fs.writeFile(
      path.join(saveDir, "metadata.json"),
      JSON.stringify(meditation, null, 2)
    );

    // Save audio file
    await fs.writeFile(path.join(saveDir, "audio.wav"), audioBuffer);

    // Generate URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return `${baseUrl}/m/${meditationId}`;
  } catch (error) {
    console.error("Error saving meditation:", error);
    return null;
  }
}
