# AIM Lab UI Components & Patterns

## Component Library

- We use shadcn/ui as our primary component library
- Install missing shadcn/ui components using `npx shadcn@canary add componentname`
- Follow the implementation patterns in existing components for consistency

## UX Guidelines

### Interface Hierarchy

- Use a single prominent call-to-action when absolutely necessary
- Secondary and tertiary actions should be visually subdued (outline or ghost buttons)
- Keep headings and labels clear: one main heading, followed by subheadings if needed

### Spacing & Alignment

- Maintain uniform spacing between elements using Tailwind's spacing scale
- Keep content and interactive elements clearly separated
- Use spacing tokens (e.g., `space-y-*`, `space-x-*`) rather than arbitrary values

### Interaction Design

- Button text should be short and descriptive (e.g., "Save," "Next," "Cancel")
- Use progressive disclosure to reveal complex options only when needed
- Keep layouts uncluttered - focus on essential components

## Styling Conventions

### Tailwind CSS Usage

- We use Tailwind CSS v4 for styling (defined in @src/styles/globals.css)
- Prefer utility classes like `p-4`, `m-2`, or `flex` to keep styling consistent
- Use responsive variants (e.g., `md:p-6`, `lg:flex`) for all screen sizes

### Color System

- **Avoid using direct color classes** - use shadcn/ui semantic classes instead (e.g., `bg-primary`)
- Make abundant use of "muted" colors for a gentler appearance
- Let shadcn/ui's design tokens handle color to ensure consistency across light/dark modes

### Component Variants

- **Default Button Variant:** Use `outline` variant for most buttons
- Only use the default variant (no variant specified) for primary calls-to-action
- Examples of primary actions: main landing page CTA, form submission, "Continue" buttons in flows
- Reuse the same component variant for the same type of action throughout the interface
