import {
  MediaTypeAlreadyExistsInBranchError,
  MediaTypeBranchAlreadyExistsError,
  MediaTypeBranchNotFoundError,
  MediaTypeNotFoundInBranchError,
  WillCreateCycleInMediaTypeTreeError,
} from './errors'
import {
  MediaTypeAddedInBranchEvent,
  MediaTypeBranchCreatedEvent,
  type MediaTypeBranchesEvent,
  MediaTypeBranchesMerged,
  MediaTypeRemovedFromBranchEvent,
  ParentAddedToMediaTypeInBranchEvent,
} from './events'

export class MediaTypeBranches {
  private state: MediaTypeBranchesState
  private uncommittedEvents: MediaTypeBranchesEvent[]

  private constructor(state: MediaTypeBranchesState, uncommittedEvents: MediaTypeBranchesEvent[]) {
    this.state = state
    this.uncommittedEvents = uncommittedEvents
  }

  static create(): MediaTypeBranches {
    return new MediaTypeBranches(MediaTypeBranchesState.create(), [])
  }

  static fromEvents(events: MediaTypeBranchesEvent[]): MediaTypeBranches {
    const mediaTypeBranches = new MediaTypeBranches(MediaTypeBranchesState.create(), [])
    for (const event of events) {
      mediaTypeBranches.applyEvent(event)
    }
    return mediaTypeBranches
  }

  createBranch(id: string): void | MediaTypeBranchAlreadyExistsError {
    if (this.state.branches.has(id)) {
      return new MediaTypeBranchAlreadyExistsError(id)
    }

    const event = new MediaTypeBranchCreatedEvent(id)

    this.applyEvent(event)
    this.addEvent(event)
  }

  addMediaTypeToBranch(
    branchId: string,
    mediaTypeId: string,
  ): void | MediaTypeBranchNotFoundError | MediaTypeAlreadyExistsInBranchError {
    const branch = this.state.branches.get(branchId)
    if (!branch) {
      return new MediaTypeBranchNotFoundError(branchId)
    }

    const error = branch.clone().addMediaType(mediaTypeId)
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeAddedInBranchEvent(branchId, mediaTypeId)

    this.applyEvent(event)
    this.addEvent(event)
  }

  removeMediaTypeFromBranch(
    branchId: string,
    mediaTypeId: string,
  ): void | MediaTypeBranchNotFoundError | MediaTypeNotFoundInBranchError {
    const branch = this.state.branches.get(branchId)
    if (!branch) {
      return new MediaTypeBranchNotFoundError(branchId)
    }

    const error = branch.clone().removeMediaType(mediaTypeId)
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeRemovedFromBranchEvent(branchId, mediaTypeId)

    this.applyEvent(event)
    this.addEvent(event)
  }

  addParentToMediaTypeInBranch(
    branchId: string,
    childMediaTypeId: string,
    parentMediaTypeId: string,
  ):
    | void
    | MediaTypeBranchNotFoundError
    | MediaTypeNotFoundInBranchError
    | WillCreateCycleInMediaTypeTreeError {
    const branch = this.state.branches.get(branchId)
    if (!branch) {
      return new MediaTypeBranchNotFoundError(branchId)
    }

    const error = branch.clone().addChildToMediaType(parentMediaTypeId, childMediaTypeId)
    if (error instanceof Error) {
      return error
    }

    const event = new ParentAddedToMediaTypeInBranchEvent(
      branchId,
      childMediaTypeId,
      parentMediaTypeId,
    )

    this.applyEvent(event)
    this.addEvent(event)
  }

  mergeBranches(
    fromBranchId: string,
    intoBranchId: string,
  ):
    | void
    | MediaTypeBranchNotFoundError
    | MediaTypeNotFoundInBranchError
    | WillCreateCycleInMediaTypeTreeError {
    const fromBranch = this.state.branches.get(fromBranchId)
    if (!fromBranch) {
      return new MediaTypeBranchNotFoundError(fromBranchId)
    }

    const intoBranch = this.state.branches.get(intoBranchId)
    if (!intoBranch) {
      return new MediaTypeBranchNotFoundError(intoBranchId)
    }

    const error = fromBranch.clone().mergeInto(intoBranch.clone())
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeBranchesMerged(fromBranchId, intoBranchId)

    this.applyEvent(event)
    this.addEvent(event)
  }

  private applyEvent(event: MediaTypeBranchesEvent): void {
    if (event instanceof MediaTypeBranchCreatedEvent) {
      this.state.branches.set(event.id, MediaTypeBranchState.create(event.id))
    } else if (event instanceof MediaTypeAddedInBranchEvent) {
      const branch = this.state.branches.get(event.branchId)
      if (!branch) {
        throw new MediaTypeBranchNotFoundError(event.branchId)
      }

      const error = branch.addMediaType(event.mediaTypeId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof MediaTypeRemovedFromBranchEvent) {
      const branch = this.state.branches.get(event.branchId)
      if (!branch) {
        throw new MediaTypeBranchNotFoundError(event.branchId)
      }

      const error = branch.removeMediaType(event.mediaTypeId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof ParentAddedToMediaTypeInBranchEvent) {
      const branch = this.state.branches.get(event.branchId)
      if (!branch) {
        throw new MediaTypeBranchNotFoundError(event.branchId)
      }

      const error = branch.addChildToMediaType(event.parentId, event.childId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof MediaTypeBranchesMerged) {
      const fromBranch = this.state.branches.get(event.fromBranchId)
      if (!fromBranch) {
        throw new MediaTypeBranchNotFoundError(event.fromBranchId)
      }

      const intoBranch = this.state.branches.get(event.intoBranchId)
      if (!intoBranch) {
        throw new MediaTypeBranchNotFoundError(event.intoBranchId)
      }

      const error = fromBranch.mergeInto(intoBranch)
      if (error instanceof Error) {
        throw error
      }
    } else {
      // exhaustive check
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = event
    }
  }

  private addEvent(event: MediaTypeBranchesEvent): void {
    this.uncommittedEvents.push(event)
  }

  getUncommittedEvents(): MediaTypeBranchesEvent[] {
    return this.uncommittedEvents
  }
}

class MediaTypeBranchesState {
  branches: Map<string, MediaTypeBranchState>

  private constructor(branches: Map<string, MediaTypeBranchState>) {
    this.branches = branches
  }

  static create(): MediaTypeBranchesState {
    return new MediaTypeBranchesState(new Map())
  }
}

class MediaTypeBranchState {
  private id: string
  private nodes: Map<string, { children: Set<string> }>

  private constructor(id: string, nodes: Map<string, { children: Set<string> }>) {
    this.id = id
    this.nodes = nodes
  }

  static create(id: string): MediaTypeBranchState {
    return new MediaTypeBranchState(id, new Map())
  }

  clone(): MediaTypeBranchState {
    return new MediaTypeBranchState(this.id, new Map(structuredClone(this.nodes)))
  }

  addMediaType(id: string): void | MediaTypeAlreadyExistsInBranchError {
    if (this.nodes.has(id)) {
      return new MediaTypeAlreadyExistsInBranchError(this.id, id)
    }

    this.addMediaTypeWithoutDuplicateCheck(id)
  }

  private addMediaTypeWithoutDuplicateCheck(id: string) {
    this.nodes.set(id, { children: new Set() })
  }

  removeMediaType(id: string): void | MediaTypeNotFoundInBranchError {
    const error = this.moveChildrenUnderParents(id)
    if (error instanceof Error) {
      return error
    }

    this.nodes.delete(id)
  }

  private moveChildrenUnderParents(id: string): void | MediaTypeNotFoundInBranchError {
    const node = this.nodes.get(id)
    if (!node) {
      return new MediaTypeNotFoundInBranchError(this.id, id)
    }

    const childIds = node.children
    const parentIds = this.getMediaTypeParents(id)

    for (const parentId of parentIds) {
      for (const childId of childIds) {
        const error = this.addMediaTypeChildWithoutCycleCheck(parentId, childId)
        if (error instanceof Error) {
          return error
        }
      }
    }
  }

  private getMediaTypeParents(id: string): Set<string> {
    const parents = new Set<string>()

    for (const [nodeId, node] of this.nodes) {
      if (node.children.has(id)) {
        parents.add(nodeId)
      }
    }

    return parents
  }

  addChildToMediaType(
    parentId: string,
    childId: string,
  ): void | MediaTypeNotFoundInBranchError | WillCreateCycleInMediaTypeTreeError {
    const cycle = this.hasPath(childId, parentId)
    if (cycle) {
      return new WillCreateCycleInMediaTypeTreeError(this.id, [...cycle, childId])
    }

    return this.addMediaTypeChildWithoutCycleCheck(parentId, childId)
  }

  private addMediaTypeChildWithoutCycleCheck(
    parentId: string,
    childId: string,
  ): void | MediaTypeNotFoundInBranchError {
    const parent = this.nodes.get(parentId)
    if (!parent) {
      return new MediaTypeNotFoundInBranchError(this.id, parentId)
    }

    const child = this.nodes.get(childId)
    if (!child) {
      return new MediaTypeNotFoundInBranchError(this.id, childId)
    }

    parent.children.add(childId)
  }

  private hasPath(source: string, destination: string): string[] | undefined {
    const visited = new Set<string>()
    const path: string[] = []

    const dfs = (current: string): string[] | undefined => {
      if (current === destination) {
        return [...path, current]
      }

      visited.add(current)
      path.push(current)

      const neighbors = this.nodes.get(current)?.children ?? new Set<string>()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const cyclePath = dfs(neighbor)
          if (cyclePath) {
            return cyclePath
          }
        }
      }

      path.pop()
    }

    return dfs(source)
  }

  mergeInto(
    intoBranch: MediaTypeBranchState,
  ): void | MediaTypeNotFoundInBranchError | WillCreateCycleInMediaTypeTreeError {
    for (const mediaTypeId of this.nodes.keys()) {
      if (!intoBranch.nodes.has(mediaTypeId)) {
        intoBranch.addMediaTypeWithoutDuplicateCheck(mediaTypeId)
      }
    }

    for (const [mediaTypeId, node] of this.nodes) {
      for (const childId of node.children) {
        const error = intoBranch.addChildToMediaType(mediaTypeId, childId)
        if (error instanceof Error) {
          return error
        }
      }
    }
  }
}
