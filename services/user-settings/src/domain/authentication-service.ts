import type { MaybePromise } from '../utils'
import type { UnauthorizedError } from './user-settings'

export type IAuthenticationService = {
  whoami(sessionToken: string): MaybePromise<
    | {
        account: {
          id: number
        }
      }
    | UnauthorizedError
  >
}
