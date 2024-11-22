import type { MaybePromise } from '$lib/utils/types'

import type { MediaTypeTree } from './tree'

export type IMediaTypeTreeRepository = {
  get(id: string): MaybePromise<MediaTypeTree>
  save(id: string, tree: MediaTypeTree): MaybePromise<void>
}
