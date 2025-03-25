import { parseBuffer } from "music-metadata";
import * as kokoro from "./services/kokoro";
import * as elevenlabs from "./services/elevenlabs";

type SpeechService = "kokoro" | "elevenlabs";

/**
 * Generate speech using one of the available TTS services
 * @param text Text to convert to speech
 * @param service TTS service to use (default: "kokoro")
 * @returns ArrayBuffer containing the audio data
 */
export async function generateSpeech(
  text: string,
  service: SpeechService = "kokoro"
): Promise<ArrayBuffer> {
  try {
    switch (service) {
      case "kokoro":
        return await kokoro.generateSpeech(text);
      case "elevenlabs":
        return await elevenlabs.generateSpeech(text);
      default:
        throw new Error(`Unsupported speech service: ${service}`);
    }
  } catch (error) {
    console.error("Speech generation error:", error);
    throw error;
  }
}

/**
 * Get audio duration in milliseconds
 * @param audioBuffer ArrayBuffer containing audio data
 * @returns Duration in milliseconds
 */
export async function getAudioDurationMs(
  audioBuffer: ArrayBuffer
): Promise<number> {
  try {
    const metadata = await parseBuffer(Buffer.from(audioBuffer));
    if (!metadata.format.duration) {
      throw new Error("Could not determine audio duration");
    }
    return Math.round(metadata.format.duration * 1000);
  } catch (error) {
    console.error("Error getting audio duration:", error);
    throw error;
  }
}
