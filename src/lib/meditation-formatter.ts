import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

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
type FormattedScript = z.infer<typeof FormattedScript>;
type MeditationFormatterResult = z.infer<typeof MeditationFormatter>;

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
   - Try to keep each speech text shorter than 200 characters. If a sentence is longer, split it into separate speech steps, but never split a sentence between steps.
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

// Format the meditation script
const formatMeditationScript = async (
  rawScript: string
): Promise<MeditationFormatterResult> => {
  const openai = new OpenAI();

  try {
    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      { role: "user" as const, content: rawScript },
    ];

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages,
      temperature: 0.2,
      response_format: zodResponseFormat(
        MeditationFormatter,
        "meditation_transformation"
      ),
    });

    const parsed = completion.choices[0].message.parsed;
    if (!parsed) {
      return {
        isRejected: true,
        rejectionReason: "Failed to parse meditation script",
      };
    }

    return parsed;
  } catch (error) {
    return {
      isRejected: true,
      rejectionReason: `Error processing script: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export {
  formatMeditationScript,
  type MeditationFormatterResult,
  type FormattedScript,
};
