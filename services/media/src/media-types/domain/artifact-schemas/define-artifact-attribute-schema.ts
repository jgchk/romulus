import { ok } from 'neverthrow'

import type { AttributeSchema } from './attributes'

export type DefineArtifactAttributeSchemaCommand = {
  artifactSchemaId: string
  attributeSchema: AttributeSchema
}

export function defineArtifactAttributeSchema(command: DefineArtifactAttributeSchemaCommand) {
  return ok(artifactAttributeSchemaDefined(command))
}

export type ArtifactAttributeSchemaDefinedEvent = {
  kind: 'artifact-attribute-schema-defined'
  artifactSchemaId: string
  attributeSchema: AttributeSchema
}

export function artifactAttributeSchemaDefined(
  event: Omit<ArtifactAttributeSchemaDefinedEvent, 'kind'>,
): ArtifactAttributeSchemaDefinedEvent {
  return { ...event, kind: 'artifact-attribute-schema-defined' }
}
