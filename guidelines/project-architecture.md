# AIM Lab Project Architecture

## Project Structure

- **@src/pages/**: Next.js pages directory containing all route components (using Pages Router)
  - **@src/pages/admin/**: Admin dashboard and management interfaces
  - **@src/pages/playground/**: Interactive playground features
  - Dynamic routes should use [param].tsx files in the pages directory
- **@src/components/**: Reusable UI components
- **@src/styles/**: Global styles and CSS modules
- **@src/lib/**: Utility functions and shared logic

## File Naming Conventions

- Use kebab-case for all file names (e.g., `user-profile.tsx`, `data-visualization.css`)
- Component files should be named after their primary function (e.g., `user-card.tsx`, `data-table.tsx`)
- Utility files should be named descriptively based on their purpose (e.g., `format-date.ts`, `api-helpers.ts`)

## Routing

- We use Next.js Pages Router (not App Router)
- Dynamic routes should be created using [param].tsx naming convention
- Example: For a route like /rila/123, create src/pages/rila/[id].tsx
- Keep route handling logic in the pages directory, component logic in components directory
- Implement contextual navigation that aligns with our floating aesthetic

## Code Conventions

### Architectural Patterns

- Prefer functional programming patterns over classes
- Use pure functions and immutable data structures when possible
- Separate business logic from presentation components

### Implementation Notes

- Follow the floating aesthetic principles when implementing navigation
- Implement contextual UI that appears when needed rather than fixed elements
- Create components that support the laboratory-inspired, experimental design philosophy
