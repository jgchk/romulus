// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Locals {
      dbConnection: import('$lib/server/db/connection').IDrizzleConnection
      services: {
        api: import('$lib/server/layers/features/api/application/api-service').ApiService
        authentication: import('$lib/server/layers/features/authentication/application/authentication-service').AuthenticationService
        musicCatalog: import('$lib/server/layers/features/music-catalog/application/music-catalog-service').MusicCatalogService
        genre: import('$lib/server/layers/features/genres/application/genre-service').GenreService
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
