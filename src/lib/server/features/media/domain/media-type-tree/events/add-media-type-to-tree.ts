import type { IEvent } from '../../event-store/event'
import type { MediaTypeTree } from '../tree'
import { MediaTypeAlreadyExistsError } from '../tree'
import { MediaTypeTreeNode } from '../tree-node'

export class AddMediaTypeToTreeEvent implements IEvent {
  constructor(public readonly id: number) {}

  process(tree: MediaTypeTree): void | MediaTypeAlreadyExistsError {
    const treeNode = MediaTypeTreeNode.create(this.id)
    const result = tree.insert(treeNode)
    if (result instanceof MediaTypeAlreadyExistsError) {
      return result
    }
  }
}
