/* eslint-disable @typescript-eslint/consistent-type-definitions */

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      requestId: string
      di: import('./composition-root').CompositionRoot
      user:
        | {
            id: number
            username: string
            permissions: {
              genres: {
                canCreate: boolean
                canEdit: boolean
                canDelete: boolean
                canVoteRelevance: boolean
              }
              mediaTypes: {
                canCreate: boolean
              }
              mediaArtifactTypes: {
                canCreate: boolean
              }
              genreEditors: {
                canManage: boolean
              }
            }
          }
        | undefined
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
