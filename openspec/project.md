# Project Context

## Purpose
Romulus is a genre classification and media categorization platform. It provides a structured system for organizing music genres with hierarchical relationships (parents, derived-from, influences) and allows users to vote on genre relevance.

## Tech Stack

### Frontend
- **Framework**: SvelteKit with Svelte 5 (using runes: $props, $state, $derived)
- **Styling**: TailwindCSS with tailwind-merge for class composition
- **State Management**: TanStack Query (svelte-query) for server state
- **Forms**: sveltekit-superforms with Zod validation
- **UI Components**: Custom component library in `src/lib/atoms/`

### Backend
- **Framework**: Hono (lightweight Node.js web framework)
- **Runtime**: Node.js with tsx for development
- **API Validation**: Zod with @hono/zod-validator and @hono/zod-openapi

### Database
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (with PGlite for testing)
- **Migrations**: drizzle-kit

### Shared
- **Language**: TypeScript (strict mode)
- **Error Handling**: neverthrow Result types for functional error handling
- **Logging**: Pino
- **Monorepo**: pnpm workspaces + Turborepo

### Testing
- **Test Runner**: Vitest
- **Component Testing**: @testing-library/svelte
- **User Interactions**: @testing-library/user-event
- **DOM Environment**: happy-dom / jsdom

## Project Conventions

### Code Style
- **Formatting**: Prettier with 100 char width, single quotes, no semicolons
- **Imports**: simple-import-sort plugin for consistent ordering
- **Type Imports**: Separate type imports (`import type { X } from ...`)
- **Type Definitions**: Prefer `type` over `interface`
- **Naming**: PascalCase for components/classes, camelCase for functions/variables
- **Svelte**: Always use `button-has-type` rule (explicit button types)

### Architecture Patterns
The project uses a **modular monolith** with **clean/hexagonal architecture**:

```
services/<service>/src/
├── domain/           # Business logic, entities, repository interfaces
├── application/      # Use cases, commands, orchestration
│   └── commands/     # Individual command classes
├── infrastructure/   # Repository implementations (Drizzle), external services
└── web/              # HTTP routes, clients, middleware
```

**Key patterns**:
- **Commands**: Each use case is a class with an `execute()` method
- **Repositories**: Interfaces in domain, implementations in infrastructure
- **Result Types**: Use neverthrow for explicit error handling (no thrown exceptions)
- **Dependency Injection**: Constructor injection for repositories and services

### Testing Strategy
- **Unit Tests**: Colocated with source files (`*.test.ts`)
- **Commands**: Run `pnpm test:unit` or `pnpm test:unit <path>` for specific tests
- **Coverage**: Available via @vitest/coverage-v8
- **Mocking**: Test utilities in `src/test/` directories

### Git Workflow
- **Commit Convention**: Conventional commits (feat:, fix:, refactor:, style:, chore:, perf:, docs:)
- **CI**: GitHub Actions for build, lint, and test validation
- **PRs**: Required for merging to main

## Domain Context

### Core Entities
- **Genre**: Has name, type (TREND/SCENE/STYLE/META/MOVEMENT), descriptions, and relevance
- **Genre Relationships**: Parents, derived-from, influences (hierarchical and influence graphs)
- **Genre History**: Tracks all changes with operation type (CREATE/UPDATE/DELETE)
- **Relevance Votes**: Users vote on genre relevance (aggregated into genre relevance score)

### Services
- **Authentication**: User accounts and API keys
- **Authorization**: Permission-based access control
- **Genres**: Genre CRUD, relationships, history, and relevance voting
- **Media**: Media type categorization and artifact relationships
- **User Settings**: User preferences storage

## Important Constraints
- Always run `pnpm lint` after changes to catch type errors and style issues
- Always run `pnpm test:unit <path>` for modified files
- Use neverthrow Results instead of throwing exceptions for expected errors
- NSFW content flagging must be maintained for genres

## External Dependencies
- **PostgreSQL**: Primary data store (Docker Compose for local development)
- **PGlite**: Embedded PostgreSQL for testing (no external database needed)
