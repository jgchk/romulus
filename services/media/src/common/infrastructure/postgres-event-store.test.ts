import { sql } from 'drizzle-orm'
import { afterAll, describe, expect, test as base, vi } from 'vitest'

import type { IDrizzleEventStoreConnection } from './drizzle/event-store/connection.js'
import { getPGliteDbConnection, getPGlitePostgresConnection } from './drizzle/event-store/pglite.js'
import { eventsTable } from './drizzle/event-store/schema.js'
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

    const events = await eventStore.get('test-aggregate')

    expect(events).toEqual([
      {
        data: 'test1',
        type: 'TestEvent',
      },
      {
        data: 'test2',
        type: 'TestEvent',
      },
    ])
  })

  test('should return empty array when no events exist', async ({ dbConnection }) => {
    const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)

    const events = await eventStore.get('test-aggregate')

    expect(events).toEqual([])
  })
})

describe('save()', () => {
  test('should save events for an aggregate', async ({ dbConnection }) => {
    const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)

    await eventStore.save('test-aggregate', [
      { type: 'TestEvent', data: 'test1' },
      { type: 'TestEvent', data: 'test2' },
    ])

    const events = await eventStore.get('test-aggregate')

    expect(events).toEqual([
      {
        data: 'test1',
        type: 'TestEvent',
      },
      {
        data: 'test2',
        type: 'TestEvent',
      },
    ])
  })

  test('should do nothing when saving an empty array', async ({ dbConnection }) => {
    const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)

    await eventStore.save('test-aggregate', [])

    const events = await eventStore.get('test-aggregate')

    expect(events).toEqual([])
  })

  test.skip('should increment version and sequence correctly', async ({ dbConnection }) => {
    const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)

    // Insert initial events
    await db.insert(eventsTable).values([
      {
        aggregateId: 'test-aggregate',
        version: 1,
        sequence: 1,
        timestamp: new Date(),
        eventData: { type: 'TestEvent', data: 'initial' },
      },
    ])

    // Save new events
    const events: TestEvent[] = [
      { type: 'TestEvent', data: 'new1' },
      { type: 'TestEvent', data: 'new2' },
    ]
    await eventStore.save('test-aggregate', events)

    // Verify versions and sequences
    const savedEvents = await db.query.eventsTable.findMany({
      where: (evts, { eq }) => eq(evts.aggregateId, 'test-aggregate'),
      orderBy: (evts, { asc }) => asc(evts.version),
    })

    expect(savedEvents).toEqual([
      expect.objectContaining({
        version: 1,
        sequence: 1,
      }),
      expect.objectContaining({
        version: 2,
        sequence: 2,
      }),
      expect.objectContaining({
        version: 3,
        sequence: 3,
      }),
    ])
  })

  // test('should handle multiple aggregates correctly', async ({ dbConnection }) => {
  //   const eventStore = new PostgresEventStore<TestEventSignature>(dbConnection)
  //
  //   // Save events for first aggregate
  //   const events1: TestEvent[] = [{ type: 'TestEvent', data: 'test1' }]
  //   await eventStore.save('test-aggregate', events1)
  //
  //   // Save events for second aggregate
  //   const events2: AnotherTestEvent[] = [{ type: 'AnotherTestEvent', value: 42 }]
  //   await eventStore.save('another-aggregate', events2)
  //
  //   // Verify events for first aggregate
  //   const savedEvents1 = await db.query.eventsTable.findMany({
  //     where: (evts, { eq }) => eq(evts.aggregateId, 'test-aggregate'),
  //   })
  //   expect(savedEvents1).toHaveLength(1)
  //   expect(savedEvents1[0].eventData).toEqual({ type: 'TestEvent', data: 'test1' })
  //
  //   // Verify events for second aggregate
  //   const savedEvents2 = await db.query.eventsTable.findMany({
  //     where: (evts, { eq }) => eq(evts.aggregateId, 'another-aggregate'),
  //   })
  //   expect(savedEvents2).toHaveLength(1)
  //   expect(savedEvents2[0].eventData).toEqual({ type: 'AnotherTestEvent', value: 42 })
  //
  //   // Verify sequences are global
  //   expect(savedEvents1[0].sequence).toBe(1)
  //   expect(savedEvents2[0].sequence).toBe(2)
  // })
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
    expect(subscriber).toHaveBeenCalledWith(events)

    // Remove subscriber
    eventStore.off('test-aggregate', subscriber)

    // Save more events
    const moreEvents: TestEvent[] = [{ type: 'TestEvent', data: 'test2' }]
    await eventStore.save('test-aggregate', moreEvents)

    // Verify subscriber was not called again
    expect(subscriber).toHaveBeenCalledTimes(1)
  })
})

