import type { AttributeSchema } from './attributes.js'

export type DefineRelationSchemaCommand = {
  relationSchema: RelationSchema
}

export type RelationSchema = {
  id: string
  name: string
  type: RelationSchemaType
  sourceArtifactSchema: string
  targetArtifactSchema: string
  attributes: AttributeSchema[]
}

export type RelationSchemaType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'

export function defineRelationSchema(
  command: DefineRelationSchemaCommand,
): RelationSchemaDefinedEvent {
  return relationSchemaDefinedEvent({
    relationSchema: command.relationSchema,
  })
}

export type RelationSchemaDefinedEvent = {
  kind: 'relation-schema-defined'
  relationSchema: RelationSchema
}

export function relationSchemaDefinedEvent(
  event: Omit<RelationSchemaDefinedEvent, 'kind'>,
): RelationSchemaDefinedEvent {
  return { ...event, kind: 'relation-schema-defined' }
}
