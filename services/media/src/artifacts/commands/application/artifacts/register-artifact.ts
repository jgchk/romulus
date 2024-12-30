import { err, ok } from 'neverthrow'

import type { ArtifactSchema } from '../../domain/artifact-schemas/define-artifact-schema'
import type { Artifact, ArtifactRegisteredEvent } from '../../domain/artifacts/register-artifact'
import { registerArtifact } from '../../domain/artifacts/register-artifact'
import { MediaArtifactSchemaNotFoundError } from '../../domain/errors'

export type RegisterArtifactCommand = {
  artifact: Artifact
}

export type RegisterArtifactCommandHandler = ReturnType<typeof createRegisterArtifactCommandHandler>

export function createRegisterArtifactCommandHandler(
  getArtifactSchema: (id: string) => Promise<ArtifactSchema | undefined>,
  saveArtifactEvent: (event: ArtifactRegisteredEvent) => Promise<void>,
) {
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
