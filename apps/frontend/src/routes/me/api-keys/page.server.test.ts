import { FetchError, type IAuthenticationClient } from '@romulus/authentication/client'
import { errAsync, okAsync } from 'neverthrow'
import { describe, expect, test, vi } from 'vitest'

import { actions, load } from './+page.server'

describe('load', () => {
  test('should throw error if not logged in', async () => {
    try {
      await load({
        locals: {
          user: undefined,
          di: {
            authentication: () => ({
              getApiKeys: () => okAsync([]),
            }),
          },
        },
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
    }
  })

  test('should throw error if account is not the one currently logged in', async () => {
    try {
      await load({
        locals: {
          user: { id: 2 },
          di: {
            authentication: () => ({
              getApiKeys: () => okAsync([]),
            }),
          },
        },
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 403, body: { message: 'Unauthorized' } })
    }
  })

  test('should throw error if we fail to fetch the API keys', async () => {
    try {
      await load({
        locals: {
          user: { id: 1 },
          di: {
            authentication: () => ({
              getApiKeys: () => errAsync(new FetchError(new Error('Random error'))),
            }),
          },
        },
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 500, body: { message: 'Invalid account ID' } })
    }
  })

  test("should return no account keys if there aren't any", async () => {
    const result = await load({
      locals: {
        user: { id: 1 },
        di: {
          authentication: () => ({
            getApiKeys: () => okAsync([]),
          }),
        },
      },
    })
    expect(result).toEqual({ keys: [] })
  })

  test('should return account keys', async () => {
    const result = await load({
      locals: {
        user: { id: 1 },
        di: {
          authentication: () => ({
            getApiKeys: () => okAsync([]),
          }),
        },
      },
    })

    expect(result).toEqual({
      keys: [{ id: 1, name: 'test-key-1', createdAt: expect.any(Date) as Date }],
    })
  })

  test('should return account keys in descending order of creation date', async () => {
    const result = await load({
      locals: {
        user: { id: 1 },
        di: {
          authentication: () => ({
            getApiKeys: () => okAsync([]),
          }),
        },
      },
    })

    expect(result).toEqual({
      keys: [
        expect.objectContaining({ name: 'test-key-2' }),
        expect.objectContaining({ name: 'test-key-1' }),
      ],
    })
  })
})

describe('create', () => {
  test('should throw error if not logged in', async () => {
    try {
      await actions.create({
        locals: {
          user: undefined,
          di: {
            authentication: () => ({
              createApiKey: () => okAsync({ id: 1, name: 'test-key', key: '000-000-000' }),
            }),
          },
        },
        request: new Request('http://localhost'),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
    }
  })

  test('should throw error if account is not the one currently logged in', async () => {
    try {
      await actions.create({
        locals: {
          user: { id: 2 },
          di: {
            authentication: () => ({
              createApiKey: () => okAsync({ id: 1, name: 'test-key', key: '000-000-000' }),
            }),
          },
        },
        request: new Request('http://localhost'),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 403, body: { message: 'Unauthorized' } })
    }
  })

  test('should throw error if account id is not a number', async () => {
    try {
      await actions.create({
        locals: {
          user: { id: 1 },
          di: {
            authentication: () => ({
              createApiKey: () => okAsync({ id: 1, name: 'test-key', key: '000-000-000' }),
            }),
          },
        },
        request: new Request('http://localhost'),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 400, body: { message: 'Invalid account ID' } })
    }
  })

  test('should throw error if account does not exist', async () => {
    try {
      await actions.create({
        locals: {
          user: { id: 1 },
          di: {
            authentication: () => ({
              createApiKey: () => okAsync({ id: 1, name: 'test-key', key: '000-000-000' }),
            }),
          },
        },
        request: new Request('http://localhost'),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 404, body: { message: 'Account not found' } })
    }
  })

  test('should create a new key', async () => {
    const createApiKey = vi
      .fn<IAuthenticationClient['createApiKey']>()
      .mockReturnValue(okAsync({ id: 1, name: 'New API Key', key: '000-000-000' }))

    const formData = new FormData()
    formData.set('name', 'New API Key')

    await actions.create({
      locals: {
        user: { id: 1 },
        di: {
          authentication: () => ({
            createApiKey,
          }),
        },
      },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
    })

    expect(createApiKey).toHaveBeenCalledWith('New API Key')
  })

  test('should return the created key which should be valid', async () => {
    const formData = new FormData()
    formData.set('name', 'New API Key')

    const res = await actions.create({
      locals: {
        user: { id: 1 },
        di: {
          authentication: () => ({
            createApiKey: () => okAsync({ id: 1, name: 'New API Key', key: '000-000-000' }),
          }),
        },
      },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
    })

    if (!('success' in res && res.success === true)) {
      expect.fail('create failed')
    }

    expect(res).toEqual({ success: true, id: 1, name: 'New API Key', key: '000-000-000' })
  })
})

describe('delete', () => {
  test('should throw error if not logged in', async () => {
    try {
      await actions.delete({
        locals: {
          user: undefined,
          di: {
            authentication: () => ({
              deleteApiKey: () => okAsync(undefined),
            }),
          },
        },
        request: new Request('http://localhost'),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
    }
  })

  test('should throw error if account is not the one currently logged in', async () => {
    try {
      await actions.delete({
        locals: {
          user: undefined,
          di: {
            authentication: () => ({
              deleteApiKey: () => okAsync(undefined),
            }),
          },
        },
        request: new Request('http://localhost'),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
    }
  })

  test('should throw error if account id is not a number', async () => {
    try {
      await actions.delete({
        locals: {
          user: { id: 1 },
          di: {
            authentication: () => ({
              deleteApiKey: () => okAsync(undefined),
            }),
          },
        },
        request: new Request('http://localhost'),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 400, body: { message: 'Invalid account ID' } })
    }
  })

  test('should not throw error if account does not exist', async () => {
    const apiKeyId = 1

    const formData = new FormData()
    formData.set('id', apiKeyId.toString())

    try {
      await actions.delete({
        locals: {
          user: { id: 1 },
          di: {
            authentication: () => ({
              deleteApiKey: () => okAsync(undefined),
            }),
          },
        },
        request: new Request('http://localhost', { method: 'POST', body: formData }),
      })
    } catch {
      expect.fail('should not throw error')
    }
  })

  test('should delete the requested key', async () => {
    const deleteApiKey = vi
      .fn<IAuthenticationClient['deleteApiKey']>()
      .mockReturnValue(okAsync(undefined))

    const formData = new FormData()
    formData.set('id', '1')

    await actions.delete({
      locals: {
        user: { id: 1 },
        di: {
          authentication: () => ({
            deleteApiKey,
          }),
        },
      },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
    })

    expect(deleteApiKey).toHaveBeenCalledWith(1)
  })
})
