import type { MaybePromise } from '../../utils'
import type { UnauthorizedError } from './errors/unauthorized'

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
