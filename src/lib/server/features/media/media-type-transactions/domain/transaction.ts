import { type MediaTypeTreeEvent } from '../../media-type-tree/domain/events'
import type { MediaTypeTree } from '../../media-type-tree/domain/tree'

export class Transaction {
  private startingTree: MediaTypeTree
  private mediaTypeTreeEvents: MediaTypeTreeEvent[]

  constructor(startingTree: MediaTypeTree) {
    this.startingTree = startingTree
    this.mediaTypeTreeEvents = []
  }

  addMediaType() {
    const currentTree = this.getMediaTypeTreeView()
    const event = currentTree.addMediaType()
    this.mediaTypeTreeEvents.push(event)
    return event
  }

  addParentToMediaType(id: number, parentId: number) {
    const currentTree = this.getMediaTypeTreeView()
    const event = currentTree.addParentToMediaType(id, parentId)
    if (event instanceof Error) {
      return event
    }
    this.mediaTypeTreeEvents.push(event)
    return event
  }

  getMediaTypeTreeView() {
    const treeView = this.startingTree.clone()
    for (const event of this.mediaTypeTreeEvents) {
      treeView.apply(event)
    }
    return treeView
  }
}
