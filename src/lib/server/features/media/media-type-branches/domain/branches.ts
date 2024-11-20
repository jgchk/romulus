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

    if (branch.nodes.has(mediaTypeId)) {
      return new MediaTypeAlreadyExistsInBranchError(branchId, mediaTypeId)
    }

    const event = new MediaTypeAddedInBranchEvent(branchId, mediaTypeId)

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

    if (!branch.nodes.has(childMediaTypeId)) {
      return new MediaTypeNotFoundInBranchError(branchId, childMediaTypeId)
    }

    if (!branch.nodes.has(parentMediaTypeId)) {
      return new MediaTypeNotFoundInBranchError(branchId, parentMediaTypeId)
    }

    const cycle = branch.hasPath(childMediaTypeId, parentMediaTypeId)
    if (cycle) {
      return new WillCreateCycleInMediaTypeTreeError(branchId, [...cycle, childMediaTypeId])
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
    const fromBranch = this.state.branches.get(fromBranchId)?.clone()
    if (!fromBranch) {
      return new MediaTypeBranchNotFoundError(fromBranchId)
    }

    const intoBranch = this.state.branches.get(intoBranchId)?.clone()
    if (!intoBranch) {
      return new MediaTypeBranchNotFoundError(intoBranchId)
    }

    for (const mediaTypeId of fromBranch.nodes.keys()) {
      if (!intoBranch.nodes.has(mediaTypeId)) {
        intoBranch.nodes.set(mediaTypeId, { children: new Set() })
      }
    }

    for (const [mediaTypeId, node] of fromBranch.nodes) {
      const parent = intoBranch.nodes.get(mediaTypeId)
      if (!parent) {
        return new MediaTypeNotFoundInBranchError(intoBranchId, mediaTypeId)
      }

      for (const childId of node.children) {
        const cycle = intoBranch.hasPath(childId, mediaTypeId)
        if (cycle) {
          return new WillCreateCycleInMediaTypeTreeError(intoBranchId, [...cycle, childId])
        }

        parent.children.add(childId)
      }
    }

    const event = new MediaTypeBranchesMerged(fromBranchId, intoBranchId)

    this.applyEvent(event)
    this.addEvent(event)
  }

  private applyEvent(event: MediaTypeBranchesEvent): void {
    if (event instanceof MediaTypeBranchCreatedEvent) {
      this.state.branches.set(event.id, MediaTypeBranchState.create())
    } else if (event instanceof MediaTypeAddedInBranchEvent) {
      const branch = this.state.branches.get(event.branchId)
      if (!branch) {
        throw new MediaTypeBranchNotFoundError(event.branchId)
      }

      branch.nodes.set(event.mediaTypeId, { children: new Set() })
    } else if (event instanceof ParentAddedToMediaTypeInBranchEvent) {
      const branch = this.state.branches.get(event.branchId)
      if (!branch) {
        throw new MediaTypeBranchNotFoundError(event.branchId)
      }

      const parent = branch.nodes.get(event.parentId)
      if (!parent) {
        throw new MediaTypeNotFoundInBranchError(event.branchId, event.parentId)
      }

      parent.children.add(event.childId)
    } else if (event instanceof MediaTypeBranchesMerged) {
      const fromBranch = this.state.branches.get(event.fromBranchId)
      if (!fromBranch) {
        throw new MediaTypeBranchNotFoundError(event.fromBranchId)
      }

      const intoBranch = this.state.branches.get(event.intoBranchId)
      if (!intoBranch) {
        throw new MediaTypeBranchNotFoundError(event.intoBranchId)
      }

      for (const mediaTypeId of fromBranch.nodes.keys()) {
        if (!intoBranch.nodes.has(mediaTypeId)) {
          intoBranch.nodes.set(mediaTypeId, { children: new Set() })
        }
      }

      for (const [mediaTypeId, node] of fromBranch.nodes) {
        const parent = intoBranch.nodes.get(mediaTypeId)
        if (!parent) {
          throw new MediaTypeNotFoundInBranchError(event.intoBranchId, mediaTypeId)
        }

        for (const childId of node.children) {
          const cycle = intoBranch.hasPath(childId, mediaTypeId)
          if (cycle) {
            throw new WillCreateCycleInMediaTypeTreeError(event.intoBranchId, [...cycle, childId])
          }

          parent.children.add(childId)
        }
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
  nodes: Map<string, { children: Set<string> }>

  private constructor(nodes: Map<string, { children: Set<string> }>) {
    this.nodes = nodes
  }

  static create(): MediaTypeBranchState {
    return new MediaTypeBranchState(new Map())
  }

  clone(): MediaTypeBranchState {
    return new MediaTypeBranchState(new Map(structuredClone(this.nodes)))
  }

  hasPath(source: string, destination: string): string[] | undefined {
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
}
