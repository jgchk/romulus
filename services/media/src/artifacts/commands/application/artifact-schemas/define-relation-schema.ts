import type { AttributeSchema } from '../../domain/artifact-schemas/attributes.js'
import type { RelationSchemaType } from '../../domain/artifact-schemas/define-relation-schema.js'
import {
  defineRelationSchema,
  type RelationSchemaDefinedEvent,
} from '../../domain/artifact-schemas/define-relation-schema.js'

export type DefineRelationSchemaCommand = {
  relationSchema: {
    id: string
    name: string
    type: RelationSchemaType
    sourceArtifactSchema: string
    targetArtifactSchema: string
    attributes: AttributeSchema[]
  }
}

export type DefineRelationSchemaCommandHandler = (
  command: DefineRelationSchemaCommand,
) => Promise<void>

export function createDefineRelationSchemaCommandHandler(
  saveRelationSchemaEvent: (event: RelationSchemaDefinedEvent) => Promise<void> | void,
): DefineRelationSchemaCommandHandler {
  return async function (command: DefineRelationSchemaCommand) {
    const result = defineRelationSchema({ relationSchema: command.relationSchema })
    await saveRelationSchemaEvent(result)
  }
}
