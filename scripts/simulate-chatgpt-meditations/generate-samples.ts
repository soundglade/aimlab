import { OpenAI } from "openai";
import * as dotenv from "dotenv";
import {
  Response,
  loadPersonas,
  loadPrompts,
  generateMeditationResponse,
  saveResponses,
} from "./lib";

// Load environment variables from .env file
dotenv.config();

const SAMPLE_SIZE = Infinity;

async function main() {
  const openai = new OpenAI();
  const personas = await loadPersonas();
  const prompts = await loadPrompts();

  // Process each persona
  let totalSamples = 0;
  for (const [personaId, introduction] of Object.entries(personas)) {
    if (totalSamples >= SAMPLE_SIZE) break;

    console.log(`Processing persona: ${personaId}`);
    const responses: Response[] = [];

    // Process each prompt for this persona
    for (const prompt of prompts[personaId]) {
      if (totalSamples >= SAMPLE_SIZE) break;
      totalSamples++;
      console.log(
        `  Generating response for prompt: ${prompt.substring(0, 50)}...`
      );

      try {
        const response = await generateMeditationResponse(
          openai,
          introduction,
          prompt
        );
        responses.push({
          prompt,
          response,
        });

        // Simple rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating response for ${personaId}:`, error);
        responses.push({
          prompt,
          error: error.message,
        });
      }
    }

    // Save responses for this persona
    await saveResponses(personaId, responses);
    console.log(`Saved responses for ${personaId}`);
  }
}

main().catch(console.error);
