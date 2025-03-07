import type { ArtifactSchemaDefinedEvent } from './artifact-schemas/define-artifact-schema.js'
import type { RelationSchemaDefinedEvent } from './artifact-schemas/define-relation-schema.js'
import type { ArtifactRegisteredEvent } from './artifacts/register-artifact.js'
import type { RelationRegisteredEvent } from './artifacts/register-relation.js'

export type ArtifactsEvent =
  | ArtifactSchemaDefinedEvent
  | RelationSchemaDefinedEvent
  | ArtifactRegisteredEvent
  | RelationRegisteredEvent
