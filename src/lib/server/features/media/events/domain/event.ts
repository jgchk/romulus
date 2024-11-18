export type IEvent<Data> = {
  id: string
  timestamp: Date
  name: string
  version: number
  eventSourceId: string
  sequence: number
  data: Data
}

export type IEventSource = {
  id: string
  type: string
  version: bigint
}
