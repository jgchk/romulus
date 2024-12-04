// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Locals {
      dbConnection: import('$lib/server/db/connection').IDrizzleConnection
      di: import('./composition-root').CompositionRoot
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
