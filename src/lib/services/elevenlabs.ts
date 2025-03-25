const DEFAULT_VOICE_ID = "XDlm17VvOo1F44DA2MnT";
const DEFAULT_MODEL_ID = "eleven_multilingual_v2"; // Default model ID
import { ElevenLabsClient } from "elevenlabs";
import { Readable } from "stream";

/**
 * Generate speech using ElevenLabs TTS
 * @param text Text to convert to speech
 * @returns ArrayBuffer containing the audio data
 */
export async function generateSpeech(text: string): Promise<ArrayBuffer> {
  try {
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const audio = await elevenlabs.generate({
      voice: DEFAULT_VOICE_ID,
      text,
      model_id: DEFAULT_MODEL_ID,
      output_format: "pcm_24000",
    });

    // Convert stream to buffer then to ArrayBuffer
    return await streamToArrayBuffer(audio);
  } catch (error) {
    console.error("ElevenLabs speech generation error:", error);
    throw error;
  }
}

async function streamToArrayBuffer(stream: Readable): Promise<ArrayBuffer> {
  // Create a new array to store the chunks
  const chunks: Buffer[] = [];

  // Process the stream
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }

  // Concatenate all chunks into a single Buffer
  const buffer = Buffer.concat(chunks);

  // Convert the Buffer to an ArrayBuffer
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
}
