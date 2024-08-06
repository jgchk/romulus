import { describe, expect } from 'vitest'

import { checkApiKey } from '$lib/server/api-keys'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { ApiKeysDatabase } from '$lib/server/db/controllers/api-keys'

import { test } from '../../../../vitest-setup'
import { actions, load } from './+page.server'

describe('load', () => {
  test('should throw error if not logged in', async ({ dbConnection }) => {
    try {
      await load({ params: { id: '1' }, locals: { dbConnection, user: undefined } })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
    }
  })

  test('should throw error if account is not the one currently logged in', async ({
    dbConnection,
  }) => {
    try {
      await load({ params: { id: '1' }, locals: { dbConnection, user: { id: 2 } } })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
    }
  })

  test('should throw error if account id is not a number', async ({ dbConnection }) => {
    try {
      await load({ params: { id: 'test' }, locals: { dbConnection, user: { id: 1 } } })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 400, body: { message: 'Invalid account ID' } })
    }
  })

  test('should throw error if account does not exist', async ({ dbConnection }) => {
    try {
      await load({ params: { id: '1' }, locals: { dbConnection, user: { id: 1 } } })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 404, body: { message: 'Account not found' } })
    }
  })

  test("should return no account keys if there aren't any", async ({ dbConnection }) => {
    const accountsDb = new AccountsDatabase()
    await accountsDb.insert(
      [{ id: 1, username: 'test-user', password: 'test-password' }],
      dbConnection,
    )

    const result = await load({ params: { id: '1' }, locals: { dbConnection, user: { id: 1 } } })
    expect(result).toEqual({ keys: [] })
  })

  test('should return account keys', async ({ dbConnection }) => {
    const accountsDb = new AccountsDatabase()
    await accountsDb.insert(
      [
        { id: 1, username: 'test-user-1', password: 'test-password-1' },
        { id: 2, username: 'test-user-2', password: 'test-password-2' },
      ],
      dbConnection,
    )

    const apiKeysDb = new ApiKeysDatabase()
    await apiKeysDb.insert(
      [
        { accountId: 1, name: 'test-key-1', keyHash: 'test-key-1-hash' },
        { accountId: 2, name: 'test-key-2', keyHash: 'test-key-2-hash' },
      ],
      dbConnection,
    )

    const result = await load({ params: { id: '1' }, locals: { dbConnection, user: { id: 1 } } })

    expect(result).toEqual({
      keys: [{ id: 1, name: 'test-key-1', createdAt: expect.any(Date) as Date }],
    })
  })
})

describe('create', () => {
  test('should throw error if not logged in', async ({ dbConnection }) => {
    try {
      await actions.create({
        params: { id: '1' },
        locals: { dbConnection, user: undefined },
        request: new Request('http://localhost'),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
    }
  })

  test('should throw error if account is not the one currently logged in', async ({
    dbConnection,
  }) => {
    try {
      await actions.create({
        params: { id: '1' },
        locals: { dbConnection, user: { id: 2 } },
        request: new Request('http://localhost'),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
    }
  })

  test('should throw error if account id is not a number', async ({ dbConnection }) => {
    try {
      await actions.create({
        params: { id: 'test' },
        locals: { dbConnection, user: { id: 1 } },
        request: new Request('http://localhost'),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 400, body: { message: 'Invalid account ID' } })
    }
  })

  test('should throw error if account does not exist', async ({ dbConnection }) => {
    try {
      await actions.create({
        params: { id: '1' },
        locals: { dbConnection, user: { id: 1 } },
        request: new Request('http://localhost'),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 404, body: { message: 'Account not found' } })
    }
  })

  test('should create a new key', async ({ dbConnection }) => {
    const accountsDb = new AccountsDatabase()
    await accountsDb.insert(
      [{ id: 1, username: 'test-user', password: 'test-password' }],
      dbConnection,
    )

    const formData = new FormData()
    formData.set('name', 'New API Key')

    await actions.create({
      params: { id: '1' },
      locals: { dbConnection, user: { id: 1 } },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
    })

    const apiKeysDb = new ApiKeysDatabase()
    const keys = await apiKeysDb.findByAccountId(1, dbConnection)
    expect(keys).toEqual([
      {
        id: expect.any(Number) as number,
        accountId: 1,
        name: 'New API Key',
        keyHash: expect.any(String) as string,
        createdAt: expect.any(Date) as Date,
      },
    ])
  })

  test('should return the created key which should resolve to the stored hash', async ({
    dbConnection,
  }) => {
    const accountsDb = new AccountsDatabase()
    await accountsDb.insert(
      [{ id: 1, username: 'test-user', password: 'test-password' }],
      dbConnection,
    )

    const formData = new FormData()
    formData.set('name', 'New API Key')

    const res = await actions.create({
      params: { id: '1' },
      locals: { dbConnection, user: { id: 1 } },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
    })

    const apiKeysDb = new ApiKeysDatabase()
    const [{ keyHash }] = await apiKeysDb.findByAccountId(1, dbConnection)

    if (!('success' in res && res.success === true)) {
      expect.fail('create failed')
    }
    expect(res.name).toEqual('New API Key')
    expect(await checkApiKey(res.key, keyHash)).toBe(true)
  })

  test('should throw an error when key name is not included', async ({ dbConnection }) => {
    const accountsDb = new AccountsDatabase()
    await accountsDb.insert(
      [{ id: 1, username: 'test-user', password: 'test-password' }],
      dbConnection,
    )

    const formData = new FormData()

    const res = await actions.create({
      params: { id: '1' },
      locals: { dbConnection, user: { id: 1 } },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
    })
    expect(res).toEqual({
      status: 400,
      data: { errors: { name: ['Expected string, received null'] } },
    })
  })

  test('should throw an error when key name is empty', async ({ dbConnection }) => {
    const accountsDb = new AccountsDatabase()
    await accountsDb.insert(
      [{ id: 1, username: 'test-user', password: 'test-password' }],
      dbConnection,
    )

    const formData = new FormData()
    formData.set('name', '')

    const res = await actions.create({
      params: { id: '1' },
      locals: { dbConnection, user: { id: 1 } },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
    })
    expect(res).toEqual({ status: 400, data: { errors: { name: ['Name is required'] } } })
  })
})

describe('delete', () => {
  test('should throw error if not logged in', async ({ dbConnection }) => {
    try {
      await actions.delete({
        params: { id: '1' },
        locals: { dbConnection, user: undefined },
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
    }
  })

  test('should throw error if account is not the one currently logged in', async ({
    dbConnection,
  }) => {
    try {
      await actions.delete({
        params: { id: '1' },
        locals: { dbConnection, user: { id: 2 } },
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
    }
  })

  test('should throw error if account id is not a number', async ({ dbConnection }) => {
    try {
      await actions.delete({
        params: { id: 'test' },
        locals: { dbConnection, user: { id: 1 } },
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 400, body: { message: 'Invalid account ID' } })
    }
  })

  test('should throw error if account does not exist', async ({ dbConnection }) => {
    try {
      await actions.delete({
        params: { id: '1' },
        locals: { dbConnection, user: { id: 1 } },
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 404, body: { message: 'Account not found' } })
    }
  })
})
