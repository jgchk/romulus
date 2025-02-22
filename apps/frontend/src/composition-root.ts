import { AuthenticationClient } from '@romulus/authentication/client'
import { AuthorizationClient } from '@romulus/authorization/client'
import { GenresClient } from '@romulus/genres/client'
import { UserSettingsClient } from '@romulus/user-settings/client'

export type CompositionRoot = ReturnType<typeof createCompositionRoot>

export function createCompositionRoot(options: {
  baseUrl: string
  sessionToken: string
  fetch: typeof fetch
}) {
  return {
    authentication: () => createAuthenticationClient(options),
    authorization: () => createAuthorizationClient(options),
    userSettings: () => createUserSettingsClient(options),
    genres: () => createGenresClient(options),
  }
}

function createAuthenticationClient(options: {
  baseUrl: string
  sessionToken: string
  fetch: typeof fetch
}) {
  return new AuthenticationClient({
    baseUrl: `${options.baseUrl}/authentication`,
    sessionToken: options.sessionToken,
    fetch: options.fetch,
  })
}

function createAuthorizationClient(options: {
  baseUrl: string
  sessionToken: string
  fetch: typeof fetch
}) {
  return new AuthorizationClient({
    baseUrl: `${options.baseUrl}/authorization`,
    sessionToken: options.sessionToken,
    fetch: options.fetch,
  })
}

function createUserSettingsClient(options: {
  baseUrl: string
  sessionToken: string
  fetch: typeof fetch
}) {
  return new UserSettingsClient({
    baseUrl: `${options.baseUrl}/user-settings`,
    sessionToken: options.sessionToken,
    fetch: options.fetch,
  })
}

function createGenresClient(options: {
  baseUrl: string
  sessionToken: string
  fetch: typeof fetch
}) {
  return new GenresClient({
    baseUrl: `${options.baseUrl}/genres`,
    sessionToken: options.sessionToken,
    fetch: options.fetch,
  })
}
