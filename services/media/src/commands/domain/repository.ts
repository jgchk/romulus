import type { MediaTypeTree } from './tree.js'

export type IMediaTypeTreeRepository = {
  get(id: string): MaybePromise<MediaTypeTree>
  save(tree: MediaTypeTree): MaybePromise<void>
}

type MaybePromise<T> = T | Promise<T>
