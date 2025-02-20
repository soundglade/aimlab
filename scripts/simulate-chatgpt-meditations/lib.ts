import { OpenAI } from "openai";
import * as fs from "fs/promises";
import * as path from "path";

export interface Response {
  prompt: string;
  response?: string | null;
  error?: string;
}

export const OPENAI_MODEL_GENERATE = "chatgpt-4o-latest";
export const OPENAI_MODEL_EXTRACT = "gpt-4o-mini";

export const SYSTEM_MESSAGE_GENERATE = `You are ChatGPT, a large language model trained by OpenAI. You are a helpful assistant designed to make users' lives easier by providing accurate, informative, and engaging responses.

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

export const SYSTEM_MESSAGE_EXTRACT = `You are a meditation script extractor. Your task is to extract ONLY the meditation script from the provided response. Remove any introductory text or closing remarks. Return ONLY the meditation script, exactly as it is written in the response. Basically you should just trim the response, by removing any introductions and following remarks. Do not alter the content of the meditation script.`;

export async function generateMeditationResponse(
  openai: OpenAI,
  introduction: string,
  prompt: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL_GENERATE,
    messages: [
      { role: "system", content: SYSTEM_MESSAGE_GENERATE },
      { role: "user", content: `${introduction}\n\n${prompt}` },
    ],
  });

  return completion.choices[0].message.content || "";
}

export async function extractMeditation(
  openai: OpenAI,
  response: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL_EXTRACT,
    messages: [
      { role: "system", content: SYSTEM_MESSAGE_EXTRACT },
      { role: "user", content: `<response>${response}</response>` },
    ],
  });

  return completion.choices[0].message.content || "";
}

export function createMarkdownContent(
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

export async function loadPersonas(): Promise<Record<string, string>> {
  const personasPath = path.join(__dirname, "personas.json");
  return JSON.parse(await fs.readFile(personasPath, "utf-8"));
}

export async function loadPrompts(): Promise<Record<string, string[]>> {
  const promptsPath = path.join(__dirname, "prompts.json");
  return JSON.parse(await fs.readFile(promptsPath, "utf-8"));
}

export async function loadResponses(personaId: string): Promise<Response[]> {
  const responsePath = path.join(__dirname, "responses", `${personaId}.json`);
  try {
    return JSON.parse(await fs.readFile(responsePath, "utf-8"));
  } catch (error) {
    return [];
  }
}

export async function saveResponses(
  personaId: string,
  responses: Response[]
): Promise<void> {
  const outputDir = path.join(__dirname, "responses");
  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${personaId}.json`);
  await fs.writeFile(outputPath, JSON.stringify(responses, null, 2));
}

export async function saveMeditation(
  personaId: string,
  promptNumber: number,
  markdownContent: string
): Promise<void> {
  const meditationsDir = path.join(__dirname, "meditations");
  await fs.mkdir(meditationsDir, { recursive: true });
  const fileName = `${personaId}-${String(promptNumber).padStart(2, "0")}.md`;
  const outputPath = path.join(meditationsDir, fileName);
  await fs.writeFile(outputPath, markdownContent);
}

export async function getMissingMeditations(): Promise<
  Array<{ personaId: string; promptNumber: number }>
> {
  const personas = await loadPersonas();
  const prompts = await loadPrompts();
  const missing: Array<{ personaId: string; promptNumber: number }> = [];

  for (const personaId of Object.keys(personas)) {
    const expectedCount = prompts[personaId].length;
    for (let i = 1; i <= expectedCount; i++) {
      const fileName = `${personaId}-${String(i).padStart(2, "0")}.md`;
      const filePath = path.join(__dirname, "meditations", fileName);
      try {
        await fs.access(filePath);
      } catch {
        missing.push({ personaId, promptNumber: i });
      }
    }
  }

  return missing;
}
