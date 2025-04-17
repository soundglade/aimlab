import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Schemas
const HeadingStep = z.object({
  type: z.literal("heading"),
  text: z.string(),
});

const SpeechStep = z.object({
  type: z.literal("speech"),
  text: z.string(),
});

const PauseStep = z.object({
  type: z.literal("pause"),
  duration: z.number(),
});

const MeditationStep = z.discriminatedUnion("type", [
  HeadingStep,
  SpeechStep,
  PauseStep,
]);

const FormattedScript = z.object({
  title: z.string(),
  steps: z.array(MeditationStep),
});

const MeditationFormatter = z
  .object({
    isRejected: z.boolean(),
    rejectionReason: z.string().optional(),
    warnings: z.array(z.string()).optional(),
    script: FormattedScript.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRejected) {
      if (!data.rejectionReason) {
        ctx.addIssue({
          code: "custom",
          message: "rejectionReason is required when isRejected is true",
        });
      }
    } else {
      if (!data.warnings) {
        ctx.addIssue({
          code: "custom",
          message: "warnings is required when isRejected is false",
        });
      }
      if (!data.script) {
        ctx.addIssue({
          code: "custom",
          message: "script is required when isRejected is false",
        });
      }
    }
  });

// Types for TypeScript
// Grouped after schema definitions for clarity

type FormattedScript = z.infer<typeof FormattedScript>;
type MeditationFormatterResult = z.infer<typeof MeditationFormatter>;

// Convert Zod schema to JSON Schema for prompt
const meditationFormatterJsonSchema = zodToJsonSchema(MeditationFormatter);
const schemaString = JSON.stringify(meditationFormatterJsonSchema, null, 2);

// The system prompt as a constant
const SYSTEM_PROMPT = `
You are a specialized AI that validates and transforms meditation scripts into a structured JSON format.

Steps to follow:
1) Carefully read the user-provided meditation script.
2) VALIDATION STAGE:
   - Check if this is indeed a meditation script or if it includes content that cannot be supported 
     (e.g., extremely vague or purely theoretical text that can't be turned into guided instructions).
   - Check if we can transform its features into the supported JSON format. If any core aspect 
     is mandatory and can't be approximated, we must reject the script.
   - If the script is invalid or not feasible, respond with: 
       { "isRejected": true, "rejectionReason": "some reason" }
     and DO NOT provide any "script".
3) TRANSFORMATION STAGE:
   - If the script is valid, transform it into a structured format with:
     * A concise title that represents the meditation
     * An array of steps with these possible types:
       "heading", "speech", "pause"
   - For each piece of user-facing guidance, use "speech".
   - Try to keep each speech text shorter than 180 characters. If a sentence is longer, split it into separate speech steps, but never split a sentence between steps.
   - For silent intervals, use "pause", with an approximate "duration" in seconds.
   - For headings or titles, use "type": "heading" with the text content.
   - IMPORTANT: Do not split sentences between steps. Keep complete sentences together within the same step.
   - If some parts of the script can't be handled perfectly, produce them in the nearest workable format 
     AND add a note in the "warnings" array.
4) OUTPUT:
   - Return a valid JSON matching the schema:
     {
       "isRejected": false,
       "warnings": [ "string", ... ],
       "script": {
         "title": "Concise meditation title",
         "steps": [ ... array of step objects ... ]
       }
     }
   - Or, if rejected, return:
     {
       "isRejected": true,
       "rejectionReason": "some reason"
     }

Return NOTHING else, no extra commentary. Output MUST be valid JSON conforming to the schema.
`;

// OpenAI chat config for both streaming and non-streaming calls
const OPENAI_CHAT_CONFIG = {
  model: "gpt-4o",
  temperature: 0.2,
};

/**
 * Formats a meditation script using OpenAI, returning a structured result or streaming tokens.
 *
 * @param rawScript The raw meditation script to format.
 * @param options Optional: stream (boolean) for streaming mode, onToken callback for streamed tokens.
 * @returns MeditationFormatterResult (non-streaming) or undefined (streaming mode).
 */
const formatMeditationScript = async (
  rawScript: string,
  options?: {
    stream?: boolean;
    onToken?: (token: string) => void;
  }
): Promise<MeditationFormatterResult | undefined> => {
  const openai = new OpenAI();

  // Helper for error result
  const errorResult = (reason: string): MeditationFormatterResult => ({
    isRejected: true,
    rejectionReason: reason,
  });

  try {
    if (options?.stream) {
      // Streaming mode: forwards deltas to onToken; no accumulation or validation.
      const streamingPrompt = [
        SYSTEM_PROMPT,
        "",
        "Here is the JSON schema you must follow:",
        schemaString,
        "",
        'IMPORTANT: For each step in the steps array, add a final field "completed": true (e.g., { type: "speech", text: "...", completed: true }).',
        "This field must be the last field in each step object.",
      ].join("\n");
      const stream = await openai.beta.chat.completions.stream({
        ...OPENAI_CHAT_CONFIG,
        messages: [
          { role: "system", content: streamingPrompt },
          { role: "user", content: rawScript },
        ],
        response_format: { type: "json_object" },
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta && options.onToken) options.onToken(delta);
      }
      return undefined;
    }

    // Non-streaming mode (default)
    const completion = await openai.beta.chat.completions.parse({
      ...OPENAI_CHAT_CONFIG,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: rawScript },
      ],
      response_format: zodResponseFormat(
        MeditationFormatter,
        "meditation_transformation"
      ),
    });

    const parsed = completion.choices[0].message.parsed;
    if (!parsed) {
      return errorResult("Failed to parse meditation script");
    }
    return parsed;
  } catch (error) {
    return errorResult(
      `Error processing script: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export {
  formatMeditationScript,
  type MeditationFormatterResult,
  type FormattedScript,
};
