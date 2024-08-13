import type { IDrizzleConnection } from '$lib/server/db/connection'
import { GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreRelevanceVotesDatabase } from '$lib/server/db/controllers/genre-relevance-votes'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { median } from '$lib/utils/math'

export async function setRelevanceVote(
  id: number,
  relevance: number,
  accountId: number,
  dbConnection: IDrizzleConnection,
): Promise<void> {
  const genreRelevanceVotesDb = new GenreRelevanceVotesDatabase()

  await dbConnection.transaction(async (tx) => {
    if (relevance === UNSET_GENRE_RELEVANCE) {
      await genreRelevanceVotesDb.deleteByGenreId(id, tx)
      await updateRelevance(id, tx)
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

    await updateRelevance(id, tx)
  })
}

async function updateRelevance(genreId: number, dbConnection: IDrizzleConnection): Promise<void> {
  const genresDb = new GenresDatabase()
  const genreRelevanceVotesDb = new GenreRelevanceVotesDatabase()

  const votes = await genreRelevanceVotesDb.findByGenreId(genreId, dbConnection)

  const relevance =
    votes.length === 0
      ? UNSET_GENRE_RELEVANCE
      : Math.round(median(votes.map((vote) => vote.relevance)))

  await genresDb.update(genreId, { relevance }, dbConnection)
}
