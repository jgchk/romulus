import { CustomError, toError } from '@romulus/custom-error'
import { FetchError } from '@romulus/hono-utils/errors'
import type { InferResponseType } from 'hono/client'
import { hc } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'

import type { DefineArtifactSchemaCommand } from '../application/artifact-schemas/define-artifact-schema'
import type { DefineRelationSchemaCommand } from '../application/artifact-schemas/define-relation-schema'
import type { RegisterArtifactCommand } from '../application/artifacts/register-artifact'
import type { RegisterRelationCommand } from '../application/artifacts/register-relation'
import type { ArtifactsRouter } from './router'

export function createArtifactsClient(baseUrl: string) {
  const client = hc<ArtifactsRouter>(baseUrl)

  return {
    defineArtifactSchema: (command: DefineArtifactSchemaCommand): ResultAsync<void, FetchError> => {
      return ResultAsync.fromPromise(
        client.schemas.artifacts[':id'].$put({
          param: { id: command.artifactSchema.id },
          json: command,
        }),
        (error) => new FetchError(toError(error)),
      ).map(() => undefined)
    },

    defineRelationSchema: (command: DefineRelationSchemaCommand): ResultAsync<void, FetchError> => {
      return ResultAsync.fromPromise(
        client.schemas.relations[':id'].$put({
          param: { id: command.relationSchema.id },
          json: command,
        }),
        (error) => new FetchError(toError(error)),
      ).map(() => undefined)
    },

    registerArtifact: (
      command: RegisterArtifactCommand,
    ): ResultAsync<void, FetchError | ArtifactsApiError> => {
      return ResultAsync.fromPromise(
        client.artifacts[':id'].$put({
          param: { id: command.artifact.id },
          json: command,
        }),
        (error) => new FetchError(toError(error)),
      )
        .map<InferResponseType<(typeof client.artifacts)[':id']['$put']>>((res) => res.json())
        .andThen((res) => {
          if (res.success) return okAsync(undefined)
          return errAsync(new ArtifactsApiError(res.error))
        })
    },

    registerRelation: (command: RegisterRelationCommand): ResultAsync<void, FetchError> => {
      return ResultAsync.fromPromise(
        client.relations[':id'].$put({
          param: { id: command.relation.id },
          json: command,
        }),
        (error) => new FetchError(toError(error)),
      )
        .map<InferResponseType<(typeof client.relations)[':id']['$put']>>((res) => res.json())
        .andThen((res) => {
          if (res.success) return okAsync(undefined)
          return errAsync(new ArtifactsApiError(res.error))
        })
    },
  }
}

type ArtifactsError = {
  name: string
  message: string
  statusCode: StatusCode
  details?: unknown
}

export class ArtifactsApiError extends CustomError {
  constructor(public readonly cause: ArtifactsError) {
    super(cause.name, cause.message, cause)
  }
}
