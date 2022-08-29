import { CrudOperation } from '@prisma/client'
import { z } from 'zod'

export const CrudOperationInput = z.union([
  z.literal(CrudOperation.CREATE),
  z.literal(CrudOperation.UPDATE),
  z.literal(CrudOperation.DELETE),
])

export const MIN_GENRE_RELEVANCE = 1
export const MAX_GENRE_RELEVANCE = 7
export const UNSET_GENRE_RELEVANCE = 99

export const GenreRelevanceInput = z
  .number()
  .refine((val) => Number.isInteger(val), { message: 'Must be an integer' })
  .refine(
    (val) =>
      (val >= MIN_GENRE_RELEVANCE && val <= MAX_GENRE_RELEVANCE) ||
      val === UNSET_GENRE_RELEVANCE,
    {
      message: `Must be between ${MIN_GENRE_RELEVANCE} and ${MAX_GENRE_RELEVANCE} (inclusive)`,
    }
  )

export const CreateOrConnect = <T extends z.ZodTypeAny>(schema: T) =>
  z.discriminatedUnion('type', [ConnectInput, CreateInput(schema)])
export type CreateOrConnect<T> = CreateInput<T> | ConnectInput

export const ConnectInput = z.object({
  type: z.literal('existing'),
  id: z.number(),
})
export type ConnectInput = z.infer<typeof ConnectInput>
export const isConnectInput = <T>(t: CreateOrConnect<T>): t is ConnectInput =>
  t.type === 'existing'

export const CreateInput = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({ type: z.literal('new'), data: schema })
export type CreateInput<T> = { type: 'new'; data: T }
export const isCreateInput = <T>(t: CreateOrConnect<T>): t is CreateInput<T> =>
  t.type === 'new'
