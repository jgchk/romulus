export type IEventStore<Event> = {
  get(id: string): Event[] | undefined
  getAll(): Event[]
  save(id: string, events: Event[]): void
}
