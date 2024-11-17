import type { MediaTypeTree } from '../media-type-tree/tree'

export type IEvent = {
  process(tree: MediaTypeTree): void | Error
}
