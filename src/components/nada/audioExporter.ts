import { Meditation, MeditationStep } from "./NadaPage";
import { FileStorageApi } from "@/lib/file-storage";
import { Buffer } from "buffer";

/**
 * Exports a meditation as a single audio file, including speech and pauses
 */
export async function exportMeditationAudio(
  meditation: Meditation,
  fileStorage: FileStorageApi,
  options: {
    onProgress?: (progress: number) => void;
    fileName?: string;
  } = {}
): Promise<string> {
  // Default options
  const {
    onProgress = () => {},
    fileName = meditation.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() +
      "_meditation.wav",
  } = options;

  // Report initial progress
  onProgress(0);

  // Collect all steps that need audio (speech or pause)
  const audioSteps = meditation.steps.filter(
    (step) => step.type === "speech" || step.type === "pause"
  );

  if (audioSteps.length === 0) {
    throw new Error("No audio content found in this meditation.");
  }

  // Prepare audio context
  const audioContext = new AudioContext();
  const audioBuffers: AudioBuffer[] = [];

  // Process each step in sequence
  let processedSteps = 0;
  for (const step of audioSteps) {
    if (step.type === "speech" && step.audioFileId) {
      // For speech steps, load the audio file
      const storedFile = await fileStorage.getFile(step.audioFileId);
      if (!storedFile || !storedFile.data) {
        throw new Error(`Audio file not found: ${step.audioFileId}`);
      }

      // Convert to blob if needed
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

      // Create URL and load audio
      const url = URL.createObjectURL(audioBlob);
      try {
        // Load and decode audio
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers.push(audioBuffer);

        // Clean up URL after use
        URL.revokeObjectURL(url);
      } catch (error) {
        URL.revokeObjectURL(url);
        throw error;
      }
    } else if (step.type === "pause") {
      // For pause steps, create a silent buffer with the specified duration
      const sampleRate = 44100; // Standard sample rate
      const numberOfChannels = 2; // Stereo
      const pauseDuration = step.duration;
      const pauseSamples = Math.floor(pauseDuration * sampleRate);

      // Create silent buffer
      const silenceBuffer = audioContext.createBuffer(
        numberOfChannels,
        pauseSamples,
        sampleRate
      );

      // Buffer is automatically initialized with zeros (silence)
      audioBuffers.push(silenceBuffer);
    }

    // Update progress
    processedSteps++;
    onProgress((processedSteps / audioSteps.length) * 50); // First half of progress
  }

  if (audioBuffers.length === 0) {
    throw new Error("No audio content could be processed.");
  }

  // Use offline audio context to concatenate and render the final audio
  // First, calculate total length in samples
  const totalSamples = audioBuffers.reduce(
    (acc, buffer) => acc + buffer.length,
    0
  );
  const sampleRate = audioBuffers[0].sampleRate;
  const channels = audioBuffers[0].numberOfChannels;

  onProgress(50); // Signal that we're starting rendering

  const offlineAudioContext = new OfflineAudioContext(
    channels,
    totalSamples,
    sampleRate
  );

  let currentOffset = 0;
  for (const buffer of audioBuffers) {
    const source = offlineAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineAudioContext.destination);
    source.start(currentOffset);
    currentOffset += buffer.duration;
  }

  // Render the audio
  onProgress(75); // Signal that rendering is in progress
  const renderedBuffer = await offlineAudioContext.startRendering();

  // Convert combined buffer to WAV
  const wavBuffer = bufferToWav(renderedBuffer);
  const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

  // Create download URL
  const url = URL.createObjectURL(wavBlob);
  onProgress(100); // Signal that export is complete

  return url;
}

/**
 * Creates a download link for the exported audio and triggers download
 */
export function downloadAudioFile(url: string, fileName: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
  }, 100);
}

/**
 * Converts an AudioBuffer to WAV format
 */
function bufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numOfChannels * 2;
  const sampleRate = buffer.sampleRate;

  // Create the buffer for the WAV file
  const wavBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(wavBuffer);

  // Write RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, "WAVE");

  // Write fmt subchunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // subchunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numOfChannels * 2, true); // byte rate
  view.setUint16(32, numOfChannels * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // Write data subchunk
  writeString(view, 36, "data");
  view.setUint32(40, length, true);

  // Write interleaved audio data
  const offset = 44;
  let index = 0;

  // Process each sample individually, handling all channels
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numOfChannels; channel++) {
      // Get the channel data using getChannelData() and direct indexing
      const channelData = buffer.getChannelData(channel);
      const sample = Math.max(-1, Math.min(1, channelData[i]));

      // Convert float to 16-bit PCM
      const sampleValue = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset + index, sampleValue, true);
      index += 2;
    }
  }

  return wavBuffer;
}

/**
 * Helper function to write a string to a DataView
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
