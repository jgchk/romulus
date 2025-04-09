import { createMediaCommandsClient } from './commands/web/client.js'
import { createMediaQueriesClient } from './queries/web/client.js'

export function createMediaClient(options: {
  baseUrl: string
  sessionToken: string | undefined
  fetch?: typeof fetch
}) {
  const commandsClient = createMediaCommandsClient({
    ...options,
    baseUrl: `${options.baseUrl}/commands`,
  })

  const queriesClient = createMediaQueriesClient({
    ...options,
    baseUrl: `${options.baseUrl}/queries`,
  })

  return {
    ...commandsClient,
    ...queriesClient,
  }
}
