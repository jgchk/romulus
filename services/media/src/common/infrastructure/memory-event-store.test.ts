import { describe, expect, test, vi } from 'vitest'

import { MemoryEventStore } from './memory-event-store.js'

// Define test event types
type TestEvent = {
  type: 'TestEvent'
  data: string
}

type AnotherTestEvent = {
  type: 'AnotherTestEvent'
  value: number
}

type TestEventSignature = {
  'test-aggregate': TestEvent
  'another-aggregate': AnotherTestEvent
}

describe('get()', () => {
  test('should retrieve events for an aggregate', () => {
    const eventStore = new MemoryEventStore<TestEventSignature>()

    eventStore.save('test-aggregate', [
      { type: 'TestEvent', data: 'test1' },
      { type: 'TestEvent', data: 'test2' },
    ])

    expect(eventStore.get('test-aggregate')).toEqual([
      {
        aggregateId: 'test-aggregate',
        version: 1,
        sequence: 0,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'test1',
          type: 'TestEvent',
        },
      },
      {
        aggregateId: 'test-aggregate',
        version: 2,
        sequence: 1,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'test2',
          type: 'TestEvent',
        },
      },
    ])
  })

  test('should return empty array when no events exist', () => {
    const eventStore = new MemoryEventStore<TestEventSignature>()

    expect(eventStore.get('test-aggregate')).toEqual([])
  })
})

describe('getAll()', () => {
  test('should retrieve all events from all streams in sequence order', () => {
    const eventStore = new MemoryEventStore<TestEventSignature>()

    // Save events for first aggregate
    eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test1' }])

    // Save events for second aggregate
    eventStore.save('another-aggregate', [{ type: 'AnotherTestEvent', value: 42 }])

    // Save more events for first aggregate
    eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test2' }])

    // All events should be returned, ordered by sequence
    expect(eventStore.getAll()).toEqual([
      {
        aggregateId: 'test-aggregate',
        version: 1,
        sequence: 0,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'test1',
          type: 'TestEvent',
        },
      },
      {
        aggregateId: 'another-aggregate',
        version: 1,
        sequence: 1,
        timestamp: expect.any(Date) as Date,
        eventData: {
          value: 42,
          type: 'AnotherTestEvent',
        },
      },
      {
        aggregateId: 'test-aggregate',
        version: 2,
        sequence: 2,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'test2',
          type: 'TestEvent',
        },
      },
    ])
  })

  test('should return empty array when no events exist', () => {
    const eventStore = new MemoryEventStore<TestEventSignature>()

    expect(eventStore.getAll()).toEqual([])
  })
})

describe('save()', () => {
  test('should save events for an aggregate', () => {
    const eventStore = new MemoryEventStore<TestEventSignature>()

    eventStore.save('test-aggregate', [
      { type: 'TestEvent', data: 'test1' },
      { type: 'TestEvent', data: 'test2' },
    ])

    expect(eventStore.get('test-aggregate')).toEqual([
      {
        aggregateId: 'test-aggregate',
        version: 1,
        sequence: 0,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'test1',
          type: 'TestEvent',
        },
      },
      {
        aggregateId: 'test-aggregate',
        version: 2,
        sequence: 1,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'test2',
          type: 'TestEvent',
        },
      },
    ])
  })

  test('should do nothing when saving an empty array', () => {
    const eventStore = new MemoryEventStore<TestEventSignature>()

    eventStore.save('test-aggregate', [])

    expect(eventStore.get('test-aggregate')).toEqual([])
  })

  test('should increment version correctly for existing aggregate', () => {
    const eventStore = new MemoryEventStore<TestEventSignature>()

    // Save initial events
    eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'initial' }])

    // Save more events
    eventStore.save('test-aggregate', [
      { type: 'TestEvent', data: 'new1' },
      { type: 'TestEvent', data: 'new2' },
    ])

    expect(eventStore.get('test-aggregate')).toEqual([
      {
        aggregateId: 'test-aggregate',
        version: 1,
        sequence: 0,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'initial',
          type: 'TestEvent',
        },
      },
      {
        aggregateId: 'test-aggregate',
        version: 2,
        sequence: 1,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'new1',
          type: 'TestEvent',
        },
      },
      {
        aggregateId: 'test-aggregate',
        version: 3,
        sequence: 2,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'new2',
          type: 'TestEvent',
        },
      },
    ])
  })

  test('should handle multiple aggregates correctly', () => {
    const eventStore = new MemoryEventStore<TestEventSignature>()

    // Save events for first aggregate
    eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test1' }])

    // Save events for second aggregate
    eventStore.save('another-aggregate', [{ type: 'AnotherTestEvent', value: 42 }])

    expect(eventStore.get('test-aggregate')).toEqual([
      {
        aggregateId: 'test-aggregate',
        version: 1,
        sequence: 0,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'test1',
          type: 'TestEvent',
        },
      },
    ])

    expect(eventStore.get('another-aggregate')).toEqual([
      {
        aggregateId: 'another-aggregate',
        version: 1,
        sequence: 1,
        timestamp: expect.any(Date) as Date,
        eventData: {
          value: 42,
          type: 'AnotherTestEvent',
        },
      },
    ])
  })
})

describe('on()/off()', () => {
  test('should emit events to subscribers', () => {
    const eventStore = new MemoryEventStore<TestEventSignature>()

    // Set up subscriber
    const subscriber = vi.fn()
    eventStore.on('test-aggregate', subscriber)

    // Save events
    const events: TestEvent[] = [{ type: 'TestEvent', data: 'test1' }]
    eventStore.save('test-aggregate', events)

    // Verify subscriber was called
    expect(subscriber).toHaveBeenCalledWith([
      {
        aggregateId: 'test-aggregate',
        eventData: {
          data: 'test1',
          type: 'TestEvent',
        },
        sequence: 0,
        timestamp: expect.any(Date) as Date,
        version: 1,
      },
    ])

    // Remove subscriber
    eventStore.off('test-aggregate', subscriber)

    // Save more events
    const moreEvents: TestEvent[] = [{ type: 'TestEvent', data: 'test2' }]
    eventStore.save('test-aggregate', moreEvents)

    // Verify subscriber was not called again
    expect(subscriber).toHaveBeenCalledTimes(1)
  })

  test('should not emit events for unsubscribed aggregates', () => {
    const eventStore = new MemoryEventStore<TestEventSignature>()

    // Set up subscriber for one aggregate
    const subscriber = vi.fn()
    eventStore.on('test-aggregate', subscriber)

    // Save events for different aggregate
    eventStore.save('another-aggregate', [{ type: 'AnotherTestEvent', value: 42 }])

    // Verify subscriber was not called
    expect(subscriber).not.toHaveBeenCalled()
  })

  test('should allow multiple subscribers for the same aggregate', () => {
    const eventStore = new MemoryEventStore<TestEventSignature>()

    // Set up subscribers
    const subscriber1 = vi.fn()
    const subscriber2 = vi.fn()
    eventStore.on('test-aggregate', subscriber1)
    eventStore.on('test-aggregate', subscriber2)

    // Save events
    eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test' }])

    // Verify both subscribers were called
    expect(subscriber1).toHaveBeenCalled()
    expect(subscriber2).toHaveBeenCalled()
  })
})
