import { Meditation } from "../Nada";
import { FileStorageApi } from "@/lib/file-storage";
import { Buffer } from "buffer";
import * as meditationTimeline from "./meditationTimeline";
import { getAudioBlob } from "./audioUtils";

/**
 * Exports a meditation as a single audio file, including speech and pauses
 */
export async function exportMeditationAudio(
  meditation: Meditation,
  fileStorage: FileStorageApi,
  options: {
    onProgress?: (progress: number) => void;
    fileName?: string;
    returnBlob?: boolean;
  } = {}
): Promise<string | Blob> {
  // Default options
  const {
    onProgress = () => {},
    fileName = meditation.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() +
      "_meditation.wav",
    returnBlob = false,
  } = options;

  // Report initial progress
  onProgress(0);

  // Ensure the meditation has timeline information
  const meditationWithTimeline = meditation.timeline
    ? meditation
    : meditationTimeline.addTimelineToMeditation(meditation);

  if (
    !meditationWithTimeline.timeline ||
    meditationWithTimeline.timeline.timings.length === 0
  ) {
    throw new Error("No audio content found in this meditation.");
  }

  // Prepare audio context and process all timings
  const audioContext = new AudioContext();
  const audioBuffers = await processTimings(
    meditationWithTimeline,
    audioContext,
    fileStorage,
    onProgress
  );

  // Render the final audio file
  const wavBlob = await renderFinalAudio(audioBuffers, onProgress);

  // Return the blob if requested
  if (returnBlob) {
    return wavBlob;
  }

  // Otherwise create and return a URL
  const url = URL.createObjectURL(wavBlob);
  return url;
}

/**
 * Process all timings from the meditation timeline and create corresponding AudioBuffers
 */
async function processTimings(
  meditation: Meditation,
  audioContext: AudioContext,
  fileStorage: FileStorageApi,
  onProgress: (progress: number) => void
): Promise<AudioBuffer[]> {
  const audioBuffers: AudioBuffer[] = [];
  const timings = meditation.timeline!.timings;
  let processedTimings = 0;

  for (const timing of timings) {
    try {
      if (timing.isGap) {
        // Create a silence buffer for gaps
        const silenceBuffer = createSilenceBuffer(
          audioContext,
          timing.durationMs / 1000
        );
        audioBuffers.push(silenceBuffer);
      } else if (timing.type === "speech") {
        // Process speech with audio file
        const step = meditation.steps[timing.index];
        if (step.audioFileId) {
          const audioBuffer = await processSpeechStep(
            step,
            audioContext,
            fileStorage
          );
          audioBuffers.push(audioBuffer);
        }
      } else if (timing.type === "pause") {
        // Create silence for pauses
        const step = meditation.steps[timing.index];
        const durationInSeconds = (step.durationMs || timing.durationMs) / 1000;
        const silenceBuffer = createSilenceBuffer(
          audioContext,
          durationInSeconds
        );
        audioBuffers.push(silenceBuffer);
      } else if (timing.type === "sound" && timing.index >= 0) {
        // Handle sound steps if they have audio files
        const step = meditation.steps[timing.index];
        if (step.audioFileId) {
          const audioBuffer = await processSpeechStep(
            step,
            audioContext,
            fileStorage
          );
          audioBuffers.push(audioBuffer);
        } else if (step.durationMs) {
          // If no audio file but has duration, create silence
          const silenceBuffer = createSilenceBuffer(
            audioContext,
            step.durationMs / 1000
          );
          audioBuffers.push(silenceBuffer);
        }
      }
    } catch (error) {
      console.error(`Error processing timing at index ${timing.index}:`, error);
      // Continue with next timing instead of failing the whole export
    }

    // Update progress
    processedTimings++;
    onProgress((processedTimings / timings.length) * 50); // First half of progress
  }

  if (audioBuffers.length === 0) {
    throw new Error("No audio content could be processed.");
  }

  return audioBuffers;
}

/**
 * Process a speech step by loading and decoding its audio file
 */
async function processSpeechStep(
  step: Meditation["steps"][number],
  audioContext: AudioContext,
  fileStorage: FileStorageApi
): Promise<AudioBuffer> {
  const storedFile = await fileStorage.getFile(step.audioFileId!);
  if (!storedFile || !storedFile.data) {
    throw new Error(`Audio file not found: ${step.audioFileId}`);
  }

  // Convert to blob if needed
  const audioBlob = getAudioBlob(storedFile.data, "audio/mp3");

  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    throw new Error(
      `Failed to decode audio: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Create a silent buffer with the specified duration
 */
function createSilenceBuffer(
  audioContext: AudioContext,
  durationInSeconds: number
): AudioBuffer {
  const sampleRate = 44100; // Standard sample rate
  const numberOfChannels = 2; // Stereo
  const pauseSamples = Math.floor(durationInSeconds * sampleRate);

  // Create silent buffer (automatically initialized with zeros/silence)
  return audioContext.createBuffer(numberOfChannels, pauseSamples, sampleRate);
}

/**
 * Render the final audio from the collection of audio buffers
 */
async function renderFinalAudio(
  audioBuffers: AudioBuffer[],
  onProgress: (progress: number) => void
): Promise<Blob> {
  // Calculate total length in samples
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

  onProgress(100); // Signal that export is complete

  return wavBlob;
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
