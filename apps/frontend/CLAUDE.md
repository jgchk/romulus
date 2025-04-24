# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Check code style and types
- `pnpm lint:fix` - Fix code style issues
- `pnpm check` - Run svelte-check for type checking
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run all tests
- `pnpm test:unit` - Run unit tests once
- `pnpm test:unit:watch` - Run tests in watch mode
- `vitest run src/path/to/file.test.ts` - Run a single test file

## Code Style Guidelines

- **TypeScript**: Strict mode enabled, use proper type annotations
- **Formatting**: Prettier for consistent formatting
- **Imports**: Use simple-import-sort plugin ordering
- **Components**: Use Svelte 5 runes ($props, $state) for component props and state
- **Error Handling**: Use neverthrow Result objects for error handling
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Testing**: Use Vitest and @testing-library/svelte
- **Framework**: SvelteKit for routing and SSR
- **CSS**: Tailwind for styling
