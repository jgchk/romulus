import type { Authorizer } from './authorizer'

export type IAuthorizerRepository = {
  get(): MaybePromise<Authorizer>
  save(authorizer: Authorizer): MaybePromise<void>
}

export type MaybePromise<T> = T | Promise<T>
