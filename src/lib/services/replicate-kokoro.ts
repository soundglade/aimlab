import Replicate from "replicate";

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Kokoro TTS model ID
const KOKORO_MODEL_ID =
  "jaaari/kokoro-82m:f559560eb822dc509045f3921a1921234918b91739db4bf3daab2169b71c7a13";

/**
 * Generate speech using Kokoro TTS
 * @param text Text to convert to speech
 * @returns ArrayBuffer containing the audio data
 */
export async function generateSpeech(text: string): Promise<ArrayBuffer> {
  try {
    // Call Kokoro TTS API via Replicate
    const input = { text, voice: "af_nicole" };

    // Get the audio URL from Replicate
    const outputUrl = (await replicate.run(KOKORO_MODEL_ID, {
      input,
    })) as unknown as string;

    // Fetch the audio data
    const audioResponse = await fetch(outputUrl);
    if (!audioResponse.ok) {
      throw new Error(
        `Failed to fetch audio: ${audioResponse.status} ${audioResponse.statusText}`
      );
    }

    return await audioResponse.arrayBuffer();
  } catch (error) {
    console.error("Kokoro speech generation error:", error);
    throw error;
  }
}
