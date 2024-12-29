import { ok } from 'neverthrow'

import type { AttributeSchema } from './attributes'

export type DefineRelationAttributeSchemaCommand = {
  relationSchemaId: string
  attributeSchema: AttributeSchema
}

export function defineRelationAttributeSchema(command: DefineRelationAttributeSchemaCommand) {
  return ok(relationAttributeSchemaDefined(command))
}

export type RelationAttributeSchemaDefined = {
  kind: 'relation-attribute-schema-defined'
  relationSchemaId: string
  attributeSchema: AttributeSchema
}

export function relationAttributeSchemaDefined(
  event: Omit<RelationAttributeSchemaDefined, 'kind'>,
): RelationAttributeSchemaDefined {
  return { ...event, kind: 'relation-attribute-schema-defined' }
}
