// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Locals {
      dbConnection: import('$lib/server/db/connection').IDrizzleConnection
      services: {
        authService: import('$lib/server/layers/features/auth/application/auth-service').AuthService
        musicCatalogService: import('$lib/server/layers/features/music-catalog/application/music-catalog-service').MusicCatalogService
        genreService: import('$lib/server/layers/features/genres/application/genre-service').GenreService
      }
      user: import('lucia').User | undefined
      session: Pick<import('lucia').Session, 'id'> | undefined
      lucia: import('$lib/server/auth').AppLucia
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
