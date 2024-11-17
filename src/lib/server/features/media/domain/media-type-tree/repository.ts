import type { MediaTypeTree } from './tree'

export type IMediaTypeTreeRepository = {
  get(): MediaTypeTree | Promise<MediaTypeTree>
}
