import type { MaybePromise } from '$lib/utils/types'

import type { MediaType } from './media-type'

export type IMediaTypeRepository = {
  get(id: number): MaybePromise<MediaType | undefined>
}
