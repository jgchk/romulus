import type { MediaTypeEvent } from './events'
import { MediaTypeMetadataUpdatedEvent } from './events/metadata-updated'

export class MediaType {
  private name: string
  private description: string
  private notes: string

  constructor(public readonly id: number) {
    this.name = ''
    this.description = ''
    this.notes = ''
  }

  apply(event: MediaTypeEvent): void {
    if (event instanceof MediaTypeMetadataUpdatedEvent) {
      this.name = event.name
      this.description = event.description
      this.notes = event.notes
    }
  }

  updateMetadata(name: string, description: string, notes: string): MediaTypeMetadataUpdatedEvent {
    const event = new MediaTypeMetadataUpdatedEvent(this.id, name, description, notes)
    this.apply(event)
    return event
  }

  getMetadata(): { name: string; description: string; notes: string } {
    return {
      name: this.name,
      description: this.description,
      notes: this.notes,
    }
  }
}
