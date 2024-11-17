import type { IEvent } from '../../event-store/event'
import type { CycleError, MediaTypeNotFoundError } from '../tree'
import { type MediaTypeTree } from '../tree'

export class AddParentToMediaTypeEvent implements IEvent {
  constructor(
    public readonly id: number,
    public readonly parentId: number,
  ) {}

  process(tree: MediaTypeTree): void | MediaTypeNotFoundError | CycleError {
    const result = tree.addParent(this.id, this.parentId)
    if (result instanceof Error) {
      return result
    }
  }
}
