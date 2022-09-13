import { Prisma } from '@prisma/client'

export const defaultGenreRelevanceVoteSelect =
  Prisma.validator<Prisma.GenreRelevanceVoteSelect>()({
    genreId: true,
    accountId: true,
    relevance: true,
  })
export type DefaultGenreRelevanceVote = Prisma.GenreRelevanceVoteGetPayload<{
  select: typeof defaultGenreRelevanceVoteSelect
}>
