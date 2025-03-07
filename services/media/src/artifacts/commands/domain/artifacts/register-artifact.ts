import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import type { AttributeSchema } from '../artifact-schemas/attributes.js'
import { IncorrectAttributeTypeError, MissingAttributeError } from '../errors.js'
import { checkAttributeType } from './attributes.js'

export type RegisterArtifactCommand = {
  schema: {
    id: string
    attributes: Pick<AttributeSchema, 'id' | 'type'>[]
  }
  artifact: Omit<Artifact, 'schema'>
}

export type Artifact = {
  id: string
  schema: string
  attributes: { id: string; value: unknown }[]
}

export function registerArtifact(
  command: RegisterArtifactCommand,
): Result<ArtifactRegisteredEvent, MissingAttributeError | IncorrectAttributeTypeError> {
  for (const attributeSchema of command.schema.attributes) {
    const attribute = command.artifact.attributes.find(
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
    artifactRegisteredEvent({
      artifact: { ...command.artifact, schema: command.schema.id },
    }),
  )
}

export type ArtifactRegisteredEvent = {
  kind: 'artifact-registered'
  artifact: Artifact
}

export function artifactRegisteredEvent(
  event: Omit<ArtifactRegisteredEvent, 'kind'>,
): ArtifactRegisteredEvent {
  return { ...event, kind: 'artifact-registered' }
}
