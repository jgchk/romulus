import type { RecordOf } from 'immutable'
import { Map } from 'immutable'
import { Record } from 'immutable'

import type {
  ArtifactSchema,
  ArtifactSchemaDefinedEvent,
} from '../domain/artifact-schemas/define-artifact-schema'
import type {
  RelationSchema,
  RelationSchemaDefinedEvent,
} from '../domain/artifact-schemas/define-relation-schema'
import type { Artifact, ArtifactRegisteredEvent } from '../domain/artifacts/register-artifact'
import type { Relation, RelationRegisteredEvent } from '../domain/artifacts/register-relation'

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

type ArtifactsEvent =
  | ArtifactSchemaDefinedEvent
  | RelationSchemaDefinedEvent
  | ArtifactRegisteredEvent
  | RelationRegisteredEvent
