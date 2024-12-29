import { ok } from 'neverthrow'

export type DefineArtifactSchemaCommand = {
  id: string
  name: string
}

export function defineArtifactSchema(command: DefineArtifactSchemaCommand) {
  return ok(
    artifactSchemaDefinedEvent({
      id: command.id,
      name: command.name,
    }),
  )
}

export type ArtifactSchemaDefinedEvent = {
  kind: 'artifact-schema-defined'
  id: string
  name: string
}

export function artifactSchemaDefinedEvent(
  event: Omit<ArtifactSchemaDefinedEvent, 'kind'>,
): ArtifactSchemaDefinedEvent {
  return { ...event, kind: 'artifact-schema-defined' }
}
