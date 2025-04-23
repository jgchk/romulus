# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

- Build: `pnpm build`
- Lint: `pnpm lint`
- Format: `pnpm format`
- Run all tests: `pnpm test`
- Run tests in watch mode: `pnpm test:unit:watch`
- Run a single test: `pnpm test:unit path/to/test.ts`
- Run a specific test with pattern: `pnpm test:unit -t "test description"`
- Database migration: `pnpm db:generate`

## Code Style Guidelines

- TypeScript with strict mode and ESM modules
- Max line length: 100 characters
- Single quotes, no semicolons
- Use Result<T, E> from neverthrow for error handling
- CustomError from @romulus/custom-error for error types
- Consistent naming: camelCase for variables/functions, PascalCase for classes/types
- Use type-safe patterns with proper typing
- Follow CQRS/Event Sourcing architecture (see `docs/cqrs-event-sourcing-pattern.md` for more details)
- Imports ordering: external libraries first, then internal modules
- Prefer absolute imports with .js extension
- Use Drizzle ORM for database operations
- Tests alongside implementation files
