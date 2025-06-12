// Kokoro self-hosted TTS service

const SELF_HOSTED_KOKORO_URL =
  process.env.SELF_HOSTED_KOKORO_URL || "http://localhost:8880";

const settings = {
  nicole: {
    voice: "af_nicole",
    speed: 0.9,
  },
  nicole2: {
    voice: "af_v0nicole",
    speed: 0.9,
  },
  nicole_heart: {
    voice: "af_v0nicole+af_heart(0.5)",
    speed: 0.8,
  },
  nicole_kore: {
    voice: "af_nicole+af_kore(0.2)",
    speed: 0.9,
  },
  echo_gurney_nicole: {
    voice: "am_echo+am_v0gurney(0.3)+af_nicole(0.2)",
    speed: 0.8,
  },
  michael_nichole_gurney: {
    voice: "am_michael+af_nicole(0.9)+am_v0gurney(0.5)",
    speed: 0.9,
  },
  michael_gurney: {
    voice: "am_michael+am_v0gurney(0.5)",
    speed: 0.9,
  },
  lewis_gurney_michael: {
    voice: "bm_lewis+am_v0gurney(0.4)+am_michael(0.4)",
    speed: 0.9,
  },
  lewis_gurney_michael_aoede: {
    voice: "bm_lewis+am_v0gurney(0.5)+am_michael(0.3)+af_aoede(0.5)",
    speed: 0.9,
  },
  jack: {
    voice: "am_michael+am_onyx(0.5)+am_v0gurney(0.5)",
    speed: 0.9,
  },
  // Instant meditation voices
  grace: {
    voice: "af_nicole+af_aoede(0.2)",
    speed: 0.9,
  },
  kate: {
    voice: "af_nicole+af_aoede",
    speed: 0.85,
  },
  emily: {
    voice: "bf_lily+af_nicole(0.3)",
    speed: 0.85,
  },
  ben: {
    voice: "am_echo+am_v0gurney(0.3)",
    speed: 0.85,
  },
  matthew: {
    voice: "am_michael+af_aoede(0.5)+am_v0gurney",
    speed: 0.85,
  },
  james: {
    voice: "bm_lewis+am_onyx(0.2)+af_aoede(0.2)+am_v0gurney(0.2)",
    speed: 0.85,
  },
};

const CURRENT_SETTINGS = settings.grace;

/**
 * Generate speech using self-hosted Kokoro TTS
 * @param text Text to convert to speech
 * @param options Optional options
 * @returns ArrayBuffer containing the audio data
 */
export async function generateSpeech(
  text: string,
  options?: any
): Promise<ArrayBuffer> {
  try {
    // Use voice from options if provided, otherwise use default
    const voiceId = options?.voiceId;
    const voiceSettings =
      voiceId && settings[voiceId] ? settings[voiceId] : CURRENT_SETTINGS;

    const response = await fetch(SELF_HOSTED_KOKORO_URL + "/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "kokoro",
        input: text,
        response_format: "mp3",
        ...voiceSettings,
      }),
    });

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

/**
 * Fetch available voices from Kokoro TTS
 * @returns Array of voice names
 */
export async function fetchVoices(): Promise<string[]> {
  try {
    const response = await fetch(SELF_HOSTED_KOKORO_URL + "/v1/audio/voices");
    if (!response.ok) {
      throw new Error(
        `Failed to fetch voices: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    if (!data || !Array.isArray(data.voices)) {
      throw new Error("Invalid response format for voices");
    }
    return data.voices;
  } catch (error) {
    console.error("Kokoro (self-hosted) fetch voices error:", error);
    throw error;
  }
}
