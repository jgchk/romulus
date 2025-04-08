import { MediaCommandsClient } from './commands/web/client.js'
import { MediaQueriesClient } from './queries/web/client.js'

export class MediaClient {
  private commandsClient: MediaCommandsClient
  private queriesClient: MediaQueriesClient

  createMediaType: MediaCommandsClient['createMediaType']
  getAllMediaTypes: MediaQueriesClient['getAllMediaTypes']
  getMediaType: MediaQueriesClient['getMediaType']

  constructor(options: {
    baseUrl: string
    sessionToken: string | undefined
    fetch?: typeof fetch
  }) {
    this.commandsClient = new MediaCommandsClient({
      ...options,
      baseUrl: `${options.baseUrl}/commands`,
    })
    this.queriesClient = new MediaQueriesClient({
      ...options,
      baseUrl: `${options.baseUrl}/queries`,
    })

    this.createMediaType = this.commandsClient.createMediaType.bind(this.commandsClient)
    this.getAllMediaTypes = this.queriesClient.getAllMediaTypes.bind(this.queriesClient)
    this.getMediaType = this.queriesClient.getMediaType.bind(this.queriesClient)
  }
}
