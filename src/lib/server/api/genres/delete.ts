import type { IDrizzleConnection } from '$lib/server/db/connection'
import { GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { GenreParentsDatabase } from '$lib/server/db/controllers/genre-parents'
import { createGenreHistoryEntry } from '$lib/server/genres'

import type { Account, Genre } from '../../db/schema'
import { NotFoundError } from './types'

export async function deleteGenre(
  id: Genre['id'],
  accountId: Account['id'],
  dbConnection: IDrizzleConnection,
): Promise<void> {
  const genresDb = new GenresDatabase()
  const genreParentsDb = new GenreParentsDatabase()
  const genreHistoryDb = new GenreHistoryDatabase()

  await dbConnection.transaction(async (tx) => {
    const genre = await genresDb.findByIdHistory(id, tx)
    if (!genre) {
      throw new NotFoundError()
    }

    // move child genres under deleted genre's parents
    await Promise.all(
      genre.children.flatMap((childId) =>
        genre.parents.map((parentId) => genreParentsDb.update(id, childId, { parentId }, tx)),
      ),
    )

    await genresDb.deleteById(id, tx)

    await createGenreHistoryEntry({
      genre,
      accountId,
      operation: 'DELETE',
      genreHistoryDb,
      connection: tx,
    })

    const children = await genresDb.findByIds(genre.children, tx)
    await Promise.all(
      children.map((genre) =>
        createGenreHistoryEntry({
          genre,
          accountId,
          operation: 'UPDATE',
          genreHistoryDb,
          connection: tx,
        }),
      ),
    )
  })
}
