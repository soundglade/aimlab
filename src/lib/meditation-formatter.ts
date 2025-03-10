import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

// Schemas
const HeadingStep = z.object({
  type: z.literal("heading"),
  text: z.string(),
  level: z.enum(["1", "2", "3"]).transform((val) => parseInt(val, 10)),
  readAloud: z.boolean(),
});

const SpeechStep = z.object({
  type: z.literal("speech"),
  text: z.string(),
});

const PauseStep = z.object({
  type: z.literal("pause"),
  duration: z.number(),
  canExtend: z.boolean(),
  waitForUserInput: z.boolean(),
});

const SoundStep = z.object({
  type: z.literal("sound"),
  soundId: z.string(),
  description: z.string().optional(),
});

const AsideStep = z.object({
  type: z.literal("aside"),
  text: z.string(),
});

const DirectionStep = z.object({
  type: z.literal("direction"),
  text: z.string(),
});

const MeditationStep = z.discriminatedUnion("type", [
  HeadingStep,
  SpeechStep,
  PauseStep,
  SoundStep,
  AsideStep,
  DirectionStep,
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
     (like branching storylines, or other advanced features not supported) is mandatory 
     and can't be approximated, we must reject the script.
   - If the script is invalid or not feasible, respond with: 
       { "isRejected": true, "rejectionReason": "some reason" }
     and DO NOT provide any "script".
3) TRANSFORMATION STAGE:
   - If the script is valid, transform it into a structured format with:
     * A concise title that represents the meditation
     * An array of steps with these possible types:
       "heading", "speech", "pause", "sound", "aside", "direction"
   - For each piece of user-facing guidance, use "speech".
   - For silent intervals, use "pause", with an approximate "duration" in seconds. 
     Mark if it can be extended ("canExtend": boolean) or must wait for user input ("waitForUserInput": boolean).
   - For headings or titles, use "type": "heading" with:
     * "level": 1 for the main title (h1) - there should never be more than one
     * "level": 2 for section headings (h2)
     * "level": 3 for subsection headings (h3)
     * "readAloud": true/false as desired
   - If there's a mention of a bell or chime, use "sound" type with "soundId" and optional "description".
   - For teacher-only notes or advanced instructions that shouldn't be spoken, use "aside".
   - For performance or voice instructions, use "direction".
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

// Post-refinement function to clean up the formatted meditation
const refineResult = (
  result: MeditationFormatterResult
): MeditationFormatterResult => {
  if (!result.isRejected && result.script) {
    removeEmojisFromSpeech(result.script);
  }

  return result;
};

const removeEmojisFromSpeech = (script: FormattedScript) => {
  script.steps = script.steps.map((step) => {
    if (step.type === "speech") {
      // Regex to remove all emojis
      step.text = step.text.replace(/[\p{Emoji}]/gu, "");
      // Clean up any double spaces that might result from emoji removal
      step.text = step.text.replace(/\s+/g, " ").trim();
    }
    return step;
  });
};

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
      model: "gpt-4o-mini",
      messages,
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

    return refineResult(parsed);
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
