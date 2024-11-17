import type { IEvent } from '../events/event'

export class CreateMediaTypeEvent implements IEvent {
  constructor(public readonly name: string) {}

  process() {
    // TODO
  }
}

export class AddMediaTypeParentEvent implements IEvent {
  constructor(
    public readonly mediaTypeId: number,
    public readonly parentId: number,
  ) {}

  process() {
    // TODO
  }
}
