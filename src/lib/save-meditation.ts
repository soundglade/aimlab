import fs from "fs/promises";
import path from "path";
import { customAlphabet } from "nanoid";
import { Meditation } from "@/components/rila/types";
import crypto from "crypto";

const generateMeditationId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  7
);

/**
 * Generates a unique owner key for a meditation
 * @param meditationId The unique meditation ID
 * @returns A unique owner key
 */
function generateOwnerKey(meditationId: string): string {
  const secret = process.env.JWT_SECRET || "fallback-secret-key";
  return crypto.createHmac("sha256", secret).update(meditationId).digest("hex");
}

/**
 * Saves a meditation and its audio to the file system and returns access information
 * @param audioBuffer The audio buffer containing the meditation audio (in MP3 format)
 * @param meditation The meditation object with metadata
 * @returns Object containing url, meditationId and ownerKey, or null if saving failed
 */
export async function saveMeditation(
  audioBuffer: Buffer,
  meditation: Meditation
): Promise<{ url: string; meditationId: string; ownerKey: string } | null> {
  try {
    // Generate unique ID
    const meditationId = generateMeditationId();

    // Generate owner key
    const ownerKey = generateOwnerKey(meditationId);

    // Create directory
    const saveDir = path.join(
      process.cwd(),
      "public/storage/meditations",
      meditationId
    );
    await fs.mkdir(saveDir, { recursive: true });

    // Save metadata
    await fs.writeFile(
      path.join(saveDir, "metadata.json"),
      JSON.stringify(meditation, null, 2)
    );

    // Save audio file (already in MP3 format from createConcatenatedAudio)
    await fs.writeFile(path.join(saveDir, "audio.mp3"), audioBuffer);

    // Generate URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const url = `${baseUrl}/m/${meditationId}`;

    return { url, meditationId, ownerKey };
  } catch (error) {
    console.error("Error saving meditation:", error);
    return null;
  }
}
