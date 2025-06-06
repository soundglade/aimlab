import {
  generateSpeech,
  fetchVoices,
} from "../../src/lib/services/self-hosted-kokoro";
import * as fs from "fs/promises";
import * as path from "path";

// Polyfill fetch for Node.js if needed
// @ts-ignore
if (typeof fetch === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  globalThis.fetch = require("node-fetch");
}

const SELF_HOSTED_KOKORO_URL =
  process.env.SELF_HOSTED_KOKORO_URL || "http://localhost:8880";

const SAMPLE_TEXT =
  "Find a comfortable sitting position, whether on a chair, cushion, or directly on the ground. Allow your body to settle into this space, feeling supported by the earth beneath you.";
const OUTPUT_DIR = path.resolve(".tmp/kokoro-samples");

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  let voices: string[] = [];
  try {
    voices = await fetchVoices();
    console.log(`Fetched ${voices.length} voices.`);
  } catch (error) {
    console.error("Failed to fetch voices:", error);
    process.exit(1);
  }

  for (const voice of voices) {
    const outputPath = path.join(OUTPUT_DIR, `${voice}.mp3`);
    console.log(`Generating sample for voice: ${voice}`);
    try {
      // Use the generateSpeech function, overriding the voice
      const response = await fetch(
        SELF_HOSTED_KOKORO_URL + "/v1/audio/speech",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "kokoro",
            input: SAMPLE_TEXT,
            voice,
            response_format: "mp3",
          }),
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to generate speech: ${response.status} ${response.statusText}`
        );
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(outputPath, buffer);
      console.log(`Saved sample: ${outputPath}`);
    } catch (error) {
      console.error(`Error generating sample for ${voice}:`, error);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
