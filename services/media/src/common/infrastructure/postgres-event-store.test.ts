import { sql } from 'drizzle-orm'
import { afterAll, describe, expect, test as base, vi } from 'vitest'

import type { IDrizzleEventStoreConnection } from './drizzle/event-store/connection.js'
import { getPGliteDbConnection, getPGlitePostgresConnection } from './drizzle/event-store/pglite.js'
import { migratePGlite } from './drizzle/migrate.js'
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

const pg = getPGlitePostgresConnection()
const db = getPGliteDbConnection(pg)

afterAll(async () => {
  await pg.close()
})

export const test = base.extend<{ dbConnection: IDrizzleEventStoreConnection }>({
  // eslint-disable-next-line no-empty-pattern
  dbConnection: async ({}, use) => {
    await migratePGlite(db)

    await use(db)

    await db.execute(sql`drop schema if exists public cascade`)
    await db.execute(sql`create schema public`)
    await db.execute(sql`drop schema if exists drizzle cascade`)
  },
})

describe('get()', () => {
  test('should retrieve events for an aggregate', async ({ dbConnection }) => {
    const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)

    await eventStore.save('test-aggregate', [
      { type: 'TestEvent', data: 'test1' },
      { type: 'TestEvent', data: 'test2' },
    ])

    expect(await eventStore.get('test-aggregate')).toEqual([
      {
        aggregateId: 'test-aggregate',
        version: 1,
        sequence: 1,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'test1',
          type: 'TestEvent',
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

  test('should return empty array when no events exist', async ({ dbConnection }) => {
    const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)

    expect(await eventStore.get('test-aggregate')).toEqual([])
  })
})

describe('getAll()', () => {
  test('should retrieve all events from all streams in sequence order', async ({
    dbConnection,
  }) => {
    const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)

    // Save events for first aggregate
    await eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test1' }])

    // Save events for second aggregate
    await eventStore.save('another-aggregate', [{ type: 'AnotherTestEvent', value: 42 }])

    // Save more events for first aggregate
    await eventStore.save('test-aggregate', [{ type: 'TestEvent', data: 'test2' }])

    // All events should be returned, ordered by sequence
    expect(await eventStore.getAll()).toEqual([
      {
        aggregateId: 'test-aggregate',
        version: 1,
        sequence: 1,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'test1',
          type: 'TestEvent',
        },
      },
      {
        aggregateId: 'another-aggregate',
        version: 1,
        sequence: 2,
        timestamp: expect.any(Date) as Date,
        eventData: {
          value: 42,
          type: 'AnotherTestEvent',
        },
      },
      {
        aggregateId: 'test-aggregate',
        version: 2,
        sequence: 3,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'test2',
          type: 'TestEvent',
        },
      },
    ])
  })

  test('should return empty array when no events exist', async ({ dbConnection }) => {
    const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)

    expect(await eventStore.getAll()).toEqual([])
  })
})

describe('save()', () => {
  test('should save events for an aggregate', async ({ dbConnection }) => {
    const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)

    await eventStore.save('test-aggregate', [
      { type: 'TestEvent', data: 'test1' },
      { type: 'TestEvent', data: 'test2' },
    ])

    expect(await eventStore.get('test-aggregate')).toEqual([
      {
        aggregateId: 'test-aggregate',
        version: 1,
        sequence: 1,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'test1',
          type: 'TestEvent',
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

  test('should do nothing when saving an empty array', async ({ dbConnection }) => {
    const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)

    await eventStore.save('test-aggregate', [])

    expect(await eventStore.get('test-aggregate')).toEqual([])
  })

  test('should handle multiple aggregates correctly', async ({ dbConnection }) => {
    const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)

    // Save events for first aggregate
    const events1: TestEvent[] = [{ type: 'TestEvent', data: 'test1' }]
    await eventStore.save('test-aggregate', events1)

    // Save events for second aggregate
    const events2: AnotherTestEvent[] = [{ type: 'AnotherTestEvent', value: 42 }]
    await eventStore.save('another-aggregate', events2)

    expect(await eventStore.get('test-aggregate')).toEqual([
      {
        aggregateId: 'test-aggregate',
        version: 1,
        sequence: 1,
        timestamp: expect.any(Date) as Date,
        eventData: {
          data: 'test1',
          type: 'TestEvent',
        },
      },
    ])

    expect(await eventStore.get('another-aggregate')).toEqual([
      {
        aggregateId: 'another-aggregate',
        version: 1,
        sequence: 2,
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
  test('PostgresEventStore should emit events to subscribers', async ({ dbConnection }) => {
    const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)

    // Set up subscriber
    const subscriber = vi.fn()
    eventStore.on('test-aggregate', subscriber)

    // Save events
    const events: TestEvent[] = [{ type: 'TestEvent', data: 'test1' }]
    await eventStore.save('test-aggregate', events)

    // Verify subscriber was called
    expect(subscriber).toHaveBeenCalledWith([
      {
        aggregateId: 'test-aggregate',
        eventData: {
          data: 'test1',
          type: 'TestEvent',
        },
        sequence: 1,
        timestamp: expect.any(Date) as Date,
        version: 1,
      },
    ])

    // Remove subscriber
    eventStore.off('test-aggregate', subscriber)

    // Save more events
    const moreEvents: TestEvent[] = [{ type: 'TestEvent', data: 'test2' }]
    await eventStore.save('test-aggregate', moreEvents)

    // Verify subscriber was not called again
    expect(subscriber).toHaveBeenCalledTimes(1)
  })
})
