import type { MaybePromise } from '$lib/utils/types'

import type { MediaTypeTreeNotFoundError } from './errors'
import type { MediaTypeTree } from './tree'

export type IMediaTypeTreeRepository = {
  has(id: string): MaybePromise<boolean>
  get(id: string): MaybePromise<MediaTypeTree | MediaTypeTreeNotFoundError>
  getToCommit(
    id: string,
    commitId: string | undefined,
  ): MaybePromise<MediaTypeTree | MediaTypeTreeNotFoundError>
  copy(id: string): MaybePromise<MediaTypeTree | MediaTypeTreeNotFoundError>
  save(id: string, tree: MediaTypeTree): MaybePromise<void>
}
