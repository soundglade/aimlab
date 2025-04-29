import { ElevenLabsClient } from "elevenlabs";
import { Readable } from "stream";

const DEFAULT_VOICE_ID = "wgHvco1wiREKN0BdyVx5";
const DEFAULT_MODEL_ID = "eleven_multilingual_v1";

// Voice config mapping logical keys to ElevenLabs settings
export const ELEVENLABS_VOICE_CONFIG: Record<
  string,
  {
    voice_id: string;
    model_id: string;
    speed?: number;
    stability?: number;
    similarity_boost?: number;
  }
> = {
  drew: {
    voice_id: "wgHvco1wiREKN0BdyVx5",
    model_id: "eleven_multilingual_v1",
    speed: 0.85,
    stability: 0.5,
    similarity_boost: 0.75,
  },
  britney: {
    voice_id: "pjcYQlDFKMbcOUp6F5GD",
    model_id: "eleven_multilingual_v2",
    speed: 0.9,
    stability: 0.5,
    similarity_boost: 0.75,
  },
  jameson: {
    voice_id: "Mu5jxyqZOLIGltFpfalg",
    model_id: "eleven_multilingual_v2",
    speed: 0.85,
    stability: 0.5,
    similarity_boost: 0.75,
  },
};

/**
 * Transforms speech text by adding pauses between sentences
 * @param text Text to transform
 * @returns Text with pause markers added between sentences
 */
export function transformSpeechText(text: string): string {
  const pauseMarker = '<break time="1.2s" />';

  // Regular expression to match the end of sentences followed by space
  // Uses capturing groups to preserve the original spacing after sentence ending
  return text.replace(/([.!?])(\s+)/g, `$1 ${pauseMarker}$2`);
}

/**
 * Generate speech using ElevenLabs TTS and convert PCM to WAV
 * @param text Text to convert to speech
 * @param options Optional settings for custom speech generation
 * @returns ArrayBuffer containing the WAV audio data
 */
export async function generateSpeech(
  text: string,
  options?: {
    apiKey?: string;
    voice_id?: string;
    model_id?: string;
    speed?: number;
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
    preset?: string;
  }
): Promise<ArrayBuffer> {
  let config: any = { ...options };
  if (options?.preset) {
    const presetConfig = ELEVENLABS_VOICE_CONFIG[options.preset];
    if (!presetConfig) {
      throw new Error(`Unknown ElevenLabs preset: ${options.preset}`);
    }
    // Merge preset config over options (preset values take precedence)
    config = { ...options, ...presetConfig };
  }
  if (!config.voice_id || !config.model_id) {
    // If still missing, use 'drew' as fallback
    const drewConfig = ELEVENLABS_VOICE_CONFIG["drew"];
    config = { ...config, ...drewConfig };
  }
  return generateSpeechWithSettings({
    text,
    ...config,
  });
}

/**
 * Generate speech using ElevenLabs TTS with custom settings and convert PCM to WAV
 * @param options Object with text, voice_id, model_id, and all voice settings
 * @returns ArrayBuffer containing the WAV audio data
 */
export async function generateSpeechWithSettings(options: {
  text: string;
  voice_id: string;
  model_id: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  speed?: number;
  apiKey?: string;
}): Promise<ArrayBuffer> {
  try {
    const elevenlabs = new ElevenLabsClient({
      apiKey: options.apiKey || process.env.ELEVENLABS_API_KEY,
    });

    const {
      text,
      voice_id,
      model_id,
      stability,
      similarity_boost,
      style,
      use_speaker_boost,
      speed,
    } = options;

    const transformedText = transformSpeechText(text);

    // Only include defined settings
    const voice_settings: Record<string, any> = {};
    if (typeof stability === "number") voice_settings.stability = stability;
    if (typeof similarity_boost === "number")
      voice_settings.similarity_boost = similarity_boost;
    if (typeof style === "number") voice_settings.style = style;
    if (typeof use_speaker_boost === "boolean")
      voice_settings.use_speaker_boost = use_speaker_boost;
    if (typeof speed === "number") voice_settings.speed = speed;

    const audio = await elevenlabs.generate({
      voice: voice_id,
      text: transformedText,
      model_id,
      output_format: "pcm_24000",
      voice_settings,
    });

    const pcmBuffer = await streamToBuffer(audio);
    const wavBuffer = addWavHeader(pcmBuffer, 24000, 1, 16);

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
