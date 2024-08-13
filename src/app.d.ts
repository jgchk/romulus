// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Locals {
      dbConnection: import('$lib/server/db/connection').IDrizzleConnection
      user: import('lucia').User | undefined
      session: import('lucia').Session | undefined
      lucia: import('$lib/server/auth').AppLucia
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
