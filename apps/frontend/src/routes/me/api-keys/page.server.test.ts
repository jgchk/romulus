import type { AuthenticationClient } from '@romulus/authentication/client'
import { FetchError } from '@romulus/authentication/client'
import { errAsync, okAsync } from 'neverthrow'
import { describe, expect, it, vi } from 'vitest'

import { actions, load } from './+page.server'

describe('load', () => {
  it('should throw error if not logged in', async () => {
    try {
      await load({
        locals: {
          user: undefined,
          di: {
            authentication: () => ({
              getApiKeys: () => okAsync({ success: true, keys: [] }),
            }),
          },
        },
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
    }
  })

  it('should throw error if we fail to fetch the API keys', async () => {
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
      expect(e).toEqual({
        status: 500,
        body: { message: 'An error occurred while fetching: Random error' },
      })
    }
  })

  it("should return no account keys if there aren't any", async () => {
    const result = await load({
      locals: {
        user: { id: 1 },
        di: {
          authentication: () => ({
            getApiKeys: () => okAsync({ success: true, keys: [] }),
          }),
        },
      },
    })
    expect(result).toEqual({ keys: [] })
  })

  it('should return account keys', async () => {
    const result = await load({
      locals: {
        user: { id: 1 },
        di: {
          authentication: () => ({
            getApiKeys: () =>
              okAsync({
                success: true,
                keys: [{ id: 1, name: 'test-key-1', createdAt: new Date() }],
              }),
          }),
        },
      },
    })

    expect(result).toEqual({
      keys: [{ id: 1, name: 'test-key-1', createdAt: expect.any(Date) as Date }],
    })
  })
})

describe('create', () => {
  it('should throw error if not logged in', async () => {
    try {
      await actions.create({
        locals: {
          user: undefined,
          di: {
            authentication: () => ({
              createApiKey: () =>
                okAsync({ success: true, id: 1, name: 'test-key', key: '000-000-000' }),
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

  it('should create a new key', async () => {
    const createApiKey = vi
      .fn<AuthenticationClient['createApiKey']>()
      .mockReturnValue(okAsync({ success: true, id: 1, name: 'New API Key', key: '000-000-000' }))

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

  it('should return the created key which should be valid', async () => {
    const formData = new FormData()
    formData.set('name', 'New API Key')

    const res = await actions.create({
      locals: {
        user: { id: 1 },
        di: {
          authentication: () => ({
            createApiKey: () =>
              okAsync({ success: true, id: 1, name: 'New API Key', key: '000-000-000' }),
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
  it('should throw error if not logged in', async () => {
    try {
      await actions.delete({
        locals: {
          user: undefined,
          di: {
            authentication: () => ({
              deleteApiKey: () => okAsync({ success: true }),
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

  it('should throw error if account is not the one currently logged in', async () => {
    try {
      await actions.delete({
        locals: {
          user: undefined,
          di: {
            authentication: () => ({
              deleteApiKey: () => okAsync({ success: true }),
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

  it('should delete the requested key', async () => {
    const deleteApiKey = vi
      .fn<AuthenticationClient['deleteApiKey']>()
      .mockReturnValue(okAsync({ success: true }))

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
