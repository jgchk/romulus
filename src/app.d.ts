// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Locals {
      dbConnection: import('$lib/server/db/connection').IDrizzleConnection
      services: {
        api: {
          commands: import('$lib/server/features/api/commands/command-service').ApiCommandService
          queries: import('$lib/server/features/api/queries/query-service').ApiQueryService
        }
        authentication: import('$lib/server/features/authentication/commands/application/authentication-service').AuthenticationService
        musicCatalog: {
          commands: import('$lib/server/features/music-catalog/commands/command-service').MusicCatalogCommandService
          queries: import('$lib/server/features/music-catalog/queries/query-service').MusicCatalogQueryService
        }
        genre: {
          commands: import('$lib/server/features/genres/commands/command-service').GenreCommandService
          queries: import('$lib/server/features/genres/queries/query-service').GenreQueryService
        }
      }
      user: import('lucia').User | undefined
      session: Pick<import('lucia').Session, 'id'> | undefined
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
