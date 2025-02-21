import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import * as meditationFormatter from "../src/lib/meditation-formatter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const consoleUtils = {
  loadScriptSample(sampleId: string) {
    const scriptPath = path.join(
      __dirname,
      "../scripts/simulate-chatgpt-meditations/meditations",
      `${sampleId}.md`
    );
    const fileContents = fs.readFileSync(scriptPath, "utf8");
    const { content } = matter(fileContents);
    return content;
  },

  async formatScriptSample(sampleId: string) {
    const script = this.loadScriptSample(sampleId);
    return meditationFormatter.formatMeditationScript(script);
  },
};

/**
 * Initializes the console context with meditation-related utilities
 */
export const initializeConsole = (context: any) => {
  context["meditationFormatter"] = meditationFormatter;
  // Add all meditation script utilities to the context
  Object.entries(consoleUtils).forEach(([name, fn]) => {
    context[name] = fn.bind(consoleUtils);
  });
};
