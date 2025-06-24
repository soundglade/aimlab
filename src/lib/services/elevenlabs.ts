import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const DEFAULT_VOICE_ID = "wgHvco1wiREKN0BdyVx5";
const DEFAULT_MODEL_ID = "eleven_multilingual_v1";

// Weekly quota calculation constants
const TOTAL_WEEKS = 4;
const AVG_MEDITATION_CREDITS = 2000;

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
 * Calculate the number of premium meditations remaining for the current week
 * based on ElevenLabs usage quota divided into 4 weekly allowances
 * @param options Optional API key override and client injection for testing
 * @returns Number of meditations remaining this week (0 if over quota)
 */
export async function getWeeklyMeditationsLeft(options?: {
  api_key?: string;
  client?: ElevenLabsClient;
}): Promise<number> {
  try {
    const elevenlabs =
      options?.client ||
      new ElevenLabsClient({
        apiKey: options?.api_key || process.env.ELEVENLABS_API_KEY,
      });

    // Get subscription info from ElevenLabs API
    const subscription = await elevenlabs.user.subscription.get();

    const creditsUsed = subscription.characterCount;
    const creditsLimit = subscription.characterLimit;
    const resetTimeMs = (subscription.nextCharacterCountResetUnix || 0) * 1000;

    // Calculate which week of the 4-week cycle we're in
    const now = Date.now();
    const timeUntilResetMs = resetTimeMs - now;
    const totalCycleDurationMs = 28 * 24 * 60 * 60 * 1000; // 28 days in ms
    const timeElapsedInCycleMs = totalCycleDurationMs - timeUntilResetMs;
    const weekIdx = Math.floor(
      timeElapsedInCycleMs / (7 * 24 * 60 * 60 * 1000)
    ); // 7 days in ms

    // Ensure weekIdx is within bounds (0-3)
    const currentWeek = Math.max(0, Math.min(3, weekIdx));

    // Calculate weekly allowance
    const creditsPerWeek = Math.floor(creditsLimit / TOTAL_WEEKS);

    // Calculate how many credits should have been used by the start of this week
    const creditsUsedByStartOfWeek = creditsPerWeek * currentWeek;

    // Calculate how many credits have been used so far this week
    const creditsUsedThisWeek = Math.max(
      0,
      creditsUsed - creditsUsedByStartOfWeek
    );

    // Calculate credits left for this week
    const creditsLeftThisWeek = creditsPerWeek - creditsUsedThisWeek;

    // Calculate meditations left (floor to whole meditations, clamp to 0)
    const meditationsLeft = Math.max(
      0,
      Math.floor(creditsLeftThisWeek / AVG_MEDITATION_CREDITS)
    );

    return meditationsLeft;
  } catch (error) {
    console.error("Error fetching ElevenLabs subscription info:", error);
    // Return 0 on error to be safe and prevent usage
    return 0;
  }
}

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
    api_key?: string;
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
  api_key?: string;
}): Promise<ArrayBuffer> {
  try {
    const elevenlabs = new ElevenLabsClient({
      apiKey: options.api_key || process.env.ELEVENLABS_API_KEY,
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

    // Convert snake_case to camelCase programmatically
    const voiceSettings: Record<string, any> = {};
    for (const [key, value] of Object.entries(voice_settings)) {
      if (value === undefined) continue;
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      voiceSettings[camelKey] = value;
    }

    const audio = await elevenlabs.textToSpeech.convert(voice_id, {
      text: transformedText,
      modelId: model_id,
      outputFormat: "pcm_24000",
      voiceSettings: voiceSettings,
    });

    const pcmBuffer = await readableStreamToBuffer(audio);
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
 * Convert a Web API ReadableStream to a Buffer
 * @param stream ReadableStream from the new ElevenLabs SDK
 * @returns Promise resolving to a Buffer
 */
async function readableStreamToBuffer(
  stream: ReadableStream<Uint8Array>
): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  // Calculate total length
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);

  // Create a single Uint8Array and copy all chunks
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return Buffer.from(result);
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
