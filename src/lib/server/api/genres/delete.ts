import type { IGenresDatabase } from '$lib/server/db/controllers/genre'
import type { IGenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import type { IGenreParentsDatabase } from '$lib/server/db/controllers/genre-parents'
import type { ITransactor } from '$lib/server/db/transactor'
import { createGenreHistoryEntry } from '$lib/server/genres'

import type { Account, Genre } from '../../db/schema'
import { NotFoundError } from './types'

export type DeleteGenreContext<T> = {
  transactor: ITransactor<T>
  genresDb: IGenresDatabase<T>
  genreHistoryDb: IGenreHistoryDatabase<T>
  genreParentsDb: IGenreParentsDatabase<T>
}

export async function deleteGenre<T>(
  id: Genre['id'],
  accountId: Account['id'],
  { transactor, genresDb, genreHistoryDb, genreParentsDb }: DeleteGenreContext<T>,
): Promise<void> {
  await transactor.transaction(async (tx) => {
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
