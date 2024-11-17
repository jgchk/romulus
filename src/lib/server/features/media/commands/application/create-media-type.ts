import type { IEventStore } from '../domain/events/event-store'
import { CreateMediaTypeEvent } from '../domain/media-type/events'

export class CreateMediaTypeCommand {
  constructor(private eventStore: IEventStore) {}

  async execute(name: string) {
    const event = new CreateMediaTypeEvent(name)
    event.process()
    await this.eventStore.save(event)
  }
}
