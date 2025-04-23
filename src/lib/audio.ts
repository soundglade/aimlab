import { Meditation } from "@/components/types";
import { OfflineAudioContext } from "web-audio-engine";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const FFMPEG_PATH = process.env.FFMPEG_PATH || "/usr/bin/ffmpeg";
const FFPROBE_PATH = process.env.FFPROBE_PATH || "/usr/bin/ffprobe";

ffmpeg.setFfmpegPath(FFMPEG_PATH);
ffmpeg.setFfprobePath(FFPROBE_PATH);

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
 * Generates a silent MP3 file of the given duration (in seconds).
 * @param seconds - Duration of silence in seconds.
 * @param outPath - The output filename for the MP3 file.
 * @returns Promise that resolves when the file is created.
 */
export function generateSilentMp3(
  seconds: number,
  outPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input("/dev/zero")
      .inputFormat("s16le")
      .audioFrequency(8000)
      .audioChannels(1)
      .duration(seconds)
      .audioCodec("libmp3lame")
      .audioBitrate("8k")
      .output(outPath)
      .on("error", reject)
      .on("end", resolve)
      .run();
  });
}
