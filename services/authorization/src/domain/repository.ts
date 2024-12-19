import type { Authorizer } from './authorizer'

export type IAuthorizerRepository = {
  get(): Promise<Authorizer>
  save(authorizer: Authorizer): Promise<void>
}
