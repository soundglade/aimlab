# ChatGPT Personas and Prompts

This project simulates how various users might request guided meditation scripts from ChatGPT using OpenAI's API. It facilitates generation of responses, extraction of guided meditations, and regeneration of any missing outputs.

## Overview

The project comprises three main scripts:

1. **generate-samples.ts**

   - **Purpose:** Combines each persona's introduction with multiple prompts (three per persona) to generate initial responses using ChatGPT (chatgpt-4o-latest).
   - **Output:** Stores responses as JSON files (one per persona) in the `responses/` directory.

2. **extract-meditations.ts**

   - **Purpose:** Reads the JSON responses and uses a secondary OpenAI call (GPT-4o-mini) to extract the guided meditation script from each response.
   - **Output:** Saves each extracted meditation as a Markdown file (named `<persona-id>-<number>.md`) in the `meditations/` directory. Each file includes YAML front matter with:
     - `persona-id`: The persona identifier.
     - `persona`: The full introduction.
     - `prompt`: The original prompt.

3. **regenerate-missing.ts**
   - **Purpose:** Identifies missing Markdown files (based on the expected number of prompts) and regenerates them by re-calling OpenAI.
   - **Output:** Updates the corresponding JSON response and creates the missing Markdown file(s).

## Script Usage

### Prerequisites

Create a `.env` file in the project root with your OpenAI API key:

```bash
OPENAI_API_KEY=your-key-here
```

### Commands

- **Generate initial responses:**

  ```bash
  npm run generate-meditations
  ```

  Processes each persona and prompt, storing outputs in `responses/`.

- **Extract meditation scripts:**

  ```bash
  npm run extract-meditations
  ```

  Reads the JSON responses, extracts guided meditations, and writes them as Markdown files in `meditations/`.

- **Regenerate missing meditations:**
  ```bash
  npm run regenerate-missing
  ```
  Checks for missing Markdown files (based on expected prompt count) and regenerates them.

## Project Structure

- **personas.json:** Contains persona IDs with full introductions.
- **prompts.json:** Contains three prompts for each persona.
- **responses/:** Directory where generated responses (JSON files) are saved.
- **meditations/:** Directory where extracted guided meditations (Markdown files with YAML front matter) are saved.
- **lib.ts:** Shared library with common functions and configurations.
- **generate-samples.ts:** Generates initial responses.
- **extract-meditations.ts:** Extracts and formats guided meditation scripts.
- **regenerate-missing.ts:** Identifies and regenerates missing entries.
