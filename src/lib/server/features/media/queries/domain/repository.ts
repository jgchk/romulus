import type { MaybePromise } from '$lib/utils/types'

import type { MediaTypeTree } from './media-type-tree'

export type IMediaTypeTreeRepository = {
  get(id: string): MaybePromise<MediaTypeTree>
}
