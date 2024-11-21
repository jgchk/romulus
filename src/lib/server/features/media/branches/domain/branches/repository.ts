import type { MaybePromise } from '$lib/utils/types'

import type { MediaTypeBranches } from './branches'

export type IMediaTypeBranchesRepository = {
  get(): MaybePromise<MediaTypeBranches>
  save(branches: MediaTypeBranches): MaybePromise<void>
}
