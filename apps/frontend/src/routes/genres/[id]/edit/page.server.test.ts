import { FetchError } from '@romulus/genres/client'
import { isHttpError, isRedirect } from '@sveltejs/kit'
import { err, ok } from 'neverthrow'
import { describe, expect, it } from 'vitest'

import { actions, load } from './+page.server'

describe('load', () => {
  it('should return an error message when not logged in', async () => {
    try {
      await load({
        params: { id: '0' },
        locals: {
          user: undefined,
          di: {
            genres: () => ({
              getGenre: () =>
                Promise.resolve(
                  ok({
                    success: true,
                    genre: {
                      id: 0,
                      name: 'Test Genre',
                      subtitle: null,
                      type: 'STYLE',
                      akas: { primary: [], secondary: [], tertiary: [] },
                      nsfw: false,
                      parents: [],
                      children: [],
                      derivedFrom: [],
                      derivations: [],
                      influences: [],
                      influencedBy: [],
                      shortDescription: null,
                      longDescription: null,
                      notes: null,
                      relevance: 1,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      contributors: [],
                    },
                  }),
                ),
            }),
          },
        },
      })
      expect.fail('Expected an error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(403)
      expect(err.body).toEqual({ message: 'You do not have permission to edit genres' })
    }
  })

  it('should return an error message when logged in without edit genre permission', async () => {
    try {
      await load({
        params: { id: '0' },
        locals: {
          user: { permissions: { genres: { canEdit: false } } },
          di: {
            genres: () => ({
              getGenre: () =>
                Promise.resolve(
                  ok({
                    success: true,
                    genre: {
                      id: 0,
                      name: 'Test Genre',
                      subtitle: null,
                      type: 'STYLE',
                      akas: { primary: [], secondary: [], tertiary: [] },
                      nsfw: false,
                      parents: [],
                      children: [],
                      derivedFrom: [],
                      derivations: [],
                      influences: [],
                      influencedBy: [],
                      shortDescription: null,
                      longDescription: null,
                      notes: null,
                      relevance: 1,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      contributors: [],
                    },
                  }),
                ),
            }),
          },
        },
      })
      expect.fail('Expected an error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(403)
      expect(err.body).toEqual({ message: 'You do not have permission to edit genres' })
    }
  })

  it('should prefill the form with the genre data', async () => {
    const res = await load({
      params: { id: '0' },
      locals: {
        user: { permissions: { genres: { canEdit: true } } },
        di: {
          genres: () => ({
            getGenre: () =>
              Promise.resolve(
                ok({
                  success: true,
                  genre: {
                    id: 0,
                    name: 'Test Genre',
                    subtitle: null,
                    type: 'STYLE',
                    akas: {
                      primary: ['primary-aka-one', 'primary-aka-two'],
                      secondary: [],
                      tertiary: [],
                    },
                    nsfw: false,
                    parents: [],
                    children: [],
                    derivedFrom: [],
                    derivations: [],
                    influences: [],
                    influencedBy: [],
                    shortDescription: null,
                    longDescription: null,
                    notes: null,
                    relevance: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    contributors: [],
                  },
                }),
              ),
          }),
        },
      },
    })
    expect(res.form.data).toEqual({
      name: 'Test Genre',
      subtitle: null,
      type: 'STYLE',
      primaryAkas: 'primary-aka-one, primary-aka-two',
      secondaryAkas: null,
      tertiaryAkas: null,
      nsfw: false,
      parents: [],
      derivedFrom: [],
      influencedBy: [],
      shortDescription: null,
      longDescription: null,
      notes: null,
      relevance: 1,
    })
  })

  it('should error when the genre ID is invalid', async () => {
    try {
      await load({
        params: { id: 'blah' },
        locals: {
          user: { permissions: { genres: { canEdit: true } } },
          di: {
            genres: () => ({
              getGenre: () =>
                Promise.resolve(
                  ok({
                    success: true,
                    genre: {
                      id: 0,
                      name: 'Test Genre',
                      subtitle: null,
                      type: 'STYLE',
                      akas: { primary: [], secondary: [], tertiary: [] },
                      nsfw: false,
                      parents: [],
                      children: [],
                      derivedFrom: [],
                      derivations: [],
                      influences: [],
                      influencedBy: [],
                      shortDescription: null,
                      longDescription: null,
                      notes: null,
                      relevance: 1,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      contributors: [],
                    },
                  }),
                ),
            }),
          },
        },
      })
      expect.fail('Expected an error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(400)
      expect(err.body).toEqual({ message: 'Invalid genre ID' })
    }
  })

  it('should error when the genre fetch request fails', async () => {
    try {
      await load({
        params: { id: '0' },
        locals: {
          user: { permissions: { genres: { canEdit: true } } },
          di: {
            genres: () => ({
              getGenre: () => Promise.resolve(err(new FetchError(new Error('Failed to fetch')))),
            }),
          },
        },
      })
      expect.fail('Expected an error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(500)
      expect(err.body).toEqual({ message: 'An error occurred while fetching: Failed to fetch' })
    }
  })

  it('should error when the get genre request fails validation', async () => {
    try {
      await load({
        params: { id: '0' },
        locals: {
          user: { permissions: { genres: { canEdit: true } } },
          di: {
            genres: () => ({
              getGenre: () =>
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
            }),
          },
        },
      })
      expect.fail('Expected an error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(400)
      expect(err.body).toEqual({ message: 'Failed validation' })
    }
  })

  it('should error when the genre is not found', async () => {
    try {
      await load({
        params: { id: '0' },
        locals: {
          user: { permissions: { genres: { canEdit: true } } },
          di: {
            genres: () => ({
              getGenre: () =>
                Promise.resolve(
                  err({
                    name: 'GenreNotFoundError',
                    message: 'Genre not found',
                    statusCode: 404,
                  }),
                ),
            }),
          },
        },
      })
      expect.fail('Expected an error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(404)
      expect(err.body).toEqual({ message: 'Genre not found' })
    }
  })
})

describe('action', () => {
  it('should redirect after successful genre edit', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    try {
      await actions.default({
        params: { id: '0' },
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              updateGenre: () => Promise.resolve(ok({ success: true })),
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

  it('should error when the genre ID is invalid', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    try {
      await actions.default({
        params: { id: 'blah' },
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              updateGenre: () => Promise.resolve(ok({ success: true })),
            }),
          },
        },
      })
      expect.fail('Expected an HTTP error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(400)
      expect(err.body).toEqual({
        message: 'Invalid genre ID',
      })
    }
  })

  it('should fail when the submitted genre is invalid', async () => {
    const formData = new FormData()
    formData.set('name', '')

    const res = await actions.default({
      params: { id: '0' },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            updateGenre: () => Promise.resolve(ok({ success: true })),
          }),
        },
      },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      name: ['Name is required'],
    })
  })

  it('should error when genre update request fails', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    try {
      await actions.default({
        params: { id: '0' },
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              updateGenre: () => Promise.resolve(err(new FetchError(new Error('Failed to fetch')))),
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

  it('should fail when the genre update request fails validation', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    const res = await actions.default({
      params: { id: '0' },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            updateGenre: () =>
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
          }),
        },
      },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      name: ['Some error on name'],
    })
  })

  it('should error when the genre is not found', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    try {
      await actions.default({
        params: { id: '0' },
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              updateGenre: () =>
                Promise.resolve(
                  err({
                    name: 'GenreNotFoundError',
                    message: 'Genre not found',
                    statusCode: 404,
                  }),
                ),
            }),
          },
        },
      })
      expect.fail('Expected an HTTP error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(404)
      expect(err.body).toEqual({
        message: 'Genre not found',
      })
    }
  })

  it('should fail when there is a duplicate AKA', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')
    formData.set('primaryAkas', 'Example AKA, Example AKA')

    const res = await actions.default({
      params: { id: '0' },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            updateGenre: () =>
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
      params: { id: '0' },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            updateGenre: () =>
              Promise.resolve(
                err({
                  name: 'DerivedChildError',
                  message: 'There is a derived child',
                  statusCode: 400,
                }),
              ),
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
      params: { id: '0' },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            updateGenre: () =>
              Promise.resolve(
                err({
                  name: 'SelfInfluenceError',
                  message: 'The genre influences itself',
                  statusCode: 400,
                }),
              ),
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

  it('should fail when there is a cycle in the genre tree', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    const res = await actions.default({
      params: { id: '0' },
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          genres: () => ({
            updateGenre: () =>
              Promise.resolve(
                err({
                  name: 'GenreCycleError',
                  message: 'There is a cycle in the genre tree',
                  statusCode: 400,
                }),
              ),
          }),
        },
      },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      parents: {
        _errors: ['There is a cycle in the genre tree'],
      },
    })
  })

  it('should error when the user is not properly authenticated', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    try {
      await actions.default({
        params: { id: '0' },
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              updateGenre: () =>
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

  it('should error when the user is not properly authorized', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    try {
      await actions.default({
        params: { id: '0' },
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              updateGenre: () =>
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

  it('should error when an unknown error occurs', async () => {
    const formData = new FormData()
    formData.set('name', 'Example Genre')

    try {
      await actions.default({
        params: { id: '0' },
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            genres: () => ({
              updateGenre: () =>
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
