import { GenresPermission } from '../domain/permissions.js'

export { CreateGenreCommand } from './commands/create-genre.js'
export { DeleteGenreCommand } from './commands/delete-genre.js'
export { GetAllGenresQuery } from './commands/get-all-genres.js'
export { GetGenreQuery } from './commands/get-genre.js'
export { GetGenreHistoryQuery } from './commands/get-genre-history.js'
export { GetGenreHistoryByAccountQuery } from './commands/get-genre-history-by-account.js'
export { GetGenreRelevanceVoteByAccountQuery } from './commands/get-genre-relevance-vote-by-account.js'
export { GetGenreRelevanceVotesByGenreQuery } from './commands/get-genre-relevance-votes-by-genre.js'
export { GetGenreTreeQuery } from './commands/get-genre-tree.js'
export { GetLatestGenreUpdatesQuery } from './commands/get-latest-genre-updates.js'
export { GetRandomGenreIdQuery } from './commands/get-random-genre-id.js'
export { UpdateGenreCommand } from './commands/update-genre.js'
export { VoteGenreRelevanceCommand } from './commands/vote-genre-relevance.js'

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
