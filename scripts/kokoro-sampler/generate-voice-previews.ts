import dotenv from "dotenv";
dotenv.config();

import { generateSpeech } from "../../src/lib/services/self-hosted-kokoro";
import { VOICES } from "../../src/components/instant/voice-select";
import { generateSilentMp3, saveConcatenatedMp3 } from "../../src/lib/audio";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Polyfill fetch for Node.js if needed
// @ts-ignore
if (typeof fetch === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  globalThis.fetch = require("node-fetch");
}

const SAMPLE_TEXT =
  "Find a comfortable sitting position, whether on a chair, cushion, or directly on the ground. Allow your body to settle into this space, feeling supported by the earth beneath you. Take a moment to gently close your eyes or lower your gaze, preparing for a journey inward.";

const SILENCE_DURATION_SECONDS = 2;
const PUBLIC_DIR = path.resolve("public");

/**
 * Split text into sentences, handling various sentence endings
 */
function splitIntoSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Get the duration of an audio file in seconds using ffprobe
 */
async function getAudioDuration(filePath: string): Promise<number> {
  try {
    const ffprobePath = process.env.FFPROBE_PATH || "/usr/bin/ffprobe";
    const { stdout } = await execAsync(
      `"${ffprobePath}" -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.warn(`Could not get duration for ${filePath}:`, error);
    return 0;
  }
}

async function main() {
  console.log(`Generating voice previews for ${VOICES.length} voices...`);

  // Split the sample text into sentences
  const sentences = splitIntoSentences(SAMPLE_TEXT);
  console.log(`Sample text split into ${sentences.length} sentences`);
  console.log(
    "Sentences:",
    sentences.map((s, i) => `${i + 1}: "${s}"`)
  );

  // Ensure the assets directory exists
  const assetsDir = path.join(PUBLIC_DIR, "assets");
  await fs.mkdir(assetsDir, { recursive: true });

  for (const voice of VOICES) {
    console.log(`Generating preview for ${voice.name} (${voice.id})...`);

    try {
      // Create a temporary directory for this voice's segments
      const tmpDir = await fs.mkdtemp(
        path.join(os.tmpdir(), `voice-preview-${voice.id}-`)
      );

      const segmentPaths: string[] = [];

      try {
        // Generate each sentence as a separate MP3 file
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i];
          console.log(
            `  Generating sentence ${i + 1}/${sentences.length} for ${
              voice.name
            }: "${sentence}"`
          );

          // Generate speech for this sentence
          const audioBuffer = await generateSpeech(sentence, {
            voiceId: voice.id,
          });

          // Save sentence audio to temporary file
          const sentenceFile = path.join(tmpDir, `sentence-${i}.mp3`);
          const buffer = Buffer.from(audioBuffer);
          await fs.writeFile(sentenceFile, buffer);
          segmentPaths.push(sentenceFile);

          // Get and log the duration of the sentence audio
          const sentenceDuration = await getAudioDuration(sentenceFile);
          console.log(
            `    Added sentence file: ${path.basename(
              sentenceFile
            )} (${sentenceDuration.toFixed(2)}s)`
          );

          // Add silence after this sentence (except for the last one)
          if (i < sentences.length - 1) {
            const silenceFile = path.join(tmpDir, `silence-${i}.mp3`);
            const silenceDuration = SILENCE_DURATION_SECONDS + i; // Increase by 1 second for each silence
            console.log(
              `    Generating ${silenceDuration}s silence: ${path.basename(
                silenceFile
              )}`
            );
            await generateSilentMp3(silenceDuration, silenceFile);

            // Verify the silence file was created and has content
            const silenceStats = await fs.stat(silenceFile);
            const actualSilenceDuration = await getAudioDuration(silenceFile);
            console.log(`    Silence file size: ${silenceStats.size} bytes`);

            segmentPaths.push(silenceFile);
            console.log(
              `    Added silence file: ${path.basename(
                silenceFile
              )} (expected: ${silenceDuration}s, actual: ${actualSilenceDuration.toFixed(
                2
              )}s)`
            );
          }
        }

        // Log the final segment order
        console.log(`  Final segment order for ${voice.name}:`);
        segmentPaths.forEach((segmentPath, index) => {
          console.log(`    ${index + 1}. ${path.basename(segmentPath)}`);
        });

        // Convert previewFile path to actual file path
        // previewFile is like "/assets/grace-voice-sample.mp3"
        // We need to save to "public/assets/grace-voice-sample.mp3"
        const fileName = path.basename(voice.previewFile);
        const outputPath = path.join(assetsDir, fileName);

        // Concatenate all segments into the final preview file
        console.log(
          `  Concatenating ${segmentPaths.length} segments for ${voice.name}...`
        );

        // Verify all segment files exist before concatenation and calculate total expected duration
        let totalExpectedDuration = 0;
        for (const segmentPath of segmentPaths) {
          const stats = await fs.stat(segmentPath);
          const duration = await getAudioDuration(segmentPath);
          totalExpectedDuration += duration;
          console.log(
            `    Segment ${path.basename(segmentPath)}: ${
              stats.size
            } bytes, ${duration.toFixed(2)}s`
          );
        }
        console.log(
          `    Total expected duration: ${totalExpectedDuration.toFixed(2)}s`
        );

        await saveConcatenatedMp3(segmentPaths, outputPath);

        // Verify the final output file
        const finalStats = await fs.stat(outputPath);
        const finalDuration = await getAudioDuration(outputPath);
        console.log(
          `    Final output: ${finalStats.size} bytes, ${finalDuration.toFixed(
            2
          )}s`
        );
        console.log(
          `    Duration comparison - Expected: ${totalExpectedDuration.toFixed(
            2
          )}s, Actual: ${finalDuration.toFixed(2)}s, Difference: ${Math.abs(
            totalExpectedDuration - finalDuration
          ).toFixed(2)}s`
        );

        console.log(`✓ Saved ${voice.name} preview: ${outputPath}`);
      } finally {
        // Cleanup temporary directory
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`✗ Error generating preview for ${voice.name}:`, error);
    }
  }

  console.log("Voice preview generation complete!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
