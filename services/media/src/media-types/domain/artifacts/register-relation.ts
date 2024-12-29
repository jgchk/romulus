import { err, ok } from 'neverthrow'

import type { AttributeSchema } from '../artifact-schemas/attributes'
import { IncorrectAttributeTypeError, InvalidRelationError, MissingAttributeError } from '../errors'
import { checkAttributeType } from './attributes'

export type RegisterRelationCommand = {
  schema: {
    id: string
    sourceArtifactSchema: string
    targetArtifactSchema: string
    attributes: Pick<AttributeSchema, 'id' | 'type'>[]
  }
  sourceArtifact: { id: string; schema: string }
  targetArtifact: { id: string; schema: string }
  attributes: { id: string; value: unknown }[]
}

export function registerRelation(command: RegisterRelationCommand) {
  if (
    command.sourceArtifact.schema !== command.schema.sourceArtifactSchema ||
    command.targetArtifact.schema !== command.schema.targetArtifactSchema
  ) {
    return err(
      new InvalidRelationError(
        {
          sourceSchema: command.schema.sourceArtifactSchema,
          targetSchema: command.schema.targetArtifactSchema,
        },
        {
          sourceSchema: command.sourceArtifact.schema,
          targetSchema: command.targetArtifact.schema,
        },
      ),
    )
  }

  for (const attributeSchema of command.schema.attributes) {
    const attribute = command.attributes.find((attribute) => attribute.id === attributeSchema.id)
    if (attribute === undefined) {
      return err(new MissingAttributeError(attributeSchema.id))
    }

    const isAttributeTypeValid = checkAttributeType(attribute.value, attributeSchema.type)
    if (!isAttributeTypeValid) {
      return err(
        new IncorrectAttributeTypeError(attribute.id, attributeSchema.type, attribute.value),
      )
    }
  }

  return ok(
    relationRegisteredEvent({
      relation: {
        schema: command.schema.id,
        sourceArtifact: command.sourceArtifact.id,
        targetArtifact: command.targetArtifact.id,
        attributes: command.attributes,
      },
    }),
  )
}

export type RelationRegisteredEvent = {
  kind: 'relation-registered'
  relation: {
    schema: string
    sourceArtifact: string
    targetArtifact: string
    attributes: { id: string; value: unknown }[]
  }
}

export function relationRegisteredEvent(
  event: Omit<RelationRegisteredEvent, 'kind'>,
): RelationRegisteredEvent {
  return { ...event, kind: 'relation-registered' }
}
