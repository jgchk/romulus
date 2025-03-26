import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import { MediaTypeNotFoundError, MediaTypeTreeCycleError } from './errors.js'
import type { Projection } from './projection.js'
import type { MediaType } from './types.js'

export function createUpdateMediaTypeCommand(projection: Projection) {
  return function updateMediaType(
    command: UpdateMediaTypeCommand,
  ): Result<MediaTypeUpdatedEvent, MediaTypeTreeCycleError | MediaTypeNotFoundError> {
    if (!projection.mediaTypes.has(command.id)) {
      return err(new MediaTypeNotFoundError(command.id))
    }

    const cycle = checkForCycles(command, projection)
    if (cycle !== undefined) {
      return err(
        new MediaTypeTreeCycleError(
          cycle.map((id) =>
            id === command.id ? command.update.name : projection.mediaTypes.get(id)!.name,
          ),
        ),
      )
    }

    return ok(mediaTypeUpdatedEvent({ id: command.id, update: command.update }))
  }
}

export type UpdateMediaTypeCommand = {
  id: string
  update: Omit<MediaType, 'id'>
}

export type MediaTypeUpdatedEvent = {
  _tag: 'media-type-updated'
  id: string
  update: Omit<MediaType, 'id'>
}

export function mediaTypeUpdatedEvent(
  event: Omit<MediaTypeUpdatedEvent, '_tag'>,
): MediaTypeUpdatedEvent {
  return { ...event, _tag: 'media-type-updated' }
}

function checkForCycles(command: UpdateMediaTypeCommand, projection: Projection) {
  for (const parent of command.update.parents) {
    const path = hasPath(parent, command.id, projection.mediaTypes)
    if (path) {
      const cycle = [...path, command.id]
      return cycle
    }
  }
}

function hasPath(source: string, destination: string, tree: Map<string, MediaType>) {
  const visited = new Set<string>()
  const path: string[] = []

  function dfs(current: string): string[] | undefined {
    if (current === destination) {
      return [...path, current].reverse()
    }

    visited.add(current)
    path.push(current)

    const mediaType = tree.get(current)
    const parents = mediaType?.parents ?? []
    for (const parent of parents) {
      if (!visited.has(parent)) {
        const cyclePath = dfs(parent)
        if (cyclePath) {
          return cyclePath
        }
      }
    }

    path.pop()
  }

  return dfs(source)
}
