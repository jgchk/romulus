import type { Authorizer } from './authorizer.js'

export type IAuthorizerRepository = {
  get(): Promise<Authorizer>
  save(authorizer: Authorizer): Promise<void>
}
