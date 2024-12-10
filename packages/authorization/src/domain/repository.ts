import type { MaybePromise } from '../utils'
import type { Authorizer } from './authorizer'

export type IAuthorizerRepository = {
  get(): MaybePromise<Authorizer>
  save(authorizer: Authorizer): MaybePromise<void>
}
