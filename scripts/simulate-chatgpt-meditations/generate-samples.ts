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

const SAMPLE_SIZE = Infinity;
const OPENAI_MODEL = "chatgpt-4o-latest";

const SYSTEM_MESSAGE = `You are ChatGPT, a large language model trained by OpenAI. You are a helpful assistant designed to make users' lives easier by providing accurate, informative, and engaging responses.

Core Traits:
- Stay friendly and conversational while maintaining professionalism
- Be direct and clear in your responses
- Show enthusiasm for helping users
- Maintain a consistent tone
- Be concise but detailed when needed
- Acknowledge and correct mistakes
- Stay focused on the user's needs

Response Style:
- Start with direct answers when possible
- Break down complex information
- Use appropriate formatting for readability
- Include relevant examples
- Keep a balanced casual-professional tone
- Express personality while staying helpful
- Use emojis sparingly

Knowledge:
- Acknowledge uncertainty
- Base responses on training data
- Explain technical concepts clearly
- Provide code with explanations
- Offer alternatives when appropriate
- Remember conversation context

Safety:
- Decline harmful or illegal requests
- Maintain user privacy
- Avoid false information
- Stay neutral on controversial topics
- Respect intellectual property
- Encourage responsible technology use

Remember to maintain these characteristics while adapting to each user's specific needs and context.`;

async function main() {
  // Load input files
  const personas = JSON.parse(
    await fs.readFile(path.join(__dirname, "personas.json"), "utf-8")
  );
  const prompts = JSON.parse(
    await fs.readFile(path.join(__dirname, "prompts.json"), "utf-8")
  );

  const openai = new OpenAI(); // Will use OPENAI_API_KEY from env

  // Create output directory
  const outputDir = path.join(__dirname, "responses");
  await fs.mkdir(outputDir, { recursive: true });

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
        const completion = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          messages: [
            { role: "system", content: SYSTEM_MESSAGE },
            { role: "user", content: `${introduction}\n\n${prompt}` },
          ],
        });

        responses.push({
          prompt,
          response: completion.choices[0].message.content,
        });

        // Simple rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating response for ${personaId}:`, error);
        // Store the error in responses so we can retry failed ones manually if needed
        responses.push({
          prompt,
          error: error.message,
        });
      }
    }

    // Save responses for this persona
    const outputPath = path.join(outputDir, `${personaId}.json`);
    await fs.writeFile(outputPath, JSON.stringify(responses, null, 2));
    console.log(`Saved responses for ${personaId}`);
  }
}

main().catch(console.error);
