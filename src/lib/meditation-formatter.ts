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
   - SPECIAL: For the first speech step, make it as short as possible—ideally only the first sentence (but always keep complete sentences together; never split a sentence between steps).
   - For speech steps, do not use markdown formatting in the text; remove any markdown marks if present.
   - Try to keep each speech text shorter than 200 characters. If a sentence is longer, split it into separate speech steps, but never split a sentence between steps.
   - For silent intervals, use "pause", with an approximate "duration" in seconds.
   - For headings or titles, use "type": "heading" with the text content.
   - IMPORTANT: Do not split sentences between steps. Keep complete sentences together within the same step.
   - If the first heading in the script is identical to the title, DO NOT include it as a heading step in the steps array (to avoid repeating the title as a heading).
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

const PAUSE_IMPROVEMENT_INSTRUCTIONS = `
PAUSE IMPROVEMENT INSTRUCTIONS:
- Carefully review and improve the placement and duration of pauses in the script.
- Ensure all pauses are at least 3 seconds long; do not use shorter pauses.
- Check that there are not more than two consecutive speech steps without a pause in between. If so, add appropriate pauses to allow the text to breathe and give the listener time to reflect.
- Pay special attention to breathing exercises: if the script instructs the user to take several breaths, ensure there is a pause long enough for the user to complete them comfortably.
- Use your judgment to create a natural, thoughtful pacing. The goal is to provide enough time for the listener to absorb the guidance and have a good experience.
- Note: Use shorter pauses (min 3 seconds) to let the speech breathe, and longer pauses (min 15 seconds) for user practice or exercises. Distinguish and apply each type as needed.

PAUSE TIMING GUIDELINES:
Use the following guidelines when assigning pause durations:
- Deep breath: Use 8 seconds per deep breath (inhale + exhale).
- 4-7-8 breathing: Use 20 seconds per cycle.
- Box breathing (4-4-4-4): Use 20 seconds per round.
- Coherent breathing: Use 15 seconds per breath.
- Single breath (relaxation): Use ~10 seconds.
- Body scan transitions: Use 5-10 seconds between each body part.
- Emotional prompts (e.g., 'let go', 'welcome'): Use at least 10 seconds.
- Final integration / closing silence: Use 15–60 seconds, proportional to session length.
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
 * @param options Optional: stream (boolean) for streaming mode, onToken callback for streamed tokens, improvePauses (boolean) for improving pauses.
 * @returns MeditationFormatterResult (non-streaming) or undefined (streaming mode).
 */
const formatMeditationScript = async (
  rawScript: string,
  options?: {
    stream?: boolean;
    onToken?: (token: string) => void;
    improvePauses?: boolean;
  }
): Promise<MeditationFormatterResult | undefined> => {
  const openai = new OpenAI();

  // Helper for error result
  const errorResult = (reason: string): MeditationFormatterResult => ({
    isRejected: true,
    rejectionReason: reason,
  });

  const systemPromptWithPauses =
    SYSTEM_PROMPT +
    (options?.improvePauses ? "\n" + PAUSE_IMPROVEMENT_INSTRUCTIONS : "");

  if (options?.stream) {
    try {
      const streamingPrompt = [
        systemPromptWithPauses,
        "",
        "Here is the JSON schema you must follow:",
        schemaString,
        "",
        'IMPORTANT: For each step in the steps array, add a final field "completed": true (e.g., { type: "speech", text: "...", completed: true }).',
        "This field must be the last field in each step object.",
        'ALSO: At the end of the "script" object, add a field "completed": true, as the very last field in the script object.',
        'This "completed" field must be the last field in the script object, after all other fields (such as "title" and "steps").',
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

      let gotAnyChunk = false;
      for await (const chunk of stream) {
        gotAnyChunk = true;

        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta && options.onToken) options.onToken(delta);
      }
      if (!gotAnyChunk) {
        console.warn("Streaming mode: No chunks were received from OpenAI.");
      }
    } catch (err) {
      console.error("Error during OpenAI streaming:", err);
      throw err;
    }
    return undefined;
  }

  // Non-streaming mode (default)
  try {
    const completion = await openai.beta.chat.completions.parse({
      ...OPENAI_CHAT_CONFIG,
      messages: [
        {
          role: "system",
          content: systemPromptWithPauses,
        },
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
