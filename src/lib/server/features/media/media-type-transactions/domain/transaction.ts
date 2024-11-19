import {
  MediaTypeAddedEvent,
  MediaTypeParentAddedEvent,
  type MediaTypeTreeEvent,
} from '../../media-type-tree/domain/events'
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

  addParentToMediaType(childId: number, parentId: number) {
    const currentTree = this.getMediaTypeTreeView()
    const event = currentTree.addParentToMediaType(childId, parentId)
    if (event instanceof Error) {
      return event
    }
    this.mediaTypeTreeEvents.push(event)
    return event
  }

  getMediaTypeTreeView() {
    const treeView = this.startingTree.clone()
    for (const event of this.mediaTypeTreeEvents) {
      treeView.applyEvent(event)
    }
    return treeView
  }

  merge(mainTree_: MediaTypeTree) {
    const mainTree = mainTree_.clone()

    const idMapping = new Map<number, number>()
    const mergedEvents: MediaTypeTreeEvent[] = []

    for (const event of this.mediaTypeTreeEvents) {
      if (event instanceof MediaTypeAddedEvent) {
        const newId = mainTree.addMediaType().id
        idMapping.set(event.id, newId)
        mergedEvents.push(new MediaTypeAddedEvent(newId))
      } else if (event instanceof MediaTypeParentAddedEvent) {
        const mappedParentId = idMapping.get(event.parentId) ?? event.parentId
        const mappedChildId = idMapping.get(event.childId) ?? event.childId

        const result = mainTree.addParentToMediaType(mappedChildId, mappedParentId)
        if (result instanceof Error) {
          return result
        }

        mergedEvents.push(result)
      } else {
        // exhaustive check
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _exhaustiveCheck: never = event
      }
    }

    return mergedEvents
  }
}
