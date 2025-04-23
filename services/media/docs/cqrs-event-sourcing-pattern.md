# Pattern: CQRS with Event Sourcing

**ID:** cqrs-event-sourcing-typescript  
**Intent:** Separate read and write operations while using events as the source of truth for system state  
**Context:** Backend services requiring audit trails, complex domain logic, and high scalability  
**Keywords:** CQRS, event-sourcing, command, query, projection, result-types, functional

## Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                            Web Layer                            │
│ (HTTP routes, validation, auth, error mapping)                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Application Layer                       │
│ (Orchestration, fetching projections, persisting events)        │
└───────────┬─────────────────────────────────────┬───────────────┘
            │                                     │
            ▼                                     ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│      Command-side         │         │       Query-side          │
│ (Domain logic, validation)│         │ (Reading from projections)│
└───────────┬───────────────┘         └───────────────┬───────────┘
            │                                         │
            ▼                                         ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│      Event Store          │         │      Read Database        │
│ (Domain events, append)   │         │ (Optimized for reading)   │
└───────────────────────────┘         └───────────────────────────┘
```

## Implementation

```typescript
// 1. COMMAND SIDE: DOMAIN LAYER
// Pure business logic with validation and event creation
// No infrastructure dependencies
function createCreateMediaTypeCommandHandler(projection: MediaTypesProjection) {
  return function createMediaType(
    command: CreateMediaTypeCommand,
  ): Result<MediaTypeCreatedEvent, MediaTypeTreeCycleError | MediaTypeNotFoundError> {
    // Domain validation
    if (command.mediaType.parents.includes(command.mediaType.id)) {
      return err(new MediaTypeTreeCycleError([command.mediaType.name, command.mediaType.name]))
    }

    for (const parentId of command.mediaType.parents) {
      if (!projection.mediaTypes.has(parentId)) {
        return err(new MediaTypeNotFoundError(parentId))
      }
    }

    // Return event on success (no direct state mutation)
    return ok(mediaTypeCreatedEvent({ mediaType: command.mediaType, userId: command.userId }))
  }
}

// 2. COMMAND SIDE: APPLICATION LAYER
// Orchestrates between domain and infrastructure
function createCreateMediaTypeCommandHandler(
  getMediaTypes: () => MaybePromise<MediaTypesProjection>,
  saveEvent: (event: MediaTypeCreatedEvent) => MaybePromise<void>,
): CreateMediaTypeCommandHandler {
  return async function (command) {
    // Get current state from projection
    const mediaTypes = await getMediaTypes()

    // Execute domain logic
    const createMediaType = domain.createCreateMediaTypeCommandHandler(mediaTypes)
    const result = createMediaType(command)

    // Handle errors
    if (result.isErr()) {
      return err(result.error)
    }

    // Persist event if successful
    await saveEvent(result.value)
    return ok(undefined)
  }
}

// 3. EVENT DEFINITION
// Events as the source of truth, with typed tags
type MediaTypeCreatedEvent = {
  _tag: 'media-type-created'
  mediaType: MediaType
  userId: number
}

// 4. PROJECTION MECHANISM
// Reconstructing state from events
function applyMediaTypeEvent(
  state: MediaTypesProjection,
  event: MediaTypeEvent,
): MediaTypesProjection {
  switch (event._tag) {
    case 'media-type-created': {
      state.mediaTypes.set(event.mediaType.id, event.mediaType)
      return state
    }
    case 'media-type-deleted': {
      state.mediaTypes.delete(event.id)
      return state
    }
    // ...other event handlers
  }
}

// 5. QUERY SIDE: APPLICATION LAYER
// Reading optimized data
function createGetMediaTypeQueryHandler(db: IDrizzleConnection): GetMediaTypeQueryHandler {
  return async function getMediaType(id: string) {
    return db.query.mediaTypes
      .findFirst({
        where: (mediaTypes, { eq }) => eq(mediaTypes.id, id),
        with: {
          parents: {
            columns: {
              parentId: true,
            },
          },
        },
      })
      .then((result) => {
        if (result === undefined) return undefined
        return {
          ...result,
          parents: result.parents.map((parent) => parent.parentId),
        }
      })
  }
}
```

## Variations & Parameters

1. **Read Models**

   - Denormalized vs. Normalized projections
   - In-memory vs. Database-backed projections
   - Eager vs. Lazy projection building

2. **Event Store Implementations**

   - In-memory (for testing)
   - Relational database
   - Specialized event stores (EventStoreDB)

3. **Command Validation Approaches**

   - Early validation in web layer (input format)
   - Domain validation (business rules)
   - Optimistic concurrency control

4. **Error Handling Strategies**
   - Result types (this implementation)
   - Exceptions
   - Either monads

## Trade-offs & Consequences

**Pros:**

- Strong audit trail and history through event sourcing
- Clear separation between read and write models
- Domain logic is pure and easily testable
- Scalability through separate optimization of read and write sides
- Built-in temporal querying capabilities (time travel)

**Cons:**

- Higher complexity than traditional CRUD
- Eventual consistency challenges
- Need for specialized knowledge/patterns
- Potentially higher initial development time
- Event schema evolution can be challenging

**Pitfalls:**

- Applying too many events to rebuild a projection can be slow
- Forgetting to handle eventual consistency in UI
- Complex long-running business processes without sagas/process managers
- Too fine-grained events leading to chattiness

## Usage Examples

### Command Execution Flow

```typescript
// 1. HTTP request handling (Web Layer)
app.post('/media-types', async (req, res) => {
  const { id, name, parents } = req.body
  const userId = req.user.id

  // 2. Command execution (Application Layer)
  const result = await createMediaType({
    mediaType: { id, name, parents },
    userId,
  })

  // 3. Response mapping
  return result.match(
    () => res.status(200).json({ success: true }),
    (error) => {
      if (error instanceof MediaTypeNotFoundError) {
        return res.status(404).json({
          success: false,
          error: { name: error.name, message: error.message },
        })
      }
      // Handle other errors...
    },
  )
})

// 4. The resulting event is persisted and will update projections
// This happens inside the application layer handler
```

### Query Execution Flow

```typescript
// 1. HTTP request handling (Web Layer)
app.get('/media-types/:id', async (req, res) => {
  const { id } = req.params

  // 2. Query execution (direct from projection/database)
  const mediaType = await getMediaType(id)

  // 3. Response mapping
  if (!mediaType) {
    return res.status(404).json({
      success: false,
      error: { message: 'Media type not found' },
    })
  }

  return res.status(200).json({
    success: true,
    data: mediaType,
  })
})
```

## Metadata for Retrieval

- **Version:** 1.0
- **Maturity:** Production-ready
- **Domain Suitability:** Business applications with complex domain rules, audit requirements
- **Related Patterns:** Repository, Factory, Result Types, Dependency Injection
- **Languages/Frameworks:** TypeScript, Drizzle ORM, neverthrow (Result types)
