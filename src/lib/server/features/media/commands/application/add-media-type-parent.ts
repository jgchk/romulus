import type { IEventStore } from '../domain/events/event-store'
import { AddMediaTypeParentEvent } from '../domain/media-type/events'

export class AddMediaTypeParent {
  constructor(private eventStore: IEventStore) {}

  async execute(id: number, parent: number) {
    const event = new AddMediaTypeParentEvent(id, parent)
    event.process()
    await this.eventStore.save(event)
  }
}
