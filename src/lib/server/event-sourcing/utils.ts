import type { InsertEvent } from './types'

export function createEvent<E extends InsertEvent>(type: E['type'], data: E['data']) {
  return {
    id: crypto.randomUUID(),
    type,
    data,
    timestamp: new Date(),
  }
}
