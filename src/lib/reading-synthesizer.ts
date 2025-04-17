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
  await formatMeditationScript(script, {
    stream: true,
    onToken: (token: string) => {
      accumulated += token;
      const parsed = tryRepairAndParseJSON(accumulated);
      if (parsed) {
        onData(parsed);
      }
    },
  });
}
