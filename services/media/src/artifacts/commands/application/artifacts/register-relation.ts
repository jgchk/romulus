import { err, ok } from 'neverthrow'

import type { RelationSchema } from '../../domain/artifact-schemas/define-relation-schema'
import type { Artifact } from '../../domain/artifacts/register-artifact'
import type { Relation, RelationRegisteredEvent } from '../../domain/artifacts/register-relation'
import { registerRelation } from '../../domain/artifacts/register-relation'
import {
  MediaArtifactNotFoundError,
  MediaArtifactRelationSchemaNotFoundError,
} from '../../domain/errors'

export type RegisterRelationCommand = {
  relation: Relation
}

export type RegisterRelationCommandHandler = ReturnType<typeof createRegisterRelationCommandHandler>

export function createRegisterRelationCommandHandler(
  getState: (ids: {
    schemaId: string
    sourceArtifactId: string
    targetArtifactId: string
  }) => Promise<{
    schema: RelationSchema | undefined
    sourceArtifact: Artifact | undefined
    targetArtifact: Artifact | undefined
  }>,
  saveRelationEvent: (event: RelationRegisteredEvent) => Promise<void> | void,
) {
  return async function (command: RegisterRelationCommand) {
    const { schema, sourceArtifact, targetArtifact } = await getState({
      schemaId: command.relation.schema,
      sourceArtifactId: command.relation.sourceArtifact,
      targetArtifactId: command.relation.targetArtifact,
    })
    if (schema === undefined) {
      return err(new MediaArtifactRelationSchemaNotFoundError(command.relation.schema))
    }
    if (sourceArtifact === undefined) {
      return err(new MediaArtifactNotFoundError(command.relation.sourceArtifact))
    }
    if (targetArtifact === undefined) {
      return err(new MediaArtifactNotFoundError(command.relation.targetArtifact))
    }

    const result = registerRelation({
      schema,
      relation: {
        id: command.relation.id,
        sourceArtifact,
        targetArtifact,
        attributes: command.relation.attributes,
      },
    })
    if (result.isErr()) {
      return err(result.error)
    }

    await saveRelationEvent(result.value)

    return ok(undefined)
  }
}
