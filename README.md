# AI Meditation Lab (AIM Lab)

An open-source project exploring the intersection of AI and meditation practices.

## Current Experiments

### RILA

Generate guided meditations from scripts created by AI language models like ChatGPT. Simply paste your meditation script and transform it into a guided meditation.

For more details see [src/components/rila/README.md](src/components/rila/README.md).

## Project Structure

### Web Areas

- **Public Website** - The main public-facing website accessible to all users

  - Contains public experiments like RILA
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
- `/tests` - Unit and integration tests

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

### Testing Philosophy

Our testing approach follows these principles:

1. **Focus on meaningful tests** - We prioritize tests that verify actual functionality rather than implementation details.
2. **Avoid redundant tests** - We don't write tests that verify the same thing multiple ways.
3. **Test real behavior** - We prefer testing against real implementations rather than using mocks when possible.
4. **Keep tests simple** - Tests should be easy to understand and maintain.
5. **Test edge cases** - We focus on testing boundary conditions and error cases that are likely to occur.

### Testing Browser APIs in Node.js

For components that use browser APIs (like IndexedDB), we use polyfills to enable testing in Node.js:

- `fake-indexeddb` - Provides a full implementation of the IndexedDB API for testing
- Our test setup automatically configures these polyfills

### Writing Tests

Tests are written using Vitest and React Testing Library. Example:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MyComponent from "@/components/MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
```

## Tech Stack

- Next.js
- Tailwind CSS v4
- shadcn/ui Components

## License

This project is open-source and available under the MIT license.
