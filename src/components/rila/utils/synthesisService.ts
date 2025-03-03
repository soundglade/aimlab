import { Meditation } from "../Rila";
import { FileStorageApi } from "@/lib/file-storage";
import { getAudioBlob, createAudioUrl } from "./audioUtils";

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
  onAudioCreated: (
    sectionIndex: number,
    durationMs: number,
    fileId: string
  ) => void;
}

// Helper function to handle audio data processing
async function handleAudioData(
  data: { data: string; sectionIndex: number; durationMs: number },
  fileStorage: FileStorageApi,
  sessionId: string | undefined,
  onAudioCreated: (
    sectionIndex: number,
    durationMs: number,
    fileId: string
  ) => void
) {
  try {
    // Create a Blob from the base64 audio data
    const audioBlob = getAudioBlob(data.data, "audio/mp3");

    // Save the audio blob to file storage
    const fileId = await fileStorage.saveFile(audioBlob, {
      projectId: "rila",
      groupId: sessionId,
      contentType: "audio/mp3",
    });

    // Notify about the audio file creation
    onAudioCreated(data.sectionIndex, data.durationMs, fileId);
  } catch (storageError) {
    console.error("Error storing audio file:", storageError);
    // Still mark as completed by setting a placeholder ID
    onAudioCreated(
      data.sectionIndex,
      data.durationMs || 0,
      "error-" + Date.now()
    );
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

  const url = createAudioUrl(storedFile.data, "audio/mp3");
  const audio = new Audio(url);

  audio.onended = () => {
    URL.revokeObjectURL(url);
  };

  return audio.play();
}
