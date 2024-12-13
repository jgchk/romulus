import { GenreCommandsClient } from '../../commands/web/client'
import { GenreQueriesClient } from '../../queries/web/client'

export class GenresClient {
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
