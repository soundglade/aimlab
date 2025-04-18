import { formatMeditationScript } from "@/lib/meditation-formatter";
import { jsonrepair } from "jsonrepair";
import { generateSilenceWav } from "@/lib/audio";
import fs from "fs";
import path from "path";
import { customAlphabet } from "nanoid";
import { generateSpeech } from "@/lib/speech";
import slugify from "slugify";

interface SynthesizeReadingOptions {
  script: string;
  onData: (data: any) => void;
  signal?: AbortSignal;
}

function tryRepairAndParseJSON(text: string) {
  try {
    // Remove anything before the first '{' (since the output is a JSON object)
    const jsonStart = text.indexOf("{");
    if (jsonStart === -1) return null;
    const cleanedOutput = text.slice(jsonStart);
    // Clean up ending backticks if present
    const finalOutput = cleanedOutput.replace(/\]\s*[`]+$/, "]");

    const repairedJson = jsonrepair(finalOutput);
    return JSON.parse(repairedJson);
  } catch {
    return null;
  }
}

export async function synthesizeReading({
  script,
  onData,
  signal,
}: SynthesizeReadingOptions) {
  // Generate a unique reading id for this session
  const generateReadingId = customAlphabet(
    "0123456789abcdefghijklmnopqrstuvwxyz",
    7
  );
  const readingId = generateReadingId();

  let accumulated = "";
  const processedSteps = new Set<number>();
  const stepAudioFiles: string[] = [];
  const stepProcessingPromises: Promise<void>[] = [];

  let response: any = null;
  let steps: any[] = [];

  // Helper to process a pause step
  function processPauseStep(index: number, step: any) {
    if (signal?.aborted) throw new Error("Aborted");
    const duration = Math.round(step.duration); // round to nearest second
    const pausesDir = path.join(
      process.cwd(),
      "public",
      "storage",
      "readings",
      "_pauses"
    );
    const wavFilename = `${duration}-seconds.wav`;
    const wavPath = path.join(pausesDir, wavFilename);
    // Ensure pauses directory exists
    if (!fs.existsSync(pausesDir)) {
      fs.mkdirSync(pausesDir, { recursive: true });
    }
    // Generate file if it doesn't exist
    if (!fs.existsSync(wavPath)) {
      generateSilenceWav(wavPath, duration);
    }
    stepAudioFiles[index] = `/storage/readings/_pauses/${wavFilename}`;
    sendAugmentedData();
  }

  // Helper to process a speech step
  async function processSpeechStep(index: number, step: any) {
    if (signal?.aborted) throw new Error("Aborted");
    try {
      const text = step.text;
      if (!text) return;
      // Synthesize speech using kokoro
      const audioBuffer = await generateSpeech(
        text,
        "selfHostedKokoro",
        undefined,
        signal
      );

      // Ensure output directory exists
      const speechDir = path.join(
        process.cwd(),
        "public",
        "storage",
        "readings",
        readingId
      );
      if (!fs.existsSync(speechDir)) {
        fs.mkdirSync(speechDir, { recursive: true });
      }
      // Generate a unique filename for this step
      const filename = randomMp3Name(text);
      const filePath = path.join(speechDir, filename);
      fs.writeFileSync(filePath, Buffer.from(audioBuffer));
      // Store the public path
      stepAudioFiles[index] = `/storage/readings/${readingId}/${filename}`;
      sendAugmentedData();
    } catch (err: any) {
      // Suppress abort-related errors (we log cancellation upstream)
      const isAbortError =
        (err instanceof Error && err.name === "AbortError") ||
        err?.message === "Aborted";
      if (!isAbortError) {
        console.error("Error in processSpeechStep:", err);
      }
    }
  }

  // Helper to process a step, returns a Promise
  function processStep(index: number): Promise<void> {
    if (signal?.aborted) return Promise.reject(new Error("Aborted"));
    if (processedSteps.has(index)) return Promise.resolve();
    processedSteps.add(index);
    const step = steps[index];
    // Handle pause step
    if (step && step.type === "pause" && typeof step.duration === "number") {
      processPauseStep(index, step);
      return Promise.resolve();
    }
    // Handle speech step
    if (step && step.type === "speech" && typeof step.text === "string") {
      const promise = processSpeechStep(index, step);
      stepProcessingPromises.push(promise);
      return promise;
    }
    // Unknown step type: skip
    return Promise.resolve();
  }

  // Helper to augment steps with audio if available and call onData
  function sendAugmentedData() {
    if (signal?.aborted) return;
    if (response?.script?.steps) {
      response.script.steps = steps.map((step: any, idx: number) => {
        if (stepAudioFiles[idx]) {
          return { ...step, audio: stepAudioFiles[idx] };
        }
        return step;
      });
    }

    onData(response);
  }

  await formatMeditationScript(script, {
    stream: true,
    onToken: (token: string) => {
      if (signal?.aborted) throw new Error("Aborted");
      accumulated += token;
      response = tryRepairAndParseJSON(accumulated);
      steps = response?.script?.steps || [];

      steps.forEach((step: any, idx: number) => {
        if (step.completed === true && !processedSteps.has(idx)) {
          processStep(idx);
        }
      });

      sendAugmentedData();
    },
  });

  // Wait for all processing to finish before completing
  if (signal?.aborted) throw new Error("Aborted");
  await Promise.all(stepProcessingPromises);
}

// Helper to generate a random mp3 filename based on step text
function randomMp3Name(stepText: string) {
  // Take the first 8 words
  const words = stepText.split(/\s+/).slice(0, 8).join(" ");
  // Use slugify for robust slug generation
  const slug = slugify(words, { lower: true });
  // Add random number for uniqueness
  const rand = Math.floor(Math.random() * 1e9);
  return `${slug}-${rand}.mp3`;
}
