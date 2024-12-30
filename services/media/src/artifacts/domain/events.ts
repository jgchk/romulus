import type { ArtifactSchemaDefinedEvent } from './artifact-schemas/define-artifact-schema'
import type { RelationSchemaDefinedEvent } from './artifact-schemas/define-relation-schema'
import type { ArtifactRegisteredEvent } from './artifacts/register-artifact'
import type { RelationRegisteredEvent } from './artifacts/register-relation'

export type ArtifactsEvent =
  | ArtifactSchemaDefinedEvent
  | RelationSchemaDefinedEvent
  | ArtifactRegisteredEvent
  | RelationRegisteredEvent
