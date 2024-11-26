import type { MaybePromise } from '$lib/utils/types'

import type { MainTreeManager } from './main-tree-manager'

export type IMainTreeManagerRepository = {
  get(): MaybePromise<MainTreeManager>
  save(manager: MainTreeManager): MaybePromise<void>
}
