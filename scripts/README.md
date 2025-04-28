# Scripts Guide

This directory contains one-off and utility scripts for the project. Use this guide as a reference for creating, organizing, and running scripts in a consistent way.

## Directory Structure

- Each script or script suite lives in its own subfolder under `scripts/`.
- Example:
  ```
  scripts/
    kokoro-sampler/
      generate-samples.ts
    simulate-chatgpt-meditations/
      generate-samples.ts
      extract-meditations.ts
      lib.ts
      README.md
  ```

## Script Conventions

- **Language:** Scripts are written in TypeScript.
- **Execution:** Use [`tsx`](https://github.com/esbuild-kit/tsx) to run scripts (see below).
- **Imports:**

  - Use relative imports to reference code from `src/` (e.g., `import { foo } from "../../src/lib/foo"`).

## How to Create a New Script

1. **Create a Subfolder:**
   - Make a new directory under `scripts/` for your script or script suite.
2. **Write the Script:**
   - Create a `.ts` file (e.g., `my-script.ts`).
   - Follow the conventions above.
   - If you need helpers, add a `lib.ts` in the same folder.
3. **Document:**
   - Add a `README.md` in your script's folder if it needs extra explanation or usage notes.
4. **Add to package.json (optional):**
   - For frequently used scripts, add a shortcut in the `scripts` section of `package.json`.

## How to Run a Script

From the project root, use:

```
npx tsx scripts/<subfolder>/<script>.ts
```

Some scripts may have shortcuts in `package.json`, e.g.:

```
npm run generate-meditations
```
