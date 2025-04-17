import { Meditation } from "@/components/types";
import { OfflineAudioContext } from "web-audio-engine";
import fs from "fs";

/**
 * Concatenates audio buffers into a single MP3 file based on a meditation timeline.
 * @param audioBuffers - Map of audio buffer data indexed by step.
 * @param timeline - Timeline describing the sequence and duration of audio and pauses.
 * @param onProgress - Optional callback for progress updates (0-100).
 * @returns Promise resolving to a Buffer containing the MP3 audio.
 */
export async function createConcatenatedAudio(
  audioBuffers: Map<number, ArrayBuffer>,
  timeline: NonNullable<Meditation["timeline"]>,
  onProgress = (progress: number) => {}
): Promise<Buffer> {
  const { timings, totalDurationMs } = timeline;

  const { Mp3Encoder } = await import("@breezystack/lamejs");

  // Create an offline audio context for rendering
  const audioContext = new OfflineAudioContext(
    2,
    Math.ceil((totalDurationMs * 44100) / 1000),
    44100
  );

  let currentTime = 0;

  // Schedule each timeline event
  for (let i = 0; i < timings.length; i++) {
    const timing = timings[i];
    onProgress((i / timings.length) * 100);

    if (timing.type === "speech") {
      // Decode and schedule speech audio
      const rawBuffer = audioBuffers.get(timing.index);
      if (rawBuffer) {
        const audioBuffer = await audioContext.decodeAudioData(rawBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        const gain = audioContext.createGain();
        gain.gain.value = 1.0;
        source.connect(gain);
        gain.connect(audioContext.destination);
        source.start(currentTime);
        currentTime += audioBuffer.duration;
      }
    } else if (timing.type === "pause" || timing.type === "gap") {
      // Advance time for pauses/gaps
      currentTime += timing.durationMs / 1000;
    }
  }

  // Render the scheduled audio
  const renderedBuffer = await audioContext.startRendering();

  const channels = renderedBuffer.numberOfChannels;
  const sampleRate = renderedBuffer.sampleRate;

  // Prepare MP3 encoder
  const mp3Data: Buffer[] = [];
  const mp3encoder = new Mp3Encoder(channels, sampleRate, 128);

  // Convert rendered audio to Int16 samples
  const left = new Int16Array(renderedBuffer.length);
  const right = channels > 1 ? new Int16Array(renderedBuffer.length) : null;
  const leftChannel = renderedBuffer.getChannelData(0);
  const rightChannel = channels > 1 ? renderedBuffer.getChannelData(1) : null;

  for (let i = 0; i < renderedBuffer.length; i++) {
    left[i] = Math.max(-1, Math.min(1, leftChannel[i])) * 0x7fff;
    if (right && rightChannel) {
      right[i] = Math.max(-1, Math.min(1, rightChannel[i])) * 0x7fff;
    }
  }

  // Encode audio in blocks to MP3
  const sampleBlockSize = 1152;
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
      mp3Data.push(Buffer.from(new Uint8Array(mp3Chunk)));
    }
  }

  // Add any remaining MP3 data
  const finalChunk = mp3encoder.flush();
  if (finalChunk.length > 0) {
    mp3Data.push(Buffer.from(new Uint8Array(finalChunk)));
  }

  // Return the concatenated MP3 buffer
  return Buffer.concat(mp3Data);
}

/**
 * Generates a silent WAV file of the given duration (in seconds).
 * @param filename - The output filename for the WAV file.
 * @param durationSeconds - Duration of silence in seconds.
 * @param sampleRate - Sample rate in Hz (default: 44100).
 */
export function generateSilenceWav(
  filename: string,
  durationSeconds: number,
  sampleRate = 44100
) {
  const numSamples = durationSeconds * sampleRate;
  const headerSize = 44;
  const dataSize = numSamples * 2; // 16-bit PCM
  const buffer = Buffer.alloc(headerSize + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
  buffer.writeUInt16LE(1, 22); // NumChannels
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  // Data is already zeroed (silence)

  fs.writeFileSync(filename, buffer);
}
