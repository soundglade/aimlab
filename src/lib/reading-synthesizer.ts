import { formatMeditationScript } from "@/lib/meditation-formatter";
import { jsonrepair } from "jsonrepair";

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

  // Helper to process a step, returns a Promise
  function processStep(index: number): Promise<void> {
    if (processedSteps.has(index)) return Promise.resolve();
    processedSteps.add(index);
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
