import { AuthenticationInfrastructure } from '@romulus/authentication/infrastructure'
import { AuthorizationInfrastructure } from '@romulus/authorization/infrastructure'
import { GenresInfrastructure } from '@romulus/genres/infrastructure'
import type { ArtifactsProjection } from '@romulus/media/artifacts/infrastructure'
import { createArtifactsProjection } from '@romulus/media/artifacts/infrastructure'
import { UserSettingsInfrastructure } from '@romulus/user-settings/infrastructure'

export type Infrastructure = {
  authentication: AuthenticationInfrastructure
  authorization: AuthorizationInfrastructure
  genres: GenresInfrastructure
  media: ArtifactsProjection
  userSettings: UserSettingsInfrastructure
}

export async function createInfrastructure({
  authenticationDatabaseUrl,
  authorizationDatabaseUrl,
  genresDatabaseUrl,
  userSettingsDatabaseUrl,
}: {
  authenticationDatabaseUrl: string
  authorizationDatabaseUrl: string
  genresDatabaseUrl: string
  userSettingsDatabaseUrl: string
}): Promise<Infrastructure> {
  const authentication = await AuthenticationInfrastructure.create(authenticationDatabaseUrl)
  const authorization = await AuthorizationInfrastructure.create(authorizationDatabaseUrl)
  const genres = await GenresInfrastructure.create(genresDatabaseUrl)
  const media = createArtifactsProjection()
  const userSettings = await UserSettingsInfrastructure.create(userSettingsDatabaseUrl)

  return { authentication, authorization, genres, media, userSettings }
}
