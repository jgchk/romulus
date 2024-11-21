import type { MaybePromise } from '$lib/utils/types'

import type { MediaTypeTree } from './tree'

export type IMediaTypeTreeRepository = {
  get(id: string): MaybePromise<MediaTypeTree>
  save(tree: MediaTypeTree): MaybePromise<void>
}
