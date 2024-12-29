import { ok } from 'neverthrow'

export type DefineRelationSchemaCommand = {
  relationSchema: RelationSchema
}

type RelationSchema =
  | OneToOneRelationSchema
  | OneToManyRelationSchema
  | ManyToOneRelationSchema
  | ManyToManyRelationSchema

type OneToOneRelationSchema = {
  id: string
  name: string
  kind: 'one-to-one'
  sourceArtifactSchema: string
  targetArtifactSchema: string
}

type OneToManyRelationSchema = {
  id: string
  name: string
  kind: 'one-to-many'
  sourceArtifactSchema: string
  targetArtifactSchema: string
}

type ManyToOneRelationSchema = {
  id: string
  name: string
  kind: 'many-to-one'
  sourceArtifactSchema: string
  targetArtifactSchema: string
}

type ManyToManyRelationSchema = {
  id: string
  name: string
  kind: 'many-to-many'
  sourceArtifactSchema: string
  targetArtifactSchema: string
}

export function defineRelationSchema(command: DefineRelationSchemaCommand) {
  return ok(relationSchemaDefinedEvent({ relationSchema: command.relationSchema }))
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
