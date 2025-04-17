import { formatMeditationScript } from "@/lib/meditation-formatter";
import { jsonrepair } from "jsonrepair";
import { generateSilenceWav } from "@/lib/audio";
import fs from "fs";
import path from "path";

interface SynthesizeReadingOptions {
  script: string;
  onData: (data: any) => void;
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
}: SynthesizeReadingOptions) {
  let accumulated = "";
  const processedSteps = new Set<number>();
  const stepAudioFiles: string[] = [];
  const stepProcessingPromises: Promise<void>[] = [];

  let response: any = null;
  let steps: any[] = [];

  // Helper to process a pause step
  function processPauseStep(index: number, step: any) {
    const duration = Math.round(step.duration); // round to nearest second
    const pausesDir = path.join(
      process.cwd(),
      "public",
      "storage",
      "readings",
      "pauses"
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
    stepAudioFiles[index] = `/storage/readings/pauses/${wavFilename}`;
    sendAugmentedData();
  }

  // Helper to process a step, returns a Promise
  function processStep(index: number): Promise<void> {
    if (processedSteps.has(index)) return Promise.resolve();
    processedSteps.add(index);
    const step = steps[index];
    // Handle pause step
    if (step && step.type === "pause" && typeof step.duration === "number") {
      processPauseStep(index, step);
      return Promise.resolve();
    }
    const delay = 1000 + Math.random() * 2000; // 1-3 seconds
    const promise = new Promise<void>((resolve) => {
      setTimeout(() => {
        const audioFile = randomMp3Name();
        stepAudioFiles[index] = audioFile;
        sendAugmentedData();
        resolve();
      }, delay);
    });
    stepProcessingPromises.push(promise);
    return promise;
  }

  // Helper to augment steps with audio if available and call onData
  function sendAugmentedData() {
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
  await Promise.all(stepProcessingPromises);
}

// Helper to generate a random mp3 filename
function randomMp3Name() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let name = "";
  for (let i = 0; i < 12; i++)
    name += chars[Math.floor(Math.random() * chars.length)];
  return `${name}.mp3`;
}
