# Romulus

A genre classification and media categorization platform built with a modular monolith architecture

## Project Structure

This monorepo contains:

- **Frontend**: SvelteKit application with Tailwind CSS
- **Backend**: Node.js backend services
- **Services**:
  - Authentication: User accounts and API keys
  - Authorization: Permission management
  - Genres: Genre classification and relationships
  - Media: Media type categorization and artifact relationships
  - User Settings: User preferences storage

## Development

### Prerequisites

- Node.js 18+
- pnpm
- Docker and Docker Compose (for local database)

### Setup

```bash
# Install dependencies
pnpm install

# Start local database
pnpm db:start

# Start all services in development mode
pnpm dev
```

When running locally, a default administrator account will be created automatically with:

- Username: `admin`
- Password: `admin`

This account has all available permissions for testing purposes.

## Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @romulus/genres test
```

## Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @romulus/frontend build
```
