import { formatMeditationScript } from "@/lib/meditation-formatter";
import { jsonrepair } from "jsonrepair";
import { generateSilentMp3, saveConcatenatedMp3 } from "@/lib/audio";
import fs from "fs";
import path from "path";
import { customAlphabet } from "nanoid";
import { generateSpeech } from "@/lib/speech";
import slugify from "slugify";
import type { SpeechService } from "@/lib/speech";
import { optimizeStepsForPlayer } from "./reading-timings";

interface SynthesizeReadingOptions {
  script: string;
  onData: (data: any) => void;
  signal?: AbortSignal;
  settings?: any;
  improvePauses?: boolean;
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
  settings,
  improvePauses,
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
  let startedConcatenation = false;
  let concatenationPromise: Promise<void> | null = null;
  let fullAudio: string | null = null;

  const readingDir = path.join(
    process.cwd(),
    "public",
    "storage",
    "readings",
    readingId
  );

  const pausesDir = path.join(
    process.cwd(),
    "public",
    "storage",
    "readings",
    "_pauses"
  );

  if (!fs.existsSync(readingDir)) {
    fs.mkdirSync(readingDir, { recursive: true });
  }

  if (!fs.existsSync(pausesDir)) {
    fs.mkdirSync(pausesDir, { recursive: true });
  }

  // Throttling parameters for speech steps
  const MAX_CONCURRENT_SPEECH = 2;
  let runningSpeech = 0;
  const speechQueue: (() => Promise<void>)[] = [];
  function runNextSpeech() {
    if (runningSpeech >= MAX_CONCURRENT_SPEECH) return;
    const next = speechQueue.shift();
    if (next) {
      runningSpeech++;
      next().finally(() => {
        runningSpeech--;
        runNextSpeech();
      });
    }
  }

  // Helper to process a pause step
  async function processPauseStep(index: number, step: any) {
    if (signal?.aborted) throw new Error("Aborted");
    const duration = Math.round(step.duration); // round to nearest second

    const mp3Filename = `${duration}-seconds.mp3`;
    const mp3Path = path.join(pausesDir, mp3Filename);

    // Generate file if it doesn't exist
    if (!fs.existsSync(mp3Path)) {
      await generateSilentMp3(duration, mp3Path);
    }
    stepAudioFiles[index] = `/storage/readings/_pauses/${mp3Filename}`;
    sendAugmentedData();
  }

  // Helper to process a speech step
  async function processSpeechStep(index: number, step: any) {
    if (signal?.aborted) throw new Error("Aborted");
    try {
      const text = step.text;
      if (!text) return;

      // Determine service and serviceOptions from settings
      let service: SpeechService = "selfHostedKokoro";
      let serviceOptions = undefined;
      if (settings && typeof settings === "object" && settings.service) {
        service = settings.service;
        serviceOptions = settings.serviceOptions;
      }
      const audioBuffer = await generateSpeech(
        text,
        service,
        serviceOptions,
        signal
      );

      // Generate a unique filename for this step
      const filename = randomMp3Name(text);
      const filePath = path.join(readingDir, filename);
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
    // Handle pause step (not throttled)
    if (step && step.type === "pause" && typeof step.duration === "number") {
      return processPauseStep(index, step);
    }
    // Handle speech step (throttled)
    if (step && step.type === "speech" && typeof step.text === "string") {
      // Wrap the speech step in a Promise that resolves when the throttled execution is done
      return new Promise<void>((resolve, reject) => {
        const run = async () => {
          try {
            await processSpeechStep(index, step);
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        speechQueue.push(run);
        runNextSpeech();
      });
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

      response.script.settings = settings;

      if (readyForConcatenation(response.script) && !startedConcatenation) {
        startedConcatenation = true;
        concatenationPromise = concatenateAudio(response.script);
      }

      response.script.fullAudio = fullAudio;
    }

    // Include readingId in the response
    response.readingId = readingId;

    onData(response);
  }

  async function concatenateAudio(script: any) {
    try {
      // Get all audio files from speech and pause steps

      const audioFiles = optimizeStepsForPlayer(script.steps).map(
        (s) => s.audio
      );

      // Convert relative paths to absolute paths
      const absoluteAudioPaths = audioFiles.map((audioPath: string) =>
        path.join(process.cwd(), "public", audioPath)
      );

      // Generate output filename
      const slug = slugify(script.title, { lower: true, strict: true });
      const outputFilename = `${slug}.mp3`;
      const outputPath = path.join(readingDir, outputFilename);

      // Concatenate audio files
      await saveConcatenatedMp3(absoluteAudioPaths, outputPath);

      // Set the full audio path (relative to public directory)
      fullAudio = `/storage/readings/${readingId}/${outputFilename}`;

      // Save the script as a JSON file
      const scriptFilename = `script.json`;
      const scriptPath = path.join(readingDir, scriptFilename);
      fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));

      // Update the response with the full audio path
      sendAugmentedData();
    } catch (err: any) {
      console.error("Error concatenating audio:", err);
    }
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
          const promise = processStep(idx);
          stepProcessingPromises.push(promise);
        }
      });

      sendAugmentedData();
    },
    improvePauses,
  });

  // Wait for all processing to finish before completing
  if (signal?.aborted) throw new Error("Aborted");
  await Promise.all(stepProcessingPromises);

  // Also wait for concatenation to complete if it was started
  if (concatenationPromise) {
    await concatenationPromise;
  }
}

// Helper to generate a random mp3 filename based on step text
export function randomMp3Name(stepText: string) {
  // Take the first 8 words
  const words = stepText.split(/\s+/).slice(0, 8).join(" ");
  // Use slugify for robust slug generation
  const slug = slugify(words, { lower: true, strict: true });
  // Add random number for uniqueness
  const rand = Math.floor(Math.random() * 1e9);
  return `${slug}-${rand}.mp3`;
}

function readyForConcatenation(script: any): boolean {
  // Default to false if script is not completed
  if (!script?.completed) return false;

  // Check if all steps are completed
  const allStepsCompleted = script.steps.every((step: any) => step.completed);
  if (!allStepsCompleted) return false;

  // Check if all speech and pause steps have audio ending with .mp3
  const speechAndPauseSteps = script.steps.filter(
    (step: any) => step.type === "speech" || step.type === "pause"
  );

  const allAudioSynthesized = speechAndPauseSteps.every(
    (step: any) => typeof step.audio === "string" && step.audio.endsWith(".mp3")
  );

  return allAudioSynthesized;
}
