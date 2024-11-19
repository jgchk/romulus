import { CustomError } from '$lib/utils/error'

import {
  MediaTypeAddedEvent,
  MediaTypeParentAddedEvent,
  type MediaTypeTreeEvent,
} from '../../media-type-tree/domain/events'
import type {
  CycleError,
  MediaTypeNotFoundError,
  MediaTypeTree,
} from '../../media-type-tree/domain/tree'
import {
  AddedEventToMediaTypeBranchEvent,
  type MediaTypeBranchEvent,
  MergedBranchEvent,
} from './events'

export class MediaTypeBranch {
  private state: MediaTypeBranchState
  private uncommittedEvents: MediaTypeBranchEvent[]

  private constructor(state: MediaTypeBranchState, uncommittedEvents: MediaTypeBranchEvent[]) {
    this.state = state
    this.uncommittedEvents = uncommittedEvents
  }

  static create(startingTree: MediaTypeTree): MediaTypeBranch {
    return new MediaTypeBranch(MediaTypeBranchState.create(startingTree), [])
  }

  addMediaType(): AddedEventToMediaTypeBranchEvent {
    const currentTree = this.state.getTreeWithEventsApplied()
    const treeEvent = currentTree.addMediaType()
    const event = new AddedEventToMediaTypeBranchEvent(treeEvent)

    this.applyEvent(event)
    this.addEvent(event)

    return event
  }

  addParentToMediaType(
    childId: number,
    parentId: number,
  ): AddedEventToMediaTypeBranchEvent | MediaTypeNotFoundError | CycleError {
    const currentTree = this.state.getTreeWithEventsApplied()
    const treeEvent = currentTree.addParentToMediaType(childId, parentId)
    if (treeEvent instanceof Error) {
      return treeEvent
    }

    const event = new AddedEventToMediaTypeBranchEvent(treeEvent)

    this.applyEvent(event)
    this.addEvent(event)

    return event
  }

  merge(mainTree_: MediaTypeTree): MergedBranchEvent | MediaTypeBranchNotMergableError {
    const isMergable = this.isMergable()
    if (!isMergable) {
      return new MediaTypeBranchNotMergableError()
    }

    const event = new MergedBranchEvent()

    this.applyEvent(event)
    this.addEvent(event)

    return event
  }

  applyEvent(event: MediaTypeBranchEvent): void {
    if (event instanceof AddedEventToMediaTypeBranchEvent) {
      this.state.addEvent(event.event)
    } else {
      // exhaustive check
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = event
    }
  }

  private addEvent(event: MediaTypeBranchEvent) {
    this.uncommittedEvents.push(event)
  }

  // merge(mainTree_: MediaTypeTree) {
  //   const mainTree = mainTree_.clone()
  //
  //   const idMapping = new Map<number, number>()
  //   const mergedEvents: MediaTypeTreeEvent[] = []
  //
  //   for (const event of this.mediaTypeTreeEvents) {
  //     if (event instanceof MediaTypeAddedEvent) {
  //       const newId = mainTree.addMediaType().id
  //       idMapping.set(event.id, newId)
  //       mergedEvents.push(new MediaTypeAddedEvent(newId))
  //     } else if (event instanceof MediaTypeParentAddedEvent) {
  //       const mappedParentId = idMapping.get(event.parentId) ?? event.parentId
  //       const mappedChildId = idMapping.get(event.childId) ?? event.childId
  //
  //       const result = mainTree.addParentToMediaType(mappedChildId, mappedParentId)
  //       if (result instanceof Error) {
  //         return result
  //       }
  //
  //       mergedEvents.push(result)
  //     } else {
  //       // exhaustive check
  //       // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //       const _exhaustiveCheck: never = event
  //     }
  //   }
  //
  //   return mergedEvents
  // }
}

class MediaTypeBranchState {
  private startingTree: MediaTypeTree
  private mediaTypeTreeEvents: MediaTypeTreeEvent[]

  private constructor(startingTree: MediaTypeTree, mediaTypeTreeEvents: MediaTypeTreeEvent[]) {
    this.startingTree = startingTree
    this.mediaTypeTreeEvents = mediaTypeTreeEvents
  }

  static create(startingTree: MediaTypeTree): MediaTypeBranchState {
    return new MediaTypeBranchState(startingTree, [])
  }

  addEvent(event: MediaTypeTreeEvent) {
    this.mediaTypeTreeEvents.push(event)
  }

  getEvents() {
    return this.mediaTypeTreeEvents
  }

  getTreeWithEventsApplied() {
    const tree = this.startingTree.clone()
    for (const event of this.mediaTypeTreeEvents) {
      tree.applyEvent(event)
    }
    return tree
  }
}

export class MediaTypeBranchNotMergableError extends CustomError {
  constructor() {
    super('MediaTypeBranchNotMergableError', 'Media type branch is not mergable')
  }
}
