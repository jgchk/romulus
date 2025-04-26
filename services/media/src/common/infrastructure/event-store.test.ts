import { sql } from 'drizzle-orm'
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { getPGliteDbConnection, getPGlitePostgresConnection } from './drizzle/event-store/pglite.js'
import { migratePGlite } from './drizzle/migrate.js'
import type { IEventStore } from './event-store.js'
import { MemoryEventStore } from './memory-event-store.js'
import { PostgresEventStore } from './postgres-event-store.js'

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

// Setup for Postgres connection
const pg = getPGlitePostgresConnection()
const db = getPGliteDbConnection(pg)

// Clean up Postgres connection after all tests
afterAll(async () => {
  await pg.close()
})

// Define store implementations for testing
type StoreImplementation = {
  name: string
  createStore: () => IEventStore<TestEventSignature>
  beforeEach?: () => Promise<void>
}

// Memory implementation
const memoryImplementation: StoreImplementation = {
  name: 'MemoryEventStore',
  createStore: () => new MemoryEventStore<TestEventSignature>(),
}

// Postgres implementation
const postgresImplementation: StoreImplementation = {
  name: 'PostgresEventStore',
  createStore: () => new PostgresEventStore<TestEventSignature>(db),
  beforeEach: async () => {
    // Reset the database before each test
    await db.execute(sql`drop schema if exists public cascade`)
    await db.execute(sql`create schema public`)
    await db.execute(sql`drop schema if exists drizzle cascade`)
    await migratePGlite(db)
  },
}

// Run tests for all implementations
const implementations = [memoryImplementation, postgresImplementation]

describe.each(implementations)('$name', ({ createStore, beforeEach: setup }) => {
  // Run setup before each test if provided
  if (setup) {
    beforeEach(setup)
  }

  describe('get()', () => {
    test('should retrieve events for an aggregate', async () => {
      const eventStore = createStore()

      await eventStore.save('test-aggregate', [
        { type: 'TestEvent', data: 'test1' },
        { type: 'TestEvent', data: 'test2' },
      ])

      const events = await eventStore.get('test-aggregate')
      expect(events).toHaveLength(2)
      expect(events[0]).toMatchObject({
        aggregateId: 'test-aggregate',
        eventData: {
          data: 'test1',
          type: 'TestEvent',
        },
      })
      expect(events[1]).toMatchObject({
        aggregateId: 'test-aggregate',
        eventData: {
          data: 'test2',
          type: 'TestEvent',
        },
      })
    })

    test('should return empty array when no events exist', async () => {
      const eventStore = createStore()

      const events = await eventStore.get('test-aggregate')
      expect(events).toEqual([])
    })
  })

  describe('getAll()', () => {
    test('should retrieve all events from all streams in sequence order', async () => {
      const eventStore = createStore()

      // Save events for first aggregate
      await eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test1' }])

      // Save events for second aggregate
      await eventStore.save('another-aggregate', [{ type: 'AnotherTestEvent', value: 42 }])

      // Save more events for first aggregate
      await eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test2' }])

      // All events should be returned, ordered by sequence
      const events = await eventStore.getAll()
      expect(events).toHaveLength(3)

      expect(events).toEqual([
        {
          aggregateId: 'test-aggregate',
          version: 1,
          sequence: 1,
          timestamp: expect.any(Date) as Date,
          eventData: {
            type: 'TestEvent',
            data: 'test1',
          },
        },
        {
          aggregateId: 'another-aggregate',
          version: 1,
          sequence: 2,
          timestamp: expect.any(Date) as Date,
          eventData: {
            type: 'AnotherTestEvent',
            value: 42,
          },
        },
        {
          aggregateId: 'test-aggregate',
          version: 2,
          sequence: 3,
          timestamp: expect.any(Date) as Date,
          eventData: {
            type: 'TestEvent',
            data: 'test2',
          },
        },
      ])
    })

    test('should return empty array when no events exist', async () => {
      const eventStore = createStore()

      const events = await eventStore.getAll()
      expect(events).toEqual([])
    })
  })

  describe('save()', () => {
    test('should save events for an aggregate', async () => {
      const eventStore = createStore()

      await eventStore.save('test-aggregate', [
        { type: 'TestEvent', data: 'test1' },
        { type: 'TestEvent', data: 'test2' },
      ])

      const events = await eventStore.get('test-aggregate')
      expect(events).toEqual([
        {
          aggregateId: 'test-aggregate',
          version: 1,
          sequence: 1,
          timestamp: expect.any(Date) as Date,
          eventData: {
            type: 'TestEvent',
            data: 'test1',
          },
        },
        {
          aggregateId: 'test-aggregate',
          version: 2,
          sequence: 2,
          timestamp: expect.any(Date) as Date,
          eventData: {
            type: 'TestEvent',
            data: 'test2',
          },
        },
      ])
    })

    test('should do nothing when saving an empty array', async () => {
      const eventStore = createStore()

      await eventStore.save('test-aggregate', [])

      const events = await eventStore.get('test-aggregate')
      expect(events).toEqual([])
    })

    test('should increment version correctly for existing aggregate', async () => {
      const eventStore = createStore()

      // Save initial events
      await eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'initial' }])

      // Save more events
      await eventStore.save('test-aggregate', [
        { type: 'TestEvent', data: 'new1' },
        { type: 'TestEvent', data: 'new2' },
      ])

      const events = await eventStore.get('test-aggregate')
      expect(events).toEqual([
        {
          aggregateId: 'test-aggregate',
          eventData: {
            data: 'initial',
            type: 'TestEvent',
          },
          sequence: 1,
          timestamp: expect.any(Date) as Date,
          version: 1,
        },
        {
          aggregateId: 'test-aggregate',
          eventData: {
            data: 'new1',
            type: 'TestEvent',
          },
          sequence: 2,
          timestamp: expect.any(Date) as Date,
          version: 2,
        },
        {
          aggregateId: 'test-aggregate',
          eventData: {
            data: 'new2',
            type: 'TestEvent',
          },
          sequence: 3,
          timestamp: expect.any(Date) as Date,
          version: 3,
        },
      ])
      expect(events).toHaveLength(3)

      // Check the versions are correct
      expect(events[0]?.version).toBe(1)
      expect(events[1]?.version).toBe(2)
      expect(events[2]?.version).toBe(3)
    })

    test('should handle multiple aggregates correctly', async () => {
      const eventStore = createStore()

      // Save events for first aggregate
      await eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test1' }])

      // Save events for second aggregate
      await eventStore.save('another-aggregate', [{ type: 'AnotherTestEvent', value: 42 }])

      const testAggregateEvents = await eventStore.get('test-aggregate')
      expect(testAggregateEvents).toHaveLength(1)
      expect(testAggregateEvents[0]).toMatchObject({
        aggregateId: 'test-aggregate',
        version: 1,
        eventData: {
          data: 'test1',
          type: 'TestEvent',
        },
      })

      const anotherAggregateEvents = await eventStore.get('another-aggregate')
      expect(anotherAggregateEvents).toHaveLength(1)
      expect(anotherAggregateEvents[0]).toMatchObject({
        aggregateId: 'another-aggregate',
        version: 1,
        eventData: {
          value: 42,
          type: 'AnotherTestEvent',
        },
      })
    })
  })

  describe('on()/off()', () => {
    test('should emit events to subscribers', async () => {
      const eventStore = createStore()

      // Set up subscriber
      const subscriber = vi.fn()
      eventStore.on('test-aggregate', subscriber)

      // Save events
      const events: TestEvent[] = [{ type: 'TestEvent', data: 'test1' }]
      await eventStore.save('test-aggregate', events)

      // Verify subscriber was called
      expect(subscriber).toHaveBeenCalledTimes(1)
      expect(subscriber).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            aggregateId: 'test-aggregate',
            eventData: {
              data: 'test1',
              type: 'TestEvent',
            },
          }),
        ]),
      )

      // Remove subscriber
      eventStore.off('test-aggregate', subscriber)

      // Save more events
      const moreEvents: TestEvent[] = [{ type: 'TestEvent', data: 'test2' }]
      await eventStore.save('test-aggregate', moreEvents)

      // Verify subscriber was not called again
      expect(subscriber).toHaveBeenCalledTimes(1)
    })

    test('should not emit events for unsubscribed aggregates', async () => {
      const eventStore = createStore()

      // Set up subscriber for one aggregate
      const subscriber = vi.fn()
      eventStore.on('test-aggregate', subscriber)

      // Save events for different aggregate
      await eventStore.save('another-aggregate', [{ type: 'AnotherTestEvent', value: 42 }])

      // Verify subscriber was not called
      expect(subscriber).not.toHaveBeenCalled()
    })

    test('should allow multiple subscribers for the same aggregate', async () => {
      const eventStore = createStore()

      // Set up subscribers
      const subscriber1 = vi.fn()
      const subscriber2 = vi.fn()
      eventStore.on('test-aggregate', subscriber1)
      eventStore.on('test-aggregate', subscriber2)

      // Save events
      await eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test' }])

      // Verify both subscribers were called
      expect(subscriber1).toHaveBeenCalled()
      expect(subscriber2).toHaveBeenCalled()
    })
  })

  describe('onAll()/offAll()', () => {
    test('should emit all events to global subscribers', async () => {
      const eventStore = createStore()

      // Set up global subscriber
      const subscriber = vi.fn()
      eventStore.onAll(subscriber)

      // Save events to first aggregate
      await eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test1' }])

      // Verify subscriber was called
      expect(subscriber).toHaveBeenCalledTimes(1)
      expect(subscriber).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            aggregateId: 'test-aggregate',
            eventData: {
              data: 'test1',
              type: 'TestEvent',
            },
          }),
        ]),
      )

      // Reset mock
      subscriber.mockClear()

      // Save events to second aggregate
      await eventStore.save('another-aggregate', [{ type: 'AnotherTestEvent', value: 42 }])

      // Verify subscriber was called again, with events from the second aggregate
      expect(subscriber).toHaveBeenCalledTimes(1)
      expect(subscriber).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            aggregateId: 'another-aggregate',
            eventData: {
              value: 42,
              type: 'AnotherTestEvent',
            },
          }),
        ]),
      )
    })

    test('should allow unsubscribing from all events', async () => {
      const eventStore = createStore()

      // Set up global subscriber
      const subscriber = vi.fn()
      eventStore.onAll(subscriber)

      // Save events
      await eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test1' }])

      // Verify subscriber was called
      expect(subscriber).toHaveBeenCalledTimes(1)

      // Unsubscribe
      eventStore.offAll(subscriber)
      subscriber.mockClear()

      // Save more events
      await eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test2' }])
      await eventStore.save('another-aggregate', [{ type: 'AnotherTestEvent', value: 42 }])

      // Verify subscriber was not called again
      expect(subscriber).not.toHaveBeenCalled()
    })

    test('should allow multiple global subscribers', async () => {
      const eventStore = createStore()

      // Set up global subscribers
      const subscriber1 = vi.fn()
      const subscriber2 = vi.fn()
      eventStore.onAll(subscriber1)
      eventStore.onAll(subscriber2)

      // Save events
      await eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test' }])

      // Verify both subscribers were called
      expect(subscriber1).toHaveBeenCalledTimes(1)
      expect(subscriber2).toHaveBeenCalledTimes(1)
    })

    test('should work alongside aggregate-specific subscribers', async () => {
      const eventStore = createStore()

      // Set up subscribers
      const specificSubscriber = vi.fn()
      const globalSubscriber = vi.fn()
      eventStore.on('test-aggregate', specificSubscriber)
      eventStore.onAll(globalSubscriber)

      // Save events to first aggregate
      await eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test1' }])

      // Verify both subscribers were called
      expect(specificSubscriber).toHaveBeenCalledTimes(1)
      expect(globalSubscriber).toHaveBeenCalledTimes(1)

      // Reset mocks
      specificSubscriber.mockClear()
      globalSubscriber.mockClear()

      // Save events to second aggregate
      await eventStore.save('another-aggregate', [{ type: 'AnotherTestEvent', value: 42 }])

      // Verify only global subscriber was called
      expect(specificSubscriber).not.toHaveBeenCalled()
      expect(globalSubscriber).toHaveBeenCalledTimes(1)
    })
  })
})
