import { OpenAI } from "openai";
import * as dotenv from "dotenv";
import {
  Response,
  loadPersonas,
  loadResponses,
  extractMeditation,
  createMarkdownContent,
  saveMeditation,
} from "./lib";

// Load environment variables from .env file
dotenv.config();

async function main() {
  const openai = new OpenAI();
  const personas = await loadPersonas();

  // Get all response files
  for (const personaId of Object.keys(personas)) {
    console.log(`Processing responses for persona: ${personaId}`);

    // Read responses
    const responses = await loadResponses(personaId);

    // Process each response
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      if (response.response && !response.error) {
        const promptNumber = i + 1;
        const fileName = `${personaId}-${String(promptNumber).padStart(
          2,
          "0"
        )}.md`;
        console.log(`  Extracting meditation to ${fileName}`);

        try {
          const meditation = await extractMeditation(openai, response.response);
          const markdownContent = createMarkdownContent(
            personaId,
            personas[personaId],
            response.prompt,
            meditation
          );

          // Save markdown file
          await saveMeditation(personaId, promptNumber, markdownContent);

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
