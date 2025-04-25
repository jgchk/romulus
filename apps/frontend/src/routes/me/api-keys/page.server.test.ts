import { type AuthenticationClient } from '@romulus/authentication/client'
import { FetchError } from '@romulus/authentication/client'
import { isActionFailure } from '@sveltejs/kit'
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

  it('should error if there is a validation error while fetching API keys', async () => {
    try {
      await load({
        locals: {
          user: { id: 1 },
          di: {
            authentication: () => ({
              getApiKeys: () =>
                errAsync({
                  name: 'ValidationError',
                  message: 'Failed validation',
                  statusCode: 400,
                  details: {
                    target: 'json',
                    issues: [{ path: ['id'], message: 'Some error on id' }],
                  },
                }),
            }),
          },
        },
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({
        status: 400,
        body: { message: 'Failed validation' },
      })
    }
  })

  it('should error if there is an authorization error while fetching API keys', async () => {
    try {
      await load({
        locals: {
          user: { id: 1 },
          di: {
            authentication: () => ({
              getApiKeys: () =>
                errAsync({
                  name: 'UnauthorizedError',
                  message: 'You are not authorized',
                  statusCode: 401,
                }),
            }),
          },
        },
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({
        status: 401,
        body: { message: 'You are not authorized' },
      })
    }
  })

  it('should error if an unknown error occurs while fetching API keys', async () => {
    try {
      await load({
        locals: {
          user: { id: 1 },
          di: {
            authentication: () => ({
              getApiKeys: () =>
                // @ts-expect-error - Testing unknown error
                errAsync({
                  name: 'SomeRandomError',
                  message: 'A random error message',
                  statusCode: 410,
                }),
            }),
          },
        },
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({
        status: 500,
        body: { message: 'An unknown error occurred' },
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
    const formData = new FormData()
    formData.set('name', 'New API Key')

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
        request: new Request('http://localhost', { method: 'POST', body: formData }),
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

  it('should fail if the api key name is not included', async () => {
    const formData = new FormData()

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

    expect(isActionFailure(res)).toBe(true)
    expect(res).toEqual({
      status: 400,
      data: { action: 'create', errors: { name: ['Expected string, received null'] } },
    })
  })

  it('should fail if the api key name is empty', async () => {
    const formData = new FormData()
    formData.set('name', '')

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

    expect(isActionFailure(res)).toBe(true)
    expect(res).toEqual({
      status: 400,
      data: { action: 'create', errors: { name: ['Expected string, received null'] } },
    })
  })

  it('should error if the create api key request fails', async () => {
    const formData = new FormData()
    formData.set('name', 'New API Key')

    try {
      await actions.create({
        locals: {
          user: { id: 1 },
          di: {
            authentication: () => ({
              createApiKey: () => errAsync(new FetchError(new Error('Fetch error'))),
            }),
          },
        },
        request: new Request('http://localhost', { method: 'POST', body: formData }),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({
        status: 500,
        body: { message: 'An error occurred while fetching: Fetch error' },
      })
    }
  })

  it('should error if the create api key request fails with validation error', async () => {
    const formData = new FormData()
    formData.set('name', 'New API Key')

    try {
      await actions.create({
        locals: {
          user: { id: 1 },
          di: {
            authentication: () => ({
              createApiKey: () =>
                errAsync({
                  name: 'ValidationError',
                  message: 'Failed validation',
                  statusCode: 400,
                  details: {
                    target: 'json',
                    issues: [{ path: ['id'], message: 'Some error on id' }],
                  },
                }),
            }),
          },
        },
        request: new Request('http://localhost', { method: 'POST', body: formData }),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({
        status: 400,
        body: { message: 'Failed validation' },
      })
    }
  })

  it('should error if the create api key request fails with authorization error', async () => {
    const formData = new FormData()
    formData.set('name', 'New API Key')

    try {
      await actions.create({
        locals: {
          user: { id: 1 },
          di: {
            authentication: () => ({
              createApiKey: () =>
                errAsync({
                  name: 'UnauthorizedError',
                  message: 'You are not authorized',
                  statusCode: 401,
                }),
            }),
          },
        },
        request: new Request('http://localhost', { method: 'POST', body: formData }),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({
        status: 401,
        body: { message: 'You are not authorized' },
      })
    }
  })

  it('should error if the create api key request fails with unknown error', async () => {
    const formData = new FormData()
    formData.set('name', 'New API Key')

    try {
      await actions.create({
        locals: {
          user: { id: 1 },
          di: {
            authentication: () => ({
              createApiKey: () =>
                // @ts-expect-error - Testing unknown error
                errAsync({
                  name: 'SomeRandomError',
                  message: 'A random error message',
                  statusCode: 410,
                }),
            }),
          },
        },
        request: new Request('http://localhost', { method: 'POST', body: formData }),
      })
      expect.fail('should throw error')
    } catch (e) {
      expect(e).toEqual({
        status: 500,
        body: { message: 'An unknown error occurred' },
      })
    }
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
