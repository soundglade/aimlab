import { OpenAI } from "openai";
import * as dotenv from "dotenv";
import {
  getMissingMeditations,
  loadPersonas,
  loadPrompts,
  loadResponses,
  saveResponses,
  generateMeditationResponse,
  extractMeditation,
  createMarkdownContent,
  saveMeditation,
} from "./lib";

// Load environment variables from .env file
dotenv.config();

async function main() {
  const openai = new OpenAI();
  const missing = await getMissingMeditations();
  const personas = await loadPersonas();
  const prompts = await loadPrompts();

  console.log(`Found ${missing.length} missing meditations`);

  for (const { personaId, promptNumber } of missing) {
    console.log(
      `Processing ${personaId}-${String(promptNumber).padStart(2, "0")}`
    );

    // Load existing responses for this persona
    const responses = await loadResponses(personaId);
    const prompt = prompts[personaId][promptNumber - 1];

    try {
      // Generate new response
      const response = await generateMeditationResponse(
        openai,
        personas[personaId],
        prompt
      );

      // Extract meditation script
      const meditation = await extractMeditation(openai, response);

      // Update responses JSON
      responses[promptNumber - 1] = {
        prompt,
        response,
      };
      await saveResponses(personaId, responses);

      // Save markdown file
      const markdownContent = createMarkdownContent(
        personaId,
        personas[personaId],
        prompt,
        meditation
      );
      await saveMeditation(personaId, promptNumber, markdownContent);

      console.log(`  Successfully regenerated meditation`);

      // Simple rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  Failed to regenerate meditation:`, error);
      // Update responses JSON with error
      responses[promptNumber - 1] = {
        prompt,
        error: error.message,
      };
      await saveResponses(personaId, responses);
    }
  }
}

main().catch(console.error);
