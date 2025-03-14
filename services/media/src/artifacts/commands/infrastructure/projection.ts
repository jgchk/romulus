import type { RecordOf } from 'immutable'
import { Map } from 'immutable'
import { Record } from 'immutable'

import type { ArtifactSchema } from '../domain/artifact-schemas/define-artifact-schema.js'
import type { RelationSchema } from '../domain/artifact-schemas/define-relation-schema.js'
import type { Artifact } from '../domain/artifacts/register-artifact.js'
import type { Relation } from '../domain/artifacts/register-relation.js'
import type { ArtifactsEvent } from '../domain/events.js'

export type ArtifactsProjection = {
  get(): ArtifactsProjectionState
  applyEvent(event: ArtifactsEvent): void
}

export function createArtifactsProjection(): ArtifactsProjection {
  let projectionState = createInitialState()

  return {
    get() {
      return projectionState
    },

    applyEvent(event: ArtifactsEvent) {
      projectionState = applyEvent(event, projectionState)
    },
  }
}

function createInitialState(): ArtifactsProjectionState {
  return Record<ArtifactsProjectionStateProps>({
    artifactSchemas: Map(),
    relationSchemas: Map(),
    artifacts: Map(),
    relations: Map(),
  })()
}

function applyEvent(
  event: ArtifactsEvent,
  state: ArtifactsProjectionState,
): ArtifactsProjectionState {
  switch (event.kind) {
    case 'artifact-schema-defined':
      return state.set(
        'artifactSchemas',
        state.artifactSchemas.set(event.artifactSchema.id, event.artifactSchema),
      )
    case 'relation-schema-defined':
      return state.set(
        'relationSchemas',
        state.relationSchemas.set(event.relationSchema.id, event.relationSchema),
      )
    case 'artifact-registered':
      return state.set('artifacts', state.artifacts.set(event.artifact.id, event.artifact))
    case 'relation-registered':
      return state.set('relations', state.relations.set(event.relation.id, event.relation))
  }
}

type ArtifactsProjectionState = RecordOf<ArtifactsProjectionStateProps>

type ArtifactsProjectionStateProps = {
  artifactSchemas: Map<string, ArtifactSchema>
  relationSchemas: Map<string, RelationSchema>
  artifacts: Map<string, Artifact>
  relations: Map<string, Relation>
}
