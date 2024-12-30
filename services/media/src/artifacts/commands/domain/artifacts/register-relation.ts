import type { Result } from 'neverthrow'
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
  relation: {
    id: string
    sourceArtifact: { id: string; schema: string }
    targetArtifact: { id: string; schema: string }
    attributes: { id: string; value: unknown }[]
  }
}

export type Relation = {
  id: string
  schema: string
  sourceArtifact: string
  targetArtifact: string
  attributes: { id: string; value: unknown }[]
}

export function registerRelation(
  command: RegisterRelationCommand,
): Result<
  RelationRegisteredEvent,
  InvalidRelationError | MissingAttributeError | IncorrectAttributeTypeError
> {
  if (
    command.relation.sourceArtifact.schema !== command.schema.sourceArtifactSchema ||
    command.relation.targetArtifact.schema !== command.schema.targetArtifactSchema
  ) {
    return err(
      new InvalidRelationError(
        {
          sourceSchema: command.schema.sourceArtifactSchema,
          targetSchema: command.schema.targetArtifactSchema,
        },
        {
          sourceSchema: command.relation.sourceArtifact.schema,
          targetSchema: command.relation.targetArtifact.schema,
        },
      ),
    )
  }

  for (const attributeSchema of command.schema.attributes) {
    const attribute = command.relation.attributes.find(
      (attribute) => attribute.id === attributeSchema.id,
    )
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
        id: command.relation.id,
        schema: command.schema.id,
        sourceArtifact: command.relation.sourceArtifact.id,
        targetArtifact: command.relation.targetArtifact.id,
        attributes: command.relation.attributes,
      },
    }),
  )
}

export type RelationRegisteredEvent = {
  kind: 'relation-registered'
  relation: Relation
}

export function relationRegisteredEvent(
  event: Omit<RelationRegisteredEvent, 'kind'>,
): RelationRegisteredEvent {
  return { ...event, kind: 'relation-registered' }
}
