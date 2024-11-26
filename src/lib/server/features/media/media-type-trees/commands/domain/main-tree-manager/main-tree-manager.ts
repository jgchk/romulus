import { MainMediaTypeTreeSetEvent, type MainTreeManagerEvent } from './events'

export class MainTreeManager {
  private mainTreeId: string | undefined
  private uncommittedEvents: MainTreeManagerEvent[]

  private constructor(mainTreeId: string | undefined, uncommittedEvents: MainTreeManagerEvent[]) {
    this.mainTreeId = mainTreeId
    this.uncommittedEvents = uncommittedEvents
  }

  static fromEvents(events: MainTreeManagerEvent[]): MainTreeManager {
    const mainTreeManager = new MainTreeManager(undefined, [])
    for (const event of events) {
      mainTreeManager.applyEvent(event)
    }
    return mainTreeManager
  }

  getUncommittedEvents(): MainTreeManagerEvent[] {
    return [...this.uncommittedEvents]
  }

  private applyEvent(event: MainTreeManagerEvent): void {
    if (event instanceof MainMediaTypeTreeSetEvent) {
      this.mainTreeId = event.mediaTypeTreeId
    } else {
      // exhaustive check
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = event
    }
  }

  private addEvent(event: MainTreeManagerEvent): void {
    this.uncommittedEvents.push(event)
  }

  setMainTree(mediaTypeTreeId: string, userId: number): void {
    const event = new MainMediaTypeTreeSetEvent(mediaTypeTreeId, userId)

    this.applyEvent(event)
    this.addEvent(event)
  }
}
