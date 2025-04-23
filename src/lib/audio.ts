import { Meditation } from "@/components/types";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import os from "os";
import path from "path";
const fsPromises = fs.promises;

const FFMPEG_PATH = process.env.FFMPEG_PATH || "/usr/bin/ffmpeg";
const FFPROBE_PATH = process.env.FFPROBE_PATH || "/usr/bin/ffprobe";

ffmpeg.setFfmpegPath(FFMPEG_PATH);
ffmpeg.setFfprobePath(FFPROBE_PATH);

/**
 * Concatenates audio buffers into a single MP3 file based on a meditation timeline.
 * @param audioBuffers - Map of audio buffer data indexed by step.
 * @param timeline - Timeline describing the sequence and duration of audio and pauses.
 * @param onProgress - Optional callback for progress updates (0-100).
 * @param highQualitySilence - Optional flag to generate high-quality silence segments (44.1kHz, 128kbps) instead of default low-quality.
 * @returns Promise resolving to a Buffer containing the MP3 audio.
 */
export async function createConcatenatedAudio(
  audioBuffers: Map<number, ArrayBuffer>,
  timeline: NonNullable<Meditation["timeline"]>,
  onProgress = (progress: number) => {}
): Promise<Buffer> {
  const { timings } = timeline;

  // Create a temporary directory for segment files
  const tmpDir = await fsPromises.mkdtemp(
    path.join(os.tmpdir(), "concatenate-audio-")
  );
  const segmentFiles: string[] = [];

  // Generate segment files for speech and silence
  for (let i = 0; i < timings.length; i++) {
    const timing = timings[i];
    onProgress((i / timings.length) * 100);
    const segmentPath = path.join(tmpDir, `segment-${i}.mp3`);
    if (timing.type === "speech") {
      const rawBuffer = audioBuffers.get(timing.index);
      if (rawBuffer) {
        // Write WAV buffer and transcode to MP3
        const wavPath = path.join(tmpDir, `segment-${i}.wav`);
        await fsPromises.writeFile(wavPath, Buffer.from(rawBuffer));
        await new Promise<void>((resolve, reject) => {
          ffmpeg(wavPath)
            .audioCodec("libmp3lame")
            .audioBitrate("128k")
            .audioChannels(1)
            .on("error", reject)
            .on("end", resolve)
            .save(segmentPath);
        });
        segmentFiles.push(segmentPath);
      }
    } else if (timing.type === "pause" || timing.type === "gap") {
      await generateSilentMp3(timing.durationMs / 1000, segmentPath);
      segmentFiles.push(segmentPath);
    }
  }

  // Write ffmpeg concat list file
  const listFile = path.join(tmpDir, "concat-list.txt");
  const listContent = segmentFiles
    .map((f) => "file '" + f.replace(/'/g, "\\'") + "'")
    .join("\n");
  await fsPromises.writeFile(listFile, listContent);

  // Output concatenated file
  const outputPath = path.join(tmpDir, "output.mp3");

  // Run ffmpeg concat
  return new Promise<Buffer>((resolve, reject) => {
    ffmpeg()
      .input(listFile)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions([
        "-c:a",
        "libmp3lame",
        "-b:a",
        "128k",
        "-ar",
        "44100",
        "-ac",
        "1",
      ])
      .on("error", async (err) => {
        await fsPromises.rm(tmpDir, { recursive: true, force: true });
        reject(err);
      })
      .on("end", async () => {
        try {
          const data = await fsPromises.readFile(outputPath);
          await fsPromises.rm(tmpDir, { recursive: true, force: true });
          onProgress(100);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      })
      .save(outputPath);
  });
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
  const frequency = 8000;
  const bitrate = "8k";
  const channels = 1;
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input("/dev/zero")
      .inputFormat("s16le")
      .audioFrequency(frequency)
      .audioChannels(channels)
      .duration(seconds)
      .audioCodec("libmp3lame")
      .audioBitrate(bitrate)
      .output(outPath)
      .on("error", reject)
      .on("end", resolve)
      .run();
  });
}
