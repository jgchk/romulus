import { setError, UnknownError } from '@romulus/hono-utils/errors'
import { zodValidator } from '@romulus/hono-utils/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

import type { DefineArtifactSchemaCommandHandler } from '../application/artifact-schemas/define-artifact-schema.js'
import type { DefineRelationSchemaCommandHandler } from '../application/artifact-schemas/define-relation-schema.js'
import type { RegisterArtifactCommandHandler } from '../application/artifacts/register-artifact.js'
import type { RegisterRelationCommandHandler } from '../application/artifacts/register-relation.js'
import {
  IncorrectAttributeTypeError,
  InvalidRelationError,
  MediaArtifactSchemaNotFoundError,
  MissingAttributeError,
} from '../domain/errors.js'

export type ArtifactsRouter = ReturnType<typeof createArtifactsRouter>

export function createArtifactsRouter(deps: ArtifactsRouterDependencies) {
  return new Hono()
    .put(
      '/schemas/artifacts/:id',
      zodValidator(
        'json',
        z.object({
          artifactSchema: z.object({
            name: z.string(),
            attributes: attributeSchemaSchema.array(),
          }),
        }),
      ),
      async (c) => {
        const id = c.req.param('id')
        const command = c.req.valid('json')
        await deps.handleDefineArtifactSchemaCommand({
          artifactSchema: { ...command.artifactSchema, id },
        })
        return c.json({ success: true } as const)
      },
    )
    .put(
      '/schemas/relations/:id',
      zodValidator(
        'json',
        z.object({
          relationSchema: z.object({
            name: z.string(),
            type: z.union([
              z.literal('one-to-one'),
              z.literal('one-to-many'),
              z.literal('many-to-one'),
              z.literal('many-to-many'),
            ]),
            sourceArtifactSchema: z.string(),
            targetArtifactSchema: z.string(),
            attributes: attributeSchemaSchema.array(),
          }),
        }),
      ),
      async (c) => {
        const id = c.req.param('id')
        const command = c.req.valid('json')
        await deps.handleDefineRelationSchemaCommand({
          relationSchema: { ...command.relationSchema, id },
        })
        return c.json({ success: true } as const)
      },
    )
    .put(
      '/artifacts/:id',
      zodValidator(
        'json',
        z.object({
          artifact: z.object({
            id: z.string(),
            schema: z.string(),
            attributes: attributeSchema.array(),
          }),
        }),
      ),
      async (c) => {
        const id = c.req.param('id')
        const command = c.req.valid('json')
        const result = await deps.handleRegisterArtifactCommand({
          artifact: { ...command.artifact, id },
        })
        return result.match(
          () => c.json({ success: true } as const),
          (error) => {
            switch (true) {
              case error instanceof MediaArtifactSchemaNotFoundError:
                return setError(c, error, 404)
              default: {
                error satisfies never
                return setError(c, new UnknownError(), 500)
              }
            }
          },
        )
      },
    )
    .put(
      '/relations/:id',
      zodValidator(
        'json',
        z.object({
          relation: z.object({
            id: z.string(),
            schema: z.string(),
            sourceArtifact: z.string(),
            targetArtifact: z.string(),
            attributes: attributeSchema.array(),
          }),
        }),
      ),
      async (c) => {
        const id = c.req.param('id')
        const command = c.req.valid('json')
        const result = await deps.handleRegisterRelationCommand({
          relation: { ...command.relation, id },
        })
        return result.match(
          () => c.json({ success: true } as const),
          (error) => {
            switch (true) {
              case error instanceof MissingAttributeError:
                return setError(c, error, 400)
              case error instanceof IncorrectAttributeTypeError:
                return setError(c, error, 400)
              case error instanceof InvalidRelationError:
                return setError(c, error, 400)
              default: {
                error satisfies never
                return setError(c, new UnknownError(), 500)
              }
            }
          },
        )
      },
    )
}

export type ArtifactsRouterDependencies = {
  handleDefineArtifactSchemaCommand: DefineArtifactSchemaCommandHandler
  handleDefineRelationSchemaCommand: DefineRelationSchemaCommandHandler
  handleRegisterArtifactCommand: RegisterArtifactCommandHandler
  handleRegisterRelationCommand: RegisterRelationCommandHandler
}

const attributeSchemaSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.union([
    z.literal('string'),
    z.literal('number'),
    z.literal('date'),
    z.literal('duration'),
  ]),
})

const attributeSchema = z
  .object({ id: z.string(), value: z.unknown() })
  .transform((result) => ({ id: result.id, value: result.value }))
