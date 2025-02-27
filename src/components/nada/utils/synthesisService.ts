import { Meditation } from "../Nada";
import { FileStorageApi } from "@/lib/file-storage";
import { Buffer } from "buffer";

export interface VoiceSettings {
  voiceId: string;
  customVoiceId?: string;
  isAdvanced: boolean;
}

export interface SynthesisOptions {
  meditation: Meditation;
  voiceSettings: VoiceSettings;
  fileStorage: FileStorageApi;
  sessionId?: string;
}

export interface SynthesisCallbacks {
  onProgress: (progress: number) => void;
  onError: (error: string) => void;
  onAudioCreated: (sectionIndex: number, fileId: string) => void;
  onComplete: () => void;
}

// Helper function to handle audio data processing
async function handleAudioData(
  data: { data: string; sectionIndex: number },
  fileStorage: FileStorageApi,
  sessionId: string | undefined,
  onAudioCreated: (sectionIndex: number, fileId: string) => void
) {
  try {
    // Create a Blob from the base64 audio data
    const audioBlob = new Blob([Buffer.from(data.data, "base64")], {
      type: "audio/mp3",
    });

    // Save the audio blob to file storage
    const fileId = await fileStorage.saveFile(audioBlob, {
      projectId: "NADA",
      groupId: sessionId,
      contentType: "audio/mp3",
    });

    // Notify about the audio file creation
    onAudioCreated(data.sectionIndex, fileId);
  } catch (storageError) {
    console.error("Error storing audio file:", storageError);
    // Still mark as completed by setting a placeholder ID
    onAudioCreated(data.sectionIndex, "error-" + Date.now());
  }
}

// Helper function to process stream messages
function processStreamMessage(
  message: string,
  callbacks: SynthesisCallbacks,
  fileStorage: FileStorageApi,
  sessionId?: string
) {
  if (!message.trim()) return;

  try {
    const data = JSON.parse(message);

    switch (data.type) {
      case "metadata":
        // Handle metadata if needed
        break;
      case "progress":
        callbacks.onProgress(data.progress);
        break;
      case "audio":
        handleAudioData(data, fileStorage, sessionId, callbacks.onAudioCreated);
        break;
      case "error":
        callbacks.onError(data.message);
        break;
      case "complete":
        callbacks.onProgress(100);
        callbacks.onComplete();
        break;
    }
  } catch (e) {
    console.error("Error parsing message:", e);
  }
}

export function startSynthesis(
  options: SynthesisOptions,
  callbacks: SynthesisCallbacks
): { abort: () => void } {
  const { meditation, voiceSettings, fileStorage, sessionId } = options;
  const { title, steps } = meditation;

  const abortController = new AbortController();

  const synthesize = async () => {
    try {
      // Make API request
      const response = await fetch("/api/synthesize-meditation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sections: steps,
          voiceSettings,
          title,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error("Synthesis request failed");
      }

      // Get the response as a stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get stream reader");
      }

      // Process the stream
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk and add it to our buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete messages in the buffer
        const messages = buffer.split("\n");
        buffer = messages.pop() || ""; // Keep the last incomplete message in the buffer

        for (const message of messages) {
          processStreamMessage(message, callbacks, fileStorage, sessionId);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Synthesis aborted");
      } else {
        console.error("Synthesis error:", error);
        callbacks.onError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      }
    }
  };

  synthesize();

  return {
    abort: () => abortController.abort(),
  };
}

export async function playAudio(
  fileStorage: FileStorageApi,
  fileId: string
): Promise<void> {
  const storedFile = await fileStorage.getFile(fileId);
  if (!storedFile || !storedFile.data) {
    throw new Error("Audio file not found in storage");
  }

  // Create audio from stored file data
  let audioData: string;

  if (storedFile.data instanceof Blob) {
    // Convert Blob to base64 for playback
    const arrayBuffer = await storedFile.data.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    audioData = base64;
  } else if (typeof storedFile.data === "string") {
    // Already a base64 string
    audioData = storedFile.data;
  } else {
    throw new Error("Unsupported audio data format");
  }

  const url = URL.createObjectURL(new Blob([Buffer.from(audioData, "base64")]));
  const audio = new Audio(url);

  audio.onended = () => {
    URL.revokeObjectURL(url);
  };

  return audio.play();
}

// New function to get audio duration from a stored file
export async function getAudioDuration(storedFile: {
  data: Blob | string;
}): Promise<number> {
  if (!storedFile || !storedFile.data) {
    throw new Error("Invalid audio file data");
  }

  // Convert data to blob if needed
  let audioBlob: Blob;
  if (storedFile.data instanceof Blob) {
    audioBlob = storedFile.data;
  } else if (typeof storedFile.data === "string") {
    audioBlob = new Blob([Buffer.from(storedFile.data, "base64")], {
      type: "audio/mp3",
    });
  } else {
    throw new Error("Unsupported audio data format");
  }

  // Create audio element and get duration
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio(url);

  try {
    // Wait for metadata to load to get duration
    await new Promise((resolve, reject) => {
      audio.onloadedmetadata = resolve;
      audio.onerror = reject;
    });

    // Get duration in milliseconds
    const durationMs = audio.duration * 1000;

    return durationMs;
  } finally {
    // Clean up
    URL.revokeObjectURL(url);
  }
}
