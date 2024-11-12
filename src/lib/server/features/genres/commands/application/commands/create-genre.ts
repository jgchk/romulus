import type { DuplicateAkaError } from '../../domain/errors/duplicate-aka'
import type { GenreCycleError } from '../../domain/errors/genre-cycle'
import type { SelfInfluenceError } from '../../domain/errors/self-influence'
import { Genre } from '../../domain/genre'
import { GenreHistory } from '../../domain/genre-history'
import type { GenreHistoryRepository } from '../../domain/genre-history-repository'
import type { GenreRepository } from '../../domain/genre-repository'
import type { VoteGenreRelevanceCommand } from './vote-genre-relevance'

export type CreateGenreInput = {
  name: string
  subtitle?: string
  type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
  nsfw: boolean
  shortDescription?: string
  longDescription?: string
  notes?: string
  parents: Set<number>
  derivedFrom: Set<number>
  influences: Set<number>
  akas: {
    primary: string[]
    secondary: string[]
    tertiary: string[]
  }
  relevance: number
  createdAt: Date
  updatedAt: Date
}

export class CreateGenreCommand {
  constructor(
    private genreRepo: GenreRepository,
    private genreHistoryRepo: GenreHistoryRepository,
    private voteGenreRelevanceCommand: VoteGenreRelevanceCommand,
  ) {}

  async execute(
    data: CreateGenreInput,
    accountId: number,
  ): Promise<{ id: number } | SelfInfluenceError | DuplicateAkaError | GenreCycleError> {
    const genre = Genre.create(data)

    if (genre instanceof Error) {
      return genre
    }

    const { id } = await this.genreRepo.save(genre)

    const genreTree = await this.genreRepo.getGenreTree()
    const treeError = genreTree.insertGenre(id, genre.name, data.parents, data.derivedFrom)
    if (treeError) {
      await this.genreRepo.delete(id)
      return treeError
    }

    await this.genreRepo.saveGenreTree(genreTree)

    const genreHistory = GenreHistory.fromGenre(
      id,
      genre,
      data.parents,
      data.derivedFrom,
      'CREATE',
      accountId,
    )
    await this.genreHistoryRepo.create(genreHistory)

    // TODO: Remove this from the command and instead call the two commands from the BFFE function
    await this.voteGenreRelevanceCommand.execute(id, data.relevance, accountId)

    return { id }
  }
}
