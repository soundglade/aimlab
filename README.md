# AI Meditation Lab (AIM Lab)

An open-source project exploring the intersection of AI and meditation practices.

## Current Experiments

### NADA

Generate guided meditations from scripts created by AI language models like ChatGPT. Simply paste your meditation script and transform it into a guided meditation.

## Project Structure

### Web Areas

- **Public Website** - The main public-facing website accessible to all users

  - Contains public experiments like NADA
  - Available at the root URL
  - Features a modern, user-friendly interface

- **Admin Area** (`/admin`) - Password-protected administrative interface

  - Accessible via `/admin`
  - Features a structured layout with a sidebar navigation
  - Uses a hierarchical routing system with pages and subpages
  - Follows the pattern: `/admin/[section]/[subsection]`

- **Playground** (`/playground`) - Password-protected experimental area
  - Accessible via `/playground`
  - Features a modular layout with sidebar navigation
  - Organized into experiment sections with nested pages
  - Follows the pattern: `/playground/[experiment]/[feature]`

### Core Directories

- `/src/pages` - Next.js pages and API routes
- `/src/components` - Reusable UI components
- `/src/styles` - Global styles and CSS modules
- `/src/lib` - Utility functions and shared logic

- `/console` - Development REPL environment and utilities
- `/docs` - Documentation for the project
- `/scripts` - On-off utility scripts for various project tasks

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

### Console

The project includes a REPL environment for development and debugging. You can run it in two modes:

```bash
npm run console  # Interactive REPL session
npm run exec    # Single command execution
```

For detailed documentation about the console and its utilities, see [console/README.md](console/README.md).

## Tech Stack

- Next.js
- Tailwind CSS v4
- shadcn/ui Components

## License

This project is open-source and available under the MIT license.
