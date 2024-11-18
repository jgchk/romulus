import type { MaybePromise } from '$lib/utils/types'

import type { MediaTypeTree } from './tree'

export type IMediaTypeTreeRepository = {
  get(): MaybePromise<MediaTypeTree>
  save(tree: MediaTypeTree): MaybePromise<void>
}
