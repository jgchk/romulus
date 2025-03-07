import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import type { ArtifactSchema } from '../../domain/artifact-schemas/define-artifact-schema.js'
import type { Artifact, ArtifactRegisteredEvent } from '../../domain/artifacts/register-artifact.js'
import { registerArtifact } from '../../domain/artifacts/register-artifact.js'
import type { IncorrectAttributeTypeError, MissingAttributeError } from '../../domain/errors.js'
import { MediaArtifactSchemaNotFoundError } from '../../domain/errors.js'

export type RegisterArtifactCommand = {
  artifact: Artifact
}

export type RegisterArtifactCommandHandler = (
  command: RegisterArtifactCommand,
) => Promise<
  Result<
    undefined,
    MediaArtifactSchemaNotFoundError | MissingAttributeError | IncorrectAttributeTypeError
  >
>

export function createRegisterArtifactCommandHandler(
  getArtifactSchema: (id: string) => Promise<ArtifactSchema | undefined>,
  saveArtifactEvent: (event: ArtifactRegisteredEvent) => Promise<void> | void,
): RegisterArtifactCommandHandler {
  return async function (command: RegisterArtifactCommand) {
    const schema = await getArtifactSchema(command.artifact.schema)
    if (schema === undefined) {
      return err(new MediaArtifactSchemaNotFoundError(command.artifact.schema))
    }

    const result = registerArtifact({
      schema,
      artifact: {
        id: command.artifact.id,
        attributes: command.artifact.attributes,
      },
    })
    if (result.isErr()) {
      return err(result.error)
    }

    await saveArtifactEvent(result.value)

    return ok(undefined)
  }
}
