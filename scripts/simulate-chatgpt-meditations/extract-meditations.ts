import { OpenAI } from "openai";
import * as fs from "fs/promises";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

interface Response {
  prompt: string;
  response?: string | null;
  error?: string;
}

const OPENAI_MODEL = "gpt-4o-mini";
const SYSTEM_MESSAGE = `You are a meditation script extractor. Your task is to extract ONLY the meditation script from the provided response. Remove any introductory text or closing remarks. Return ONLY the meditation script, exactly as it is written in the response. Basically you should just trim the response, by removing any introductions and following remarks. Do not alter the content of the meditation script.`;

async function extractMeditation(response: string): Promise<string> {
  const openai = new OpenAI();

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_MESSAGE },
        { role: "user", content: `<response>${response}</response>` },
      ],
    });

    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error("Error extracting meditation:", error);
    throw error;
  }
}

function createMarkdownContent(
  personaId: string,
  personaIntro: string,
  prompt: string,
  meditation: string
): string {
  return `---
persona-id: ${personaId}
persona: ${personaIntro}
prompt: ${prompt}
---

${meditation}`;
}

async function main() {
  // Create output directory
  const responsesDir = path.join(__dirname, "responses");
  const meditationsDir = path.join(__dirname, "meditations");
  await fs.mkdir(meditationsDir, { recursive: true });

  // Get all response files
  const files = await fs.readdir(responsesDir);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  // Load personas
  const personasPath = path.join(__dirname, "personas.json");
  const personas = JSON.parse(await fs.readFile(personasPath, "utf-8"));

  // Process each response file
  for (const file of jsonFiles) {
    const personaId = path.basename(file, ".json");
    console.log(`Processing responses for persona: ${personaId}`);

    // Read responses
    const responsePath = path.join(responsesDir, file);
    const responses: Response[] = JSON.parse(
      await fs.readFile(responsePath, "utf-8")
    );

    // Process each response
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      if (response.response && !response.error) {
        const promptNumber = String(i + 1).padStart(2, "0");
        const fileName = `${personaId}-${promptNumber}.md`;
        console.log(`  Extracting meditation to ${fileName}`);

        try {
          const meditation = await extractMeditation(response.response);
          const markdownContent = createMarkdownContent(
            personaId,
            personas[personaId],
            response.prompt,
            meditation
          );

          // Save markdown file
          const outputPath = path.join(meditationsDir, fileName);
          await fs.writeFile(outputPath, markdownContent);

          // Simple rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`  Failed to extract meditation: ${error}`);
        }
      }
    }

    console.log(`Completed processing for ${personaId}`);
  }
}

main().catch(console.error);
