// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Locals {
      dbConnection: import('$lib/server/db/connection').IDrizzleConnection
      controllers: {
        authentication: import('$lib/server/features/authentication/commands/presentation/controllers').AuthenticationController
      }
      services: {
        api: {
          commands: import('$lib/server/features/api/commands/command-service').ApiCommandService
          queries: import('$lib/server/features/api/queries/query-service').ApiQueryService
        }
        authentication: {
          commands: import('$lib/server/features/authentication/commands/command-service').AuthenticationCommandService
          queries: import('$lib/server/features/authentication/queries/query-service').AuthenticationQueryService
        }
        musicCatalog: {
          commands: import('$lib/server/features/music-catalog/commands/command-service').MusicCatalogCommandService
          queries: import('$lib/server/features/music-catalog/queries/query-service').MusicCatalogQueryService
        }
        genre: {
          commands: import('$lib/server/features/genres/commands/command-service').GenreCommandService
          queries: import('$lib/server/features/genres/queries/query-service').GenreQueryService
        }
      }
      user:
        | ({
            id: number
            username: string
            permissions: import('$lib/server/features/authentication/commands/domain/entities/account').Permission[]
          } & import('$lib/contexts/user-settings/types').UserSettings)
        | undefined
      sessionToken: string | undefined
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
