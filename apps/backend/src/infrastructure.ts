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

export async function createInfrastructure(): Promise<Infrastructure> {
  const authentication = await AuthenticationInfrastructure.create(
    'postgresql://postgres:postgres@localhost:5432/authn',
  )
  const authorization = await AuthorizationInfrastructure.create(
    'postgresql://postgres:postgres@localhost:5432/authz',
  )
  const genres = await GenresInfrastructure.create(
    'postgresql://postgres:postgres@localhost:5432/genres',
  )
  const media = createArtifactsProjection()
  const userSettings = await UserSettingsInfrastructure.create(
    'postgresql://postgres:postgres@localhost:5432/user_settings',
  )

  return { authentication, authorization, genres, media, userSettings }
}
