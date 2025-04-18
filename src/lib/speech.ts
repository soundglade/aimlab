import * as replicateKokoro from "./services/replicate-kokoro";
import * as selfHostedKokoro from "./services/self-hosted-kokoro";
import * as elevenlabs from "./services/elevenlabs";
import * as test from "./services/test";

export type SpeechService =
  | "replicateKokoro"
  | "selfHostedKokoro"
  | "elevenlabs"
  | "test";

type SpeechRequest = {
  text: string;
  // Only used for elevenlabs, ignored for others
  voiceKey?: string;
  resolve: (value: ArrayBuffer) => void;
  reject: (reason: any) => void;
  signal?: AbortSignal;
};

// Maximum concurrent requests per service
const MAX_CONCURRENT = {
  replicateKokoro: 3,
  selfHostedKokoro: 1,
  elevenlabs: 2,
  test: 2,
};

// Timeout in milliseconds per service
const REQUEST_TIMEOUT_MS = {
  replicateKokoro: 3 * 60 * 1000, // 3 minutes
  selfHostedKokoro: 6 * 60 * 1000, // 6 minutes
  elevenlabs: 3 * 60 * 1000, // 3 minutes
  test: 3 * 60 * 1000, // 3 minutes
};

// Queue and processing state
const queues: Record<SpeechService, Array<SpeechRequest>> = {
  replicateKokoro: [],
  selfHostedKokoro: [],
  elevenlabs: [],
  test: [],
};

const activeRequests: Record<SpeechService, number> = {
  replicateKokoro: 0,
  selfHostedKokoro: 0,
  elevenlabs: 0,
  test: 0,
};

/**
 * Generate speech using one of the available TTS services
 * @param text Text to convert to speech
 * @param service TTS service to use (default: "replicateKokoro")
 * @param signal Optional AbortSignal to cancel queued requests
 * @returns ArrayBuffer containing the audio data
 */
export async function generateSpeech(
  text: string,
  service: SpeechService = "replicateKokoro",
  voiceKey?: string,
  signal?: AbortSignal
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    // Immediately bail if already aborted
    if (signal?.aborted) {
      return reject(new DOMException("Aborted", "AbortError"));
    }
    // Add request to the queue, including signal
    const request: SpeechRequest = { text, voiceKey, resolve, reject, signal };
    queues[service].push(request);

    // Process queue if possible
    processQueue(service);
  });
}

/**
 * Process the next item in the queue if below concurrency limit
 * @param service Speech service to process
 */
function processQueue(service: SpeechService): void {
  // Keep processing while there's capacity and items in the queue
  while (
    activeRequests[service] < MAX_CONCURRENT[service] &&
    queues[service].length > 0
  ) {
    const request = queues[service].shift();
    if (!request) return;
    // Skip any jobs whose signal has been aborted
    if (request.signal?.aborted) {
      request.reject(new DOMException("Aborted", "AbortError"));
      continue;
    }
    activeRequests[service]++;

    const { text, voiceKey, resolve, reject } = request;
    const serviceImpl =
      service === "replicateKokoro"
        ? replicateKokoro
        : service === "selfHostedKokoro"
        ? selfHostedKokoro
        : service === "elevenlabs"
        ? elevenlabs
        : test;

    let clearRequestTimeout: () => void;

    const timeoutPromise = new Promise<never>((_, timeoutReject) => {
      const timeoutId = setTimeout(() => {
        timeoutReject(
          new Error(
            `${service} speech generation timed out after ${
              REQUEST_TIMEOUT_MS[service] / 1000
            } seconds`
          )
        );
      }, REQUEST_TIMEOUT_MS[service]);

      clearRequestTimeout = () => clearTimeout(timeoutId);
    });

    // For elevenlabs, pass voiceKey; for others, ignore
    const speechPromise =
      service === "elevenlabs"
        ? serviceImpl.generateSpeech(text, voiceKey)
        : serviceImpl.generateSpeech(text);

    Promise.race([speechPromise, timeoutPromise])
      .then((result) => {
        resolve(result as ArrayBuffer);
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        if (clearRequestTimeout) {
          clearRequestTimeout();
        }
        activeRequests[service]--;

        // Once a request completes, try to process more of the queue
        processQueue(service);
      });
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
    const { parseBuffer } = await import("music-metadata");
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
