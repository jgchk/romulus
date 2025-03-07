import { AuthenticationInfrastructure } from '@romulus/authentication/infrastructure'
import { AuthorizationInfrastructure } from '@romulus/authorization/infrastructure'
import { GenresInfrastructure } from '@romulus/genres/infrastructure'
import type { ArtifactsProjection } from '@romulus/media/artifacts/infrastructure'
import { createArtifactsProjection } from '@romulus/media/artifacts/infrastructure'
import { UserSettingsInfrastructure } from '@romulus/user-settings/infrastructure'

import { env } from './env.js'

export type Infrastructure = {
  authentication: AuthenticationInfrastructure
  authorization: AuthorizationInfrastructure
  genres: GenresInfrastructure
  media: ArtifactsProjection
  userSettings: UserSettingsInfrastructure
}

export async function createInfrastructure(): Promise<Infrastructure> {
  const authentication = await AuthenticationInfrastructure.create(env.AUTHENTICATION_DATABASE_URL)
  const authorization = await AuthorizationInfrastructure.create(env.AUTHORIZATION_DATABASE_URL)
  const genres = await GenresInfrastructure.create(env.GENRES_DATABASE_URL)
  const media = createArtifactsProjection()
  const userSettings = await UserSettingsInfrastructure.create(env.USER_SETTINGS_DATABASE_URL)

  return { authentication, authorization, genres, media, userSettings }
}
