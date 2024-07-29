import type { IGenresDatabase } from '$lib/server/db/controllers/genre'
import type { IGenreRelevanceVotesDatabase } from '$lib/server/db/controllers/genre-relevance-votes'
import type { ITransactor } from '$lib/server/db/transactor'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { median } from '$lib/utils/math'

export type SetRelevanceVoteContext<T> = {
  transactor: ITransactor<T>
  genresDb: IGenresDatabase<T>
  genreRelevanceVotesDb: IGenreRelevanceVotesDatabase<T>
}

export async function setRelevanceVote<T>(
  id: number,
  relevance: number,
  accountId: number,
  { transactor, genresDb, genreRelevanceVotesDb }: SetRelevanceVoteContext<T>,
): Promise<void> {
  await transactor.transaction(async (tx) => {
    if (relevance === UNSET_GENRE_RELEVANCE) {
      await genreRelevanceVotesDb.deleteByGenreId(id, tx)
      await updateRelevance(id, { dbConnection: tx, genresDb, genreRelevanceVotesDb })
      return
    }

    await genreRelevanceVotesDb.upsert(
      {
        genreId: id,
        accountId,
        relevance,
        updatedAt: new Date(),
      },
      tx,
    )

    await updateRelevance(id, { dbConnection: tx, genresDb, genreRelevanceVotesDb })
  })
}

type UpdateRelevanceContext<T> = {
  dbConnection: T
  genresDb: IGenresDatabase<T>
  genreRelevanceVotesDb: IGenreRelevanceVotesDatabase<T>
}

async function updateRelevance<T>(
  genreId: number,
  { dbConnection, genresDb, genreRelevanceVotesDb }: UpdateRelevanceContext<T>,
): Promise<void> {
  const votes = await genreRelevanceVotesDb.findByGenreId(genreId, dbConnection)

  const relevance =
    votes.length === 0
      ? UNSET_GENRE_RELEVANCE
      : Math.round(median(votes.map((vote) => vote.relevance)))

  await genresDb.update(genreId, { relevance }, dbConnection)
}
