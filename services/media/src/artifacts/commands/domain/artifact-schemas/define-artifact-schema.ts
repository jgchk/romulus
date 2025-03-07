import type { AttributeSchema } from './attributes.js'

export type DefineArtifactSchemaCommand = {
  artifactSchema: ArtifactSchema
}

export type ArtifactSchema = {
  id: string
  name: string
  attributes: AttributeSchema[]
}

export function defineArtifactSchema(
  command: DefineArtifactSchemaCommand,
): ArtifactSchemaDefinedEvent {
  return artifactSchemaDefinedEvent({
    artifactSchema: command.artifactSchema,
  })
}

export type ArtifactSchemaDefinedEvent = {
  kind: 'artifact-schema-defined'
  artifactSchema: ArtifactSchema
}

export function artifactSchemaDefinedEvent(
  event: Omit<ArtifactSchemaDefinedEvent, 'kind'>,
): ArtifactSchemaDefinedEvent {
  return { ...event, kind: 'artifact-schema-defined' }
}
