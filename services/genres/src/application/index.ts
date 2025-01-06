import { GenresPermission } from '../domain/permissions'

export { CreateGenreCommand } from './commands/create-genre'
export { DeleteGenreCommand } from './commands/delete-genre'
export { GetAllGenresQuery } from './commands/get-all-genres'
export { GetGenreQuery } from './commands/get-genre'
export { GetGenreHistoryQuery } from './commands/get-genre-history'
export { GetGenreHistoryByAccountQuery } from './commands/get-genre-history-by-account'
export { GetGenreRelevanceVoteByAccountQuery } from './commands/get-genre-relevance-vote-by-account'
export { GetGenreRelevanceVotesByGenreQuery } from './commands/get-genre-relevance-votes-by-genre'
export { GetGenreTreeQuery } from './commands/get-genre-tree'
export { GetLatestGenreUpdatesQuery } from './commands/get-latest-genre-updates'
export { GetRandomGenreIdQuery } from './commands/get-random-genre-id'
export { UpdateGenreCommand } from './commands/update-genre'
export { VoteGenreRelevanceCommand } from './commands/vote-genre-relevance'

export async function setupGenresPermissions(
  createPermissions: (
    permissions: { name: string; description: string | undefined }[],
  ) => Promise<void>,
) {
  await createPermissions(
    Object.values(GenresPermission).map((permission) => ({
      name: permission,
      description: undefined,
    })),
  )
}
