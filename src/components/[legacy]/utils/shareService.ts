import { Meditation } from "../Rila";
import { FileStorageApi } from "@/lib/file-storage";

export interface ShareResponse {
  shareUrl: string;
}

/**
 * Shares a meditation by sending both metadata and audio to the server
 */
export async function shareMeditation(
  meditation: Meditation,
  fileStorage: FileStorageApi
): Promise<ShareResponse> {
  if (!meditation.fullAudioFileId) {
    throw new Error("No audio file available to share");
  }

  // Get the audio file from storage
  const storedFile = await fileStorage.getFile(meditation.fullAudioFileId);

  if (!storedFile || !storedFile.data) {
    throw new Error("Could not retrieve audio file from storage");
  }

  // Create FormData to send both JSON and binary data
  const formData = new FormData();
  formData.append("metadata", JSON.stringify(meditation));
  formData.append(
    "audioFile",
    new Blob([storedFile.data], { type: "audio/wav" }),
    `${meditation.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.wav`
  );

  // Send to API
  const response = await fetch("/api/share-meditation", {
    method: "POST",
    body: formData,
  });

  return await response.json();
}
