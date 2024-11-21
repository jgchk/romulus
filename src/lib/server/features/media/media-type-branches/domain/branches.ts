import { CustomError } from '$lib/utils/error'

import { MediaTypeAlreadyExistsInBranchError } from './errors'
import { MediaTypeNotFoundInBranchError, WillCreateCycleInMediaTypeBranchError } from './errors'
import {
  MediaTypeBranchAlreadyExistsError,
  MediaTypeBranchNameInvalidError,
  MediaTypeBranchNotFoundError,
  MediaTypeNameInvalidError,
} from './errors'
import {
  MediaTypeAddedInBranchEvent,
  MediaTypeBranchCreatedEvent,
  MediaTypeBranchedFromAnotherBranchEvent,
  type MediaTypeBranchesEvent,
  MediaTypeBranchesMerged,
  MediaTypeRemovedFromBranchEvent,
  type MediaTypeTreeEvent,
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

  createBranch(
    id: string,
    name: string,
  ): void | MediaTypeBranchAlreadyExistsError | MediaTypeBranchNameInvalidError {
    if (this.state.hasBranch(id)) {
      return new MediaTypeBranchAlreadyExistsError(id)
    }

    const trimmedName = name.trim().replace(/\n/g, '')
    if (trimmedName.length === 0) {
      return new MediaTypeBranchNameInvalidError(name)
    }

    const event = new MediaTypeBranchCreatedEvent(id, trimmedName)

    this.applyEvent(event)
    this.addEvent(event)
  }

  createBranchFromOtherBranch(baseBranchId: string, newBranchId: string, newBranchName: string) {
    if (!this.state.hasBranch(baseBranchId)) {
      return new MediaTypeBranchNotFoundError(baseBranchId)
    }

    if (this.state.hasBranch(newBranchId)) {
      return new MediaTypeBranchAlreadyExistsError(newBranchId)
    }

    const trimmedName = newBranchName.trim().replace(/\n/g, '')
    if (trimmedName.length === 0) {
      return new MediaTypeBranchNameInvalidError(newBranchName)
    }

    const event = new MediaTypeBranchedFromAnotherBranchEvent(
      baseBranchId,
      newBranchId,
      trimmedName,
    )

    this.applyEvent(event)
    this.addEvent(event)
  }

  addMediaTypeToBranch(
    branchId: string,
    mediaTypeId: string,
    mediaTypeName: string,
  ):
    | void
    | MediaTypeBranchNotFoundError
    | MediaTypeNameInvalidError
    | MediaTypeAlreadyExistsInBranchError {
    const tree = this.state.getTreeForBranch(branchId)
    if (tree instanceof MediaTypeBranchNotFoundError) {
      return tree
    }

    const trimmedName = mediaTypeName.trim().replace(/\n/g, '')
    if (trimmedName.length === 0) {
      return new MediaTypeNameInvalidError(mediaTypeName)
    }

    const error = tree.addMediaType(mediaTypeId)
    if (error instanceof MediaTypeAlreadyExistsError) {
      return new MediaTypeAlreadyExistsInBranchError(branchId, mediaTypeId)
    }

    const event = new MediaTypeAddedInBranchEvent(branchId, mediaTypeId, trimmedName)

    this.applyEvent(event)
    this.addEvent(event)
  }

  removeMediaTypeFromBranch(
    branchId: string,
    mediaTypeId: string,
  ): void | MediaTypeBranchNotFoundError | MediaTypeNotFoundInBranchError {
    const tree = this.state.getTreeForBranch(branchId)
    if (tree instanceof MediaTypeBranchNotFoundError) {
      return tree
    }

    const error = tree.removeMediaType(mediaTypeId)
    if (error instanceof MediaTypeNotFoundError) {
      return new MediaTypeNotFoundInBranchError(branchId, mediaTypeId)
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
    | WillCreateCycleInMediaTypeBranchError {
    const tree = this.state.getTreeForBranch(branchId)
    if (tree instanceof MediaTypeBranchNotFoundError) {
      return tree
    }

    const error = tree.addChildToMediaType(parentMediaTypeId, childMediaTypeId)
    if (error instanceof MediaTypeNotFoundError) {
      return new MediaTypeNotFoundInBranchError(branchId, error.id)
    } else if (error instanceof WillCreateCycleError) {
      return new WillCreateCycleInMediaTypeBranchError(branchId, error.cycle)
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
    | MediaTypeAlreadyExistsInBranchError
    | WillCreateCycleInMediaTypeBranchError {
    const fromTree = this.state.getTreeForBranch(fromBranchId)
    if (fromTree instanceof MediaTypeBranchNotFoundError) {
      return fromTree
    }

    const intoTree = this.state.getTreeForBranch(intoBranchId)
    if (intoTree instanceof MediaTypeBranchNotFoundError) {
      return intoTree
    }

    const commonAncestor = this.state.findCommonAncestor(fromBranchId, intoBranchId)
    const commonAncestorTree = this.state.getTreeForCommit(commonAncestor)

    const error = intoTree.mergeFrom(fromTree, commonAncestorTree)
    if (error instanceof MediaTypeAlreadyExistsError) {
      return new MediaTypeAlreadyExistsInBranchError(intoBranchId, error.id)
    } else if (error instanceof WillCreateCycleError) {
      return new WillCreateCycleInMediaTypeBranchError(intoBranchId, error.cycle)
    }

    const event = new MediaTypeBranchesMerged(fromBranchId, intoBranchId)

    this.applyEvent(event)
    this.addEvent(event)
  }

  private applyEvent(event: MediaTypeBranchesEvent): void {
    if (event instanceof MediaTypeBranchCreatedEvent) {
      const error = this.state.addBranch(event.id)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof MediaTypeBranchedFromAnotherBranchEvent) {
      const error = this.state.addBranchFromBaseBranch(event.baseBranchId, event.newBranchId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof MediaTypeAddedInBranchEvent) {
      const error = this.state.addCommitToBranch(event.branchId, event)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof MediaTypeRemovedFromBranchEvent) {
      const error = this.state.addCommitToBranch(event.branchId, event)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof ParentAddedToMediaTypeInBranchEvent) {
      const error = this.state.addCommitToBranch(event.branchId, event)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof MediaTypeBranchesMerged) {
      const error = this.state.mergeBranches(event.fromBranchId, event.intoBranchId)
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
  private branches: Map<string, Branch>
  private commits: Map<string, Commit>

  private constructor(branches: Map<string, Branch>, commits: Map<string, Commit>) {
    this.branches = branches
    this.commits = commits
  }

  static create(): MediaTypeBranchesState {
    return new MediaTypeBranchesState(new Map(), new Map())
  }

  hasBranch(id: string): boolean {
    return this.branches.has(id)
  }

  addBranch(id: string): void | MediaTypeBranchAlreadyExistsError {
    if (this.branches.has(id)) {
      return new MediaTypeBranchAlreadyExistsError(id)
    }

    this.branches.set(id, Branch.create(id))
  }

  addBranchFromBaseBranch(
    baseBranchId: string,
    newBranchId: string,
  ): void | MediaTypeBranchNotFoundError | MediaTypeBranchAlreadyExistsError {
    const baseBranch = this.branches.get(baseBranchId)
    if (!baseBranch) {
      return new MediaTypeBranchNotFoundError(baseBranchId)
    }

    if (this.branches.has(newBranchId)) {
      return new MediaTypeBranchAlreadyExistsError(newBranchId)
    }

    const baseBranchCommitId = baseBranch.getCommitId()

    const newBranch =
      baseBranchCommitId === undefined
        ? Branch.create(newBranchId)
        : Branch.fromCommit(newBranchId, baseBranchCommitId)

    this.branches.set(newBranchId, newBranch)
  }

  addCommitToBranch(
    branchId: string,
    event: MediaTypeTreeEvent,
  ): void | MediaTypeBranchNotFoundError {
    const branch = this.branches.get(branchId)
    if (!branch) {
      return new MediaTypeBranchNotFoundError(branchId)
    }

    const branchCommitId = branch.getCommitId()

    const commitId = crypto.randomUUID()
    const parentIds = branchCommitId === undefined ? new Set<string>() : new Set([branchCommitId])

    const commit = new Commit(commitId, parentIds, event)
    this.commits.set(commitId, commit)

    branch.setCommitId(commitId)
  }

  mergeBranches(
    fromBranchId: string,
    intoBranchId: string,
  ):
    | void
    | MediaTypeBranchNotFoundError
    | MediaTypeAlreadyExistsInBranchError
    | WillCreateCycleInMediaTypeBranchError {
    const fromBranch = this.branches.get(fromBranchId)
    if (!fromBranch) {
      return new MediaTypeBranchNotFoundError(fromBranchId)
    }

    const intoBranch = this.branches.get(intoBranchId)
    if (!intoBranch) {
      return new MediaTypeBranchNotFoundError(intoBranchId)
    }

    const fromCommitHistory = this.getCommitHistory(fromBranch.getCommitId())
    const intoCommitHistory = this.getCommitHistory(intoBranch.getCommitId())

    // check if we can do a fast-forward commit
    const fromCommitIds = fromCommitHistory.map((commit) => commit.getId())
    const intoCommitIds = intoCommitHistory.map((commit) => commit.getId())
    if (intoCommitIds.every((id) => fromCommitIds.includes(id))) {
      intoBranch.setCommitId(fromBranch.getCommitId())
      return
    }

    // otherwise, run a three-way merge
    const commonAncestor = this.findCommonAncestor(fromBranchId, intoBranchId)
    const commonAncestorTree = this.getTreeForCommit(commonAncestor)

    const fromTree = this.getTreeForBranch(fromBranchId)
    if (fromTree instanceof MediaTypeBranchNotFoundError) {
      return fromTree
    }

    const intoTree = this.getTreeForBranch(intoBranchId)
    if (intoTree instanceof MediaTypeBranchNotFoundError) {
      return intoTree
    }

    const error = intoTree.mergeFrom(fromTree, commonAncestorTree)
    if (error instanceof MediaTypeAlreadyExistsError) {
      return new MediaTypeAlreadyExistsInBranchError(intoBranchId, error.id)
    } else if (error instanceof WillCreateCycleError) {
      return new WillCreateCycleInMediaTypeBranchError(intoBranchId, error.cycle)
    }

    const mergeCommitId = crypto.randomUUID()
    const parentIds = new Set<string>()

    const fromBranchCommitId = fromBranch.getCommitId()
    const intoBranchCommitId = intoBranch.getCommitId()
    if (fromBranchCommitId !== undefined) {
      parentIds.add(fromBranchCommitId)
    }
    if (intoBranchCommitId !== undefined) {
      parentIds.add(intoBranchCommitId)
    }

    const mergeCommit = new Commit(
      mergeCommitId,
      parentIds,
      new ThreeWayMergeEvent(fromTree.state.clone(), commonAncestorTree.state.clone()),
    )
    this.commits.set(mergeCommitId, mergeCommit)

    intoBranch.setCommitId(mergeCommitId)
  }

  getTreeForBranch(branchId: string): MediaTypeTree | MediaTypeBranchNotFoundError {
    const branch = this.branches.get(branchId)
    if (!branch) {
      return new MediaTypeBranchNotFoundError(branchId)
    }

    return this.getTreeForCommit(branch.getCommitId())
  }

  getTreeForCommit(commitId: string | undefined): MediaTypeTree {
    const commitHistory = this.getCommitHistory(commitId)
    const treeEvents = commitHistory.map((commit) => commit.getEvent())
    const tree = MediaTypeTree.fromEvents(treeEvents)
    return tree
  }

  private getCommitHistory(commitId: string | undefined): Commit[] {
    if (commitId === undefined) {
      return []
    }

    const history: Commit[] = []
    const queue = [commitId]
    while (queue.length > 0) {
      const currentId = queue.shift()!
      const commit = this.commits.get(currentId)
      if (commit === undefined) {
        continue
      }

      history.push(commit)
      queue.push(...commit.getParentIds())
    }

    return history.reverse()
  }

  findCommonAncestor(branch1Id: string, branch2Id: string): string | undefined {
    const branch1 = this.branches.get(branch1Id)
    const branch2 = this.branches.get(branch2Id)

    if (!branch1 || !branch2) {
      return undefined
    }

    const history1 = this.getCommitHistory(branch1.getCommitId()).map((commit) => commit.getId())
    const history2 = this.getCommitHistory(branch2.getCommitId()).map((commit) => commit.getId())

    // Find most recent common commit
    for (const commitId of history1.reverse()) {
      if (history2.includes(commitId)) {
        return commitId
      }
    }
  }
}

class Commit {
  private id: string
  private parentIds: Set<string>
  private event: MediaTypeTreeEvent | ThreeWayMergeEvent

  constructor(id: string, parentIds: Set<string>, event: MediaTypeTreeEvent | ThreeWayMergeEvent) {
    this.id = id
    this.parentIds = parentIds
    this.event = event
  }

  getId(): string {
    return this.id
  }

  getParentIds(): Set<string> {
    return new Set([...this.parentIds])
  }

  getEvent() {
    return this.event
  }
}

class Branch {
  private id: string
  private commitId: string | undefined

  private constructor(id: string, commitId: string | undefined) {
    this.id = id
    this.commitId = commitId
  }

  static create(id: string) {
    return new Branch(id, undefined)
  }

  static fromCommit(id: string, commitId: string) {
    return new Branch(id, commitId)
  }

  getCommitId() {
    return this.commitId
  }

  setCommitId(id: string | undefined) {
    this.commitId = id
  }
}

class ThreeWayMergeEvent {
  constructor(
    public readonly fromTree: MediaTypeTreeState,
    public readonly commonAncestorTree: MediaTypeTreeState,
  ) {}
}

class MediaTypeTree {
  private state: MediaTypeTreeState

  private constructor(state: MediaTypeTreeState) {
    this.state = state
  }

  static fromEvents(events: (MediaTypeTreeEvent | ThreeWayMergeEvent)[]) {
    const tree = new MediaTypeTree(MediaTypeTreeState.create())
    for (const event of events) {
      tree.applyEvent(event)
    }
    return tree
  }

  private applyEvent(event: MediaTypeTreeEvent | ThreeWayMergeEvent): void {
    if (event instanceof MediaTypeAddedInBranchEvent) {
      const error = this.state.addMediaType(event.mediaTypeId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof MediaTypeRemovedFromBranchEvent) {
      const error = this.state.removeMediaType(event.mediaTypeId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof ParentAddedToMediaTypeInBranchEvent) {
      const error = this.state.addChildToMediaType(event.parentId, event.childId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof ThreeWayMergeEvent) {
      const error = this.state.mergeFrom(event.fromTree, event.commonAncestorTree)
      if (error instanceof Error) {
        throw error
      }
    } else {
      // exhaustive check
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = event
    }
  }

  addMediaType(id: string): void | MediaTypeAlreadyExistsError {
    const error = this.state.clone().addMediaType(id)
    if (error instanceof Error) {
      return error
    }
  }

  removeMediaType(id: string): void | MediaTypeNotFoundError {
    const error = this.state.clone().removeMediaType(id)
    if (error instanceof Error) {
      return error
    }
  }

  addChildToMediaType(
    parentId: string,
    childId: string,
  ): void | MediaTypeNotFoundError | WillCreateCycleError {
    const error = this.state.clone().addChildToMediaType(parentId, childId)
    if (error instanceof Error) {
      return error
    }
  }

  mergeFrom(
    fromTree: MediaTypeTree,
    commonAncestorTree: MediaTypeTree,
  ): void | MediaTypeAlreadyExistsError | WillCreateCycleError {
    const error = this.state
      .clone()
      .mergeFrom(fromTree.state.clone(), commonAncestorTree.state.clone())
    if (error instanceof Error) {
      return error
    }
  }
}

class MediaTypeTreeState {
  private nodes: Map<string, MediaTypeNode>

  private constructor(nodes: Map<string, MediaTypeNode>) {
    this.nodes = nodes
  }

  static create(): MediaTypeTreeState {
    return new MediaTypeTreeState(new Map())
  }

  clone(): MediaTypeTreeState {
    return new MediaTypeTreeState(
      new Map([...this.nodes.entries()].map(([id, node]) => [id, node.clone()])),
    )
  }

  hasMediaType(id: string): boolean {
    return this.nodes.has(id)
  }

  addMediaType(id: string): void | MediaTypeAlreadyExistsError {
    if (this.nodes.has(id)) {
      return new MediaTypeAlreadyExistsError(id)
    }

    this.nodes.set(id, MediaTypeNode.create())
  }

  removeMediaType(id: string): void | MediaTypeNotFoundError {
    if (!this.nodes.has(id)) {
      return new MediaTypeNotFoundError(id)
    }

    this.moveChildrenUnderParents(id)
    this.nodes.delete(id)
  }

  private moveChildrenUnderParents(id: string): void {
    const childIds = this.getMediaTypeChildren(id)
    const parentIds = this.getMediaTypeParents(id)

    for (const parentId of parentIds) {
      for (const childId of childIds) {
        const error = this.addChildToMediaType(parentId, childId)
        if (error instanceof WillCreateCycleError) {
          throw error // should never happen
        } else if (error instanceof MediaTypeNotFoundError) {
          throw error // should never happen
        }
      }
    }
  }

  getMediaTypeChildren(id: string): Set<string> {
    return this.nodes.get(id)?.getChildren() ?? new Set()
  }

  getMediaTypeParents(id: string): Set<string> {
    const parents = new Set<string>()
    for (const [nodeId, node] of this.nodes) {
      if (node.hasChild(id)) {
        parents.add(nodeId)
      }
    }
    return parents
  }

  addChildToMediaType(
    parentId: string,
    childId: string,
  ): void | MediaTypeNotFoundError | WillCreateCycleError {
    const parent = this.nodes.get(parentId)
    if (!parent) {
      return new MediaTypeNotFoundError(parentId)
    }

    const child = this.nodes.get(childId)
    if (!child) {
      return new MediaTypeNotFoundError(childId)
    }

    const cycle = this.hasPath(childId, parentId)
    if (cycle) {
      return new WillCreateCycleError([...cycle, childId])
    }

    parent.addChild(childId)
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

      const neighbors = this.nodes.get(current)?.getChildren() ?? new Set<string>()
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

  mergeFrom(
    fromTree: MediaTypeTreeState,
    commonAncestorTree: MediaTypeTreeState,
  ): void | MediaTypeAlreadyExistsError | WillCreateCycleError {
    // 1. Handle media types that were added in fromTree since commonAncestor
    for (const [id] of fromTree.nodes) {
      if (!commonAncestorTree.hasMediaType(id) && !this.hasMediaType(id)) {
        // Media type was added in fromTree and doesn't exist in current tree
        this.addMediaType(id)
      } else if (!commonAncestorTree.hasMediaType(id) && this.hasMediaType(id)) {
        // Media type was added in both trees independently - conflict
        return new MediaTypeAlreadyExistsError(id)
      }
    }

    // 2. Handle parent-child relationships
    for (const [id, fromNode] of fromTree.nodes) {
      if (!this.hasMediaType(id)) {
        continue // Skip if media type doesn't exist in current tree
      }

      const fromChildren = fromNode.getChildren()
      const ancestorChildren = commonAncestorTree.getMediaTypeChildren(id)
      const currentChildren = this.getMediaTypeChildren(id)

      // Add new relationships from fromTree
      for (const childId of fromChildren) {
        if (!ancestorChildren.has(childId) && !currentChildren.has(childId)) {
          // Relationship was added in fromTree and doesn't exist in current tree
          const error = this.addChildToMediaType(id, childId)
          if (error instanceof WillCreateCycleError) {
            return error
          }
        }
      }

      // Remove relationships that were removed in fromTree
      for (const childId of ancestorChildren) {
        if (!fromChildren.has(childId) && currentChildren.has(childId)) {
          // Relationship was removed in fromTree but still exists in current tree
          // We don't need to check for cycles here since we're removing relationships
          const currentNode = this.nodes.get(id)
          if (currentNode) {
            currentNode.removeChild(childId)
          }
        }
      }
    }
  }
}

class MediaTypeNode {
  private children: Set<string>

  private constructor(children: Set<string>) {
    this.children = children
  }

  static create(): MediaTypeNode {
    return new MediaTypeNode(new Set())
  }

  clone(): MediaTypeNode {
    return new MediaTypeNode(new Set([...this.children]))
  }

  getChildren(): Set<string> {
    return new Set(this.children)
  }

  hasChild(childId: string): boolean {
    return this.children.has(childId)
  }

  addChild(childId: string): void {
    this.children.add(childId)
  }

  removeChild(childId: string): void {
    this.children.delete(childId)
  }
}

class MediaTypeAlreadyExistsError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeAlreadyExistsError', `Media type already exists with id: ${id}`)
  }
}

class MediaTypeNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeNotFoundError', `Media type not found with id: ${id}`)
  }
}

class WillCreateCycleError extends CustomError {
  constructor(public readonly cycle: string[]) {
    super(
      'WillCreateCycleInMediaTypeTreeError',
      `Performing this operation will create a cycle in the media type tree: ${cycle.join(' -> ')}`,
    )
  }
}
