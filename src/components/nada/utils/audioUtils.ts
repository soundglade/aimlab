import { Buffer } from "buffer";

/**
 * Converts stored data (Blob or base64 string) to a Blob with appropriate MIME type
 */
export function getAudioBlob(
  data: Blob | string,
  mimeType = "audio/wav"
): Blob {
  if (data instanceof Blob) {
    return data;
  } else if (typeof data === "string") {
    return new Blob([Buffer.from(data, "base64")], { type: mimeType });
  }
  throw new Error("Unsupported audio data format");
}

/**
 * Creates an object URL from audio data
 */
export function createAudioUrl(
  data: Blob | string,
  mimeType = "audio/wav"
): string {
  const blob = getAudioBlob(data, mimeType);
  return URL.createObjectURL(blob);
}

/**
 * Gets the duration of an audio file in milliseconds
 */
export async function getAudioDuration(data: Blob | string): Promise<number> {
  const blob = getAudioBlob(data);
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  try {
    await new Promise((resolve, reject) => {
      audio.onloadedmetadata = resolve;
      audio.onerror = reject;
    });
    return audio.duration * 1000; // Convert to milliseconds
  } finally {
    URL.revokeObjectURL(url);
  }
}
