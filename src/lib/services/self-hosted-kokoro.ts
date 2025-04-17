// Kokoro self-hosted TTS service

/**
 * Generate speech using self-hosted Kokoro TTS
 * @param text Text to convert to speech
 * @returns ArrayBuffer containing the audio data
 */
export async function generateSpeech(text: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(
      "https://kokoro.soundglade.com/v1/audio/speech",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "kokoro",
          input: text,
          voice: "af_nicole",
          response_format: "mp3",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch audio: ${response.status} ${response.statusText}`
      );
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error("Kokoro (self-hosted) speech generation error:", error);
    throw error;
  }
}
