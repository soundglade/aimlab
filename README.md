<h1 align="center">AIM Lab</h1>
<h3 align="center">The AI Meditation Playground</h3>
<p align="center">An open-source project exploring the intersection of AI and meditation practices.</p>

<p align="center">
  <b>Visit the Live Website:</b> <a href="https://aimlab.soundglade.com/">https://aimlab.soundglade.com/</a>
</p>

## Demo

<p align="center">
  <video src="./public/assets/demo.mp4" controls="controls" muted="muted" style="max-width:800px;">
  </video>
</p>

## Tech Stack

- Next.js
- Tailwind CSS v4
- shadcn/ui Components

## Current Tools

### Meditation Composer

Generate guided meditations from scripts created by AI language models like ChatGPT. Simply paste your meditation script and transform it into a guided meditation.

## Project Structure

- `/src/pages` - Next.js pages and API routes
- `/src/components` - Reusable UI components
- `/src/styles` - Global styles and CSS modules
- `/src/lib` - Utility functions and shared logic

- `/console` - Development REPL environment and utilities
- `/docs` - Documentation for the project
- `/scripts` - On-off utility scripts for various project tasks
- `/tests` - Unit and manual tests

### Scripts

The `/scripts` directory contains utility scripts for various project tasks. Currently includes:

- `/scripts/simulate-chatgpt-meditations` - A tool for generating AI-powered meditation scripts
  - Uses various personas to generate meditation content
  - Includes tools for processing and managing the generated content

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

The application uses a custom Express.js server that:

- Serves the Next.js application
- Handles static files from the `public` directory with dynamic reloading in development

### Console

The project includes a REPL environment for development and debugging. You can run it in two modes:

```bash
npm run console  # Interactive REPL session
npm run exec    # Single command execution
```

For detailed documentation about the console and its utilities, see [console/README.md](console/README.md).

## Testing

The project uses Vitest for unit and integration testing.

### Running Tests

```bash
npm test        # Run all tests once
npm run test:watch  # Run tests in watch mode (rerun on file changes)
```

### Test Structure

- `/tests/unit/` - Unit tests for individual components and functions
- `/tests/setup.ts` - Global test setup and configuration

## License

This project is open-source and available under the MIT license.
