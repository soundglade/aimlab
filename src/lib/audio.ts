import { Meditation } from "@/components/types";
import { OfflineAudioContext } from "web-audio-engine";
import * as lamejs from "@breezystack/lamejs";

/**
 * Creates a concatenated audio file from individual audio buffers based on a meditation timeline
 */
export async function createConcatenatedAudio(
  audioBuffers: Map<number, ArrayBuffer>,
  timeline: NonNullable<Meditation["timeline"]>,
  onProgress = (progress: number) => {}
): Promise<Buffer> {
  const { timings, totalDurationMs } = timeline;

  // Create audio context
  const audioContext = new OfflineAudioContext(
    2,
    Math.ceil((totalDurationMs * 44100) / 1000),
    44100
  );

  let currentTime = 0;

  // Process each timing
  for (let i = 0; i < timings.length; i++) {
    const timing = timings[i];
    onProgress((i / timings.length) * 100);

    if (timing.type === "speech") {
      // Get the audio buffer for this step
      const rawBuffer = audioBuffers.get(timing.index);
      if (rawBuffer) {
        // Decode the audio data
        const audioBuffer = await audioContext.decodeAudioData(rawBuffer);

        // Create source node
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Connect to destination
        const gain = audioContext.createGain();
        gain.gain.value = 1.0;
        source.connect(gain);
        gain.connect(audioContext.destination);

        // Schedule playback
        source.start(currentTime);
        currentTime += audioBuffer.duration;
      }
    } else if (timing.type === "pause" || timing.type === "gap") {
      // For pauses and gaps, just advance the time
      currentTime += timing.durationMs / 1000;
    }
  }

  // Render the audio
  const renderedBuffer = await audioContext.startRendering();

  // Get audio samples from rendered buffer
  const channels = renderedBuffer.numberOfChannels;
  const sampleRate = renderedBuffer.sampleRate;

  // Convert to MP3 buffer directly
  const mp3Data: Buffer[] = [];
  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);

  // For stereo, we need to work with both channels
  const left = new Int16Array(renderedBuffer.length);
  const right = channels > 1 ? new Int16Array(renderedBuffer.length) : null;

  // Get samples from each channel
  const leftChannel = renderedBuffer.getChannelData(0);
  const rightChannel = channels > 1 ? renderedBuffer.getChannelData(1) : null;

  // Convert Float32Array [-1.0, 1.0] to Int16Array [-32768, 32767]
  for (let i = 0; i < renderedBuffer.length; i++) {
    // Audio from Float32 [-1.0, 1.0] to Int16 [-32768, 32767]
    left[i] = Math.max(-1, Math.min(1, leftChannel[i])) * 0x7fff;
    if (right && rightChannel) {
      right[i] = Math.max(-1, Math.min(1, rightChannel[i])) * 0x7fff;
    }
  }

  // Process in chunks to avoid memory issues
  const sampleBlockSize = 1152; // Must be a multiple of 576 for optimal encoding
  for (let i = 0; i < left.length; i += sampleBlockSize) {
    const leftChunk = left.subarray(i, i + sampleBlockSize);
    const rightChunk = right ? right.subarray(i, i + sampleBlockSize) : null;

    let mp3Chunk;
    if (channels > 1 && rightChunk) {
      mp3Chunk = mp3encoder.encodeBuffer(leftChunk, rightChunk);
    } else {
      mp3Chunk = mp3encoder.encodeBuffer(leftChunk);
    }

    if (mp3Chunk.length > 0) {
      // Convert Int8Array to Buffer
      mp3Data.push(Buffer.from(new Uint8Array(mp3Chunk)));
    }
  }

  // Get the final chunk and add it
  const finalChunk = mp3encoder.flush();
  if (finalChunk.length > 0) {
    // Convert Int8Array to Buffer
    mp3Data.push(Buffer.from(new Uint8Array(finalChunk)));
  }

  // Concatenate all chunks into a single buffer
  return Buffer.concat(mp3Data);
}
