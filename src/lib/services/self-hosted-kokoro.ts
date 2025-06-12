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
  nicole_aoede: {
    voice: "af_nicole+af_aoede(0.2)",
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
  matthew: {
    voice:
      "am_v0gurney(1.7)+am_michael(0.2)+af_kore(0.6)+am_onyx(1.3)+af_nicole(1.5)",
    speed: 0.9,
  },
  sarah: {
    voice: "af_nicole+af_aoede",
    speed: 0.9,
  },
  jack: {
    voice: "am_michael+am_onyx(0.8)+am_v0gurney(0.5)",
    speed: 0.9,
  },
  echo: {
    voice: "am_echo+am_v0gurney(0.3)",
    speed: 0.9,
  },
  lily: {
    voice: "bf_lily+af_nicole(0.4)",
    speed: 0.9,
  },
};

const CURRENT_SETTINGS = settings.sarah;

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
    const response = await fetch(SELF_HOSTED_KOKORO_URL + "/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "kokoro",
        input: text,
        response_format: "mp3",
        ...CURRENT_SETTINGS,
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
