import type { AttributeSchema } from '../../domain/artifact-schemas/attributes.js'
import type { ArtifactSchemaDefinedEvent } from '../../domain/artifact-schemas/define-artifact-schema.js'
import { defineArtifactSchema } from '../../domain/artifact-schemas/define-artifact-schema.js'

export type DefineArtifactSchemaCommand = {
  artifactSchema: {
    id: string
    name: string
    attributes: AttributeSchema[]
  }
}

export type DefineArtifactSchemaCommandHandler = ReturnType<
  typeof createDefineArtifactSchemaCommandHandler
>

export function createDefineArtifactSchemaCommandHandler(
  saveArtifactSchemaEvent: (event: ArtifactSchemaDefinedEvent) => Promise<void> | void,
) {
  return async function (command: DefineArtifactSchemaCommand) {
    const result = defineArtifactSchema({ artifactSchema: command.artifactSchema })
    await saveArtifactSchemaEvent(result)
  }
}
