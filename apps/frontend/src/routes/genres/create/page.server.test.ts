import { FetchError } from '@romulus/genres/client'
import { isHttpError, isRedirect } from '@sveltejs/kit'
import { err, ok } from 'neverthrow'
import { describe, expect, it, vi } from 'vitest'

import { actions, load } from './+page.server'

describe('load', () => {
  it('should return an error message when not logged in', async () => {
    try {
      await load({ locals: { user: undefined } })
      expect.fail('Expected an error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(403)
      expect(err.body).toEqual({ message: 'You do not have permission to create genres' })
    }
  })

  it('should return an error message when logged in without create genre permission', async () => {
    try {
      await load({ locals: { user: { permissions: { genres: { canCreate: false } } } } })
      expect.fail('Expected an error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(403)
      expect(err.body).toEqual({ message: 'You do not have permission to create genres' })
    }
  })

  it('should default to Style type', async () => {
    const res = await load({ locals: { user: { permissions: { genres: { canCreate: true } } } } })
    expect(res.form.data.type).toBe('STYLE')
  })
})

describe('action', () => {
  it('should redirect after successful genre creation', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              createGenre: () => Promise.resolve(ok({ success: true, id: 0 })),
              voteGenreRelevance: () => Promise.resolve(ok({ success: true })),
            }),
          },
        },
      })
      expect.fail('Expected a redirect')
    } catch (err) {
      if (!isRedirect(err)) expect.fail('Expected a redirect')
      expect(err.status).toBe(302)
      expect(err.location).toBe('/genres/0')
    }
  })

  it('should fail when the submitted genre is invalid', async () => {
    const formData = new FormData()
    formData.set('name', '')

    const res = await actions.default({
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            createGenre: () => Promise.resolve(ok({ success: true, id: 0 })),
            voteGenreRelevance: () => Promise.resolve(ok({ success: true })),
          }),
        },
      },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      name: ['Name is required'],
    })
  })

  it('should error when genre creation request fails', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              createGenre: () => Promise.resolve(err(new FetchError(new Error('Failed to fetch')))),
              voteGenreRelevance: () => Promise.resolve(ok({ success: true })),
            }),
          },
        },
      })
      expect.fail('Expected an HTTP error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(500)
      expect(err.body).toEqual({
        message: 'An error occurred while fetching: Failed to fetch',
      })
    }
  })

  it('should fail when the genre creation request fails validation', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    const res = await actions.default({
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            createGenre: () =>
              Promise.resolve(
                err({
                  name: 'ValidationError',
                  message: 'Failed validation',
                  statusCode: 400,
                  details: {
                    target: 'json',
                    issues: [{ path: ['name'], message: 'Some error on name' }],
                  },
                }),
              ),
            voteGenreRelevance: () => Promise.resolve(ok({ success: true })),
          }),
        },
      },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      name: ['Some error on name'],
    })
  })

  it('should fail when there is a duplicate AKA', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')
    formData.set('primaryAkas', 'Example AKA, Example AKA')

    const res = await actions.default({
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            createGenre: () =>
              Promise.resolve(
                err({
                  name: 'DuplicateAkaError',
                  message: 'There is a duplicate AKA',
                  statusCode: 400,
                  details: {
                    aka: 'Example AKA',
                    level: 'primary',
                  },
                }),
              ),
            voteGenreRelevance: () => Promise.resolve(ok({ success: true })),
          }),
        },
      },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      primaryAkas: ['There is a duplicate AKA'],
    })
  })

  it('should fail when there is a derived child', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')
    formData.set('parents', '1')
    formData.set('derivedFrom', '1')

    const res = await actions.default({
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            createGenre: () =>
              Promise.resolve(
                err({
                  name: 'DerivedChildError',
                  message: 'There is a derived child',
                  statusCode: 400,
                }),
              ),
            voteGenreRelevance: () => Promise.resolve(ok({ success: true })),
          }),
        },
      },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      derivedFrom: {
        _errors: ['There is a derived child'],
      },
    })
  })

  it('should fail when there is self influence', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    const res = await actions.default({
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            createGenre: () =>
              Promise.resolve(
                err({
                  name: 'SelfInfluenceError',
                  message: 'The genre influences itself',
                  statusCode: 400,
                }),
              ),
            voteGenreRelevance: () => Promise.resolve(ok({ success: true })),
          }),
        },
      },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      influencedBy: {
        _errors: ['The genre influences itself'],
      },
    })
  })

  it('should error when the user is not properly authenticated', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              createGenre: () =>
                Promise.resolve(
                  err({
                    name: 'UnauthenticatedError',
                    message: 'You are not authenticated',
                    statusCode: 401,
                  }),
                ),
              voteGenreRelevance: () => Promise.resolve(ok({ success: true })),
            }),
          },
        },
      })
      expect.fail('Expected an HTTP error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(401)
      expect(err.body).toEqual({
        message: 'You are not authenticated',
      })
    }
  })

  it('should error when the user is not properly authorized', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              createGenre: () =>
                Promise.resolve(
                  err({
                    name: 'UnauthorizedError',
                    message: 'You are not authorized',
                    statusCode: 403,
                  }),
                ),
              voteGenreRelevance: () => Promise.resolve(ok({ success: true })),
            }),
          },
        },
      })
      expect.fail('Expected an HTTP error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(403)
      expect(err.body).toEqual({
        message: 'You are not authorized',
      })
    }
  })

  it('should error when an unknown error occurs', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              createGenre: () =>
                // @ts-expect-error - Testing unknown error
                Promise.resolve(
                  err({
                    name: 'SomeRandomError',
                    message: 'A random error message',
                    statusCode: 410,
                  }),
                ),
              voteGenreRelevance: () => Promise.resolve(ok({ success: true })),
            }),
          },
        },
      })
      expect.fail('Expected an HTTP error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(500)
      expect(err.body).toEqual({
        message: 'An unknown error occurred',
      })
    }
  })

  it('should submit a genre relevance vote if relevance is included', async () => {
    const voteGenreRelevance = vi.fn().mockResolvedValue(ok({ success: true }))

    const formData = new FormData()
    formData.set('name', 'Example Genre')
    formData.set('relevance', '1')

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              createGenre: () => Promise.resolve(ok({ success: true, id: 0 })),
              voteGenreRelevance,
            }),
          },
        },
      })
      expect.fail('Expected a redirect')
    } catch {
      expect(voteGenreRelevance).toHaveBeenCalled()
    }
  })

  it('should error when relevance vote request fails', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')
    formData.set('relevance', '1')

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              createGenre: () => Promise.resolve(ok({ success: true, id: 0 })),
              voteGenreRelevance: () =>
                Promise.resolve(err(new FetchError(new Error('Failed to fetch')))),
            }),
          },
        },
      })
      expect.fail('Expected an HTTP error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(500)
      expect(err.body).toEqual({
        message: 'An error occurred while fetching: Failed to fetch',
      })
    }
  })

  it('should fail when the relevance vote request fails validation', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')
    formData.set('relevance', '1')

    const res = await actions.default({
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            createGenre: () => Promise.resolve(ok({ success: true, id: 0 })),
            voteGenreRelevance: () =>
              Promise.resolve(
                err({
                  name: 'ValidationError',
                  message: 'Failed validation',
                  statusCode: 400,
                  details: {
                    target: 'json',
                    issues: [{ path: ['relevance'], message: 'Some error on relevance' }],
                  },
                }),
              ),
          }),
        },
      },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      relevance: ['Some error on relevance'],
    })
  })

  it('should error when the user is not properly authenticated for relevance voting', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')
    formData.set('relevance', '1')

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              createGenre: () => Promise.resolve(ok({ success: true, id: 0 })),
              voteGenreRelevance: () =>
                Promise.resolve(
                  err({
                    name: 'UnauthenticatedError',
                    message: 'You are not authenticated',
                    statusCode: 401,
                  }),
                ),
            }),
          },
        },
      })
      expect.fail('Expected an HTTP error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(401)
      expect(err.body).toEqual({
        message: 'You are not authenticated',
      })
    }
  })

  it('should error when the user is not properly authorized for relevance voting', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')
    formData.set('relevance', '1')

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              createGenre: () => Promise.resolve(ok({ success: true, id: 0 })),
              voteGenreRelevance: () =>
                Promise.resolve(
                  err({
                    name: 'UnauthorizedError',
                    message: 'You are not authorized',
                    statusCode: 403,
                  }),
                ),
            }),
          },
        },
      })
      expect.fail('Expected an HTTP error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(403)
      expect(err.body).toEqual({
        message: 'You are not authorized',
      })
    }
  })

  it('should error when the genre relevance is invalid', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')
    formData.set('relevance', '1')

    const res = await actions.default({
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            createGenre: () => Promise.resolve(ok({ success: true, id: 0 })),
            voteGenreRelevance: () =>
              Promise.resolve(
                err({
                  name: 'InvalidGenreRelevanceError',
                  message: 'The relevance is invalid',
                  statusCode: 400,
                }),
              ),
          }),
        },
      },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      relevance: ['The relevance is invalid'],
    })
  })

  it('should error when an unknown error occurs when voting relevance', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')
    formData.set('relevance', '1')

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              createGenre: () => Promise.resolve(ok({ success: true, id: 0 })),
              voteGenreRelevance: () =>
                // @ts-expect-error - Testing unknown error
                Promise.resolve(
                  err({
                    name: 'SomeRandomError',
                    message: 'A random error message',
                    statusCode: 410,
                  }),
                ),
            }),
          },
        },
      })
      expect.fail('Expected an HTTP error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(500)
      expect(err.body).toEqual({
        message: 'An unknown error occurred',
      })
    }
  })
})
