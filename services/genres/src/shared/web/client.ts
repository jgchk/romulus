import type { IGenreCommandsClient } from '../../commands/web/client'
import { GenreCommandsClient } from '../../commands/web/client'
import type { IGenreQueriesClient } from '../../queries/web/client'
import { GenreQueriesClient } from '../../queries/web/client'

export type IGenresClient = {
  commands(): IGenreCommandsClient
  queries(): IGenreQueriesClient
}

export class GenresClient implements IGenresClient {
  constructor(
    private baseUrl: string,
    private sessionToken: string | undefined,
  ) {}

  commands() {
    return new GenreCommandsClient(this.baseUrl, this.sessionToken)
  }

  queries() {
    return new GenreQueriesClient(this.baseUrl)
  }
}
