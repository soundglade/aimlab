import { ElevenLabsClient } from "elevenlabs";
import { Readable } from "stream";

const DEFAULT_VOICE_ID = "wgHvco1wiREKN0BdyVx5";
const DEFAULT_MODEL_ID = "eleven_multilingual_v1";

/**
 * Transforms speech text by adding pauses between sentences
 * @param text Text to transform
 * @returns Text with pause markers added between sentences
 */
export function transformSpeechText(text: string): string {
  const pauseMarker = '<break time="2s" />';

  // Regular expression to match the end of sentences followed by space
  // Uses capturing groups to preserve the original spacing after sentence ending
  return text.replace(/([.!?])(\s+)/g, `$1 ${pauseMarker}$2`);
}

/**
 * Generate speech using ElevenLabs TTS and convert PCM to WAV
 * @param text Text to convert to speech
 * @returns ArrayBuffer containing the WAV audio data
 */
export async function generateSpeech(text: string): Promise<ArrayBuffer> {
  try {
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    // Transform the text to add pauses between sentences
    const transformedText = transformSpeechText(text);

    // Request PCM data from ElevenLabs
    const audio = await elevenlabs.generate({
      voice: DEFAULT_VOICE_ID,
      text: transformedText,
      model_id: DEFAULT_MODEL_ID,
      output_format: "pcm_24000",
      voice_settings: {
        speed: 0.85,
      },
    });

    // Convert stream to PCM buffer
    const pcmBuffer = await streamToBuffer(audio);

    // Convert PCM to WAV by directly adding WAV headers
    const wavBuffer = addWavHeader(pcmBuffer, 24000, 1, 16);

    // Return the WAV as an ArrayBuffer
    return wavBuffer.buffer.slice(
      wavBuffer.byteOffset,
      wavBuffer.byteOffset + wavBuffer.byteLength
    ) as ArrayBuffer;
  } catch (error) {
    console.error("ElevenLabs speech generation error:", error);
    throw error;
  }
}

/**
 * Convert a readable stream to a Buffer
 * @param stream Readable stream
 * @returns Promise resolving to a Buffer
 */
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks);
}

/**
 * Adds WAV header to PCM data
 * @param pcmData PCM data buffer
 * @param sampleRate Sample rate of audio
 * @param channels Number of channels (1=mono, 2=stereo)
 * @param bitsPerSample Bits per sample (usually 16)
 * @returns Buffer containing WAV file
 */
function addWavHeader(
  pcmData: Buffer,
  sampleRate: number,
  channels: number,
  bitsPerSample: number
): Buffer {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const header = Buffer.alloc(headerSize);

  // RIFF identifier
  header.write("RIFF", 0, 4, "ascii");
  // File size
  header.writeUInt32LE(totalSize - 8, 4);
  // WAVE identifier
  header.write("WAVE", 8, 4, "ascii");
  // Format chunk identifier
  header.write("fmt ", 12, 4, "ascii");
  // Format chunk size
  header.writeUInt32LE(16, 16);
  // Audio format (1 for PCM)
  header.writeUInt16LE(1, 20);
  // Number of channels
  header.writeUInt16LE(channels, 22);
  // Sample rate
  header.writeUInt32LE(sampleRate, 24);
  // Byte rate
  header.writeUInt32LE(byteRate, 28);
  // Block align
  header.writeUInt16LE(blockAlign, 32);
  // Bits per sample
  header.writeUInt16LE(bitsPerSample, 34);
  // Data chunk identifier
  header.write("data", 36, 4, "ascii");
  // Data chunk size
  header.writeUInt32LE(dataSize, 40);

  // Combine header and PCM data
  return Buffer.concat([header, pcmData]);
}
