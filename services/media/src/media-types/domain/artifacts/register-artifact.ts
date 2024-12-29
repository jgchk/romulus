import { err, ok } from 'neverthrow'

import type { AttributeSchema } from '../artifact-schemas/attributes'
import { IncorrectAttributeTypeError, MissingAttributeError } from '../errors'
import { checkAttributeType } from './attributes'

export type RegisterArtifactCommand = {
  schema: {
    id: string
    attributes: Pick<AttributeSchema, 'id' | 'type'>[]
  }
  id: string
  attributes: { id: string; value: unknown }[]
}

export function registerArtifact(command: RegisterArtifactCommand) {
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
    artifactRegisteredEvent({
      artifact: {
        id: command.id,
        schema: command.schema.id,
        attributes: command.attributes,
      },
    }),
  )
}

export type ArtifactRegisteredEvent = {
  kind: 'artifact-registered'
  artifact: {
    id: string
    schema: string
    attributes: { id: string; value: unknown }[]
  }
}

export function artifactRegisteredEvent(
  event: Omit<ArtifactRegisteredEvent, 'kind'>,
): ArtifactRegisteredEvent {
  return { ...event, kind: 'artifact-registered' }
}
