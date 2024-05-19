// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: import('lucia').User | undefined
      session: import('lucia').Session | undefined
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
