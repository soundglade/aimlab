# ChatGPT Personas and Prompts

A collection of user personas and example prompts for simulating how different users might request meditation scripts from ChatGPT.

## Script Usage

### generate-samples.ts

```bash
# Set your OpenAI API key
export OPENAI_API_KEY='your-key'

# Run the script (from project root)
npm run generate-meditations
```

The script combines each persona with their prompts to generate meditation scripts via GPT-4. Responses are saved in `responses/{persona-id}.json`.

For testing, set `SAMPLE_SIZE` (default: 1) to limit the number of generated samples.

## Files

### personas.json

```json
{
  "persona-id": "First-person description of the user...",
  "another-persona": "Another first-person description..."
}
```

Contains 20 user personas representing different types of meditation practitioners, from beginners to experts. Each persona is written in first person and reflects their unique background and relationship with meditation.

### prompts.json

```json
{
  "persona-id": [
    "Short prompt example",
    "Another prompt example",
    "Third prompt example"
  ]
}
```

Contains 3 example prompts for each persona, showing how they might request a meditation script. Prompts intentionally vary in length and specificity to reflect realistic usage patterns.

## Purpose

This data is designed to help test and simulate how different users might interact with ChatGPT. The personas focus on early adopters who are interested in both meditation and technology.
