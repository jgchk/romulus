// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Locals {
      dbConnection: import('$lib/server/db/connection').IDrizzleConnection
      services: {
        api: import('$lib/server/features/api/application/api-service').ApiService
        authentication: import('$lib/server/features/authentication/application/authentication-service').AuthenticationService
        musicCatalog: {
          commands: import('$lib/server/features/music-catalog/commands/command-service').MusicCatalogCommandService
          queries: import('$lib/server/features/music-catalog/queries/query-service').MusicCatalogQueryService
        }
        genre: import('$lib/server/features/genres/commands/genre-service').GenreService
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
