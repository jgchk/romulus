import { FetchError } from '@romulus/authentication/client'
import { isHttpError, isRedirect } from '@sveltejs/kit'
import { errAsync, okAsync } from 'neverthrow'
import { describe, expect, it, vi } from 'vitest'

import { actions, load } from './+page.server'

describe('load', () => {
  it('should return the sign-up form', async () => {
    const res = await load({ locals: { user: undefined } })
    expect(res.form.data).toEqual({ username: '', password: { password: '', confirmPassword: '' } })
  })

  it('should redirect to / if the user is already signed in', async () => {
    try {
      await load({ locals: { user: {} } })
      expect.fail('Expected a redirect')
    } catch (err) {
      if (!isRedirect(err)) expect.fail('Expected a redirect')
      expect(err.status).toBe(302)
      expect(err.location).toBe('/')
    }
  })
})

describe('default action', () => {
  it('should redirect to /genres on successful sign up', async () => {
    const formData = new FormData()
    formData.set(
      '__superform_json',
      '[{"username":1,"password":2},"goob",{"password":3,"confirmPassword":3},"goobergoober"]',
    )

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            authentication: () => ({
              register: () => okAsync({ success: true, token: '000', expiresAt: new Date() }),
            }),
          },
        },
        cookies: { set: () => {} },
      })
      expect.fail('Expected a redirect')
    } catch (err) {
      if (!isRedirect(err)) expect.fail('Expected a redirect')
      expect(err.status).toBe(302)
      expect(err.location).toBe('/genres')
    }
  })

  it('should set the session cookie on successful sign up', async () => {
    const setCookie = vi.fn()
    const sessionExpiresAt = new Date()

    const formData = new FormData()
    formData.set(
      '__superform_json',
      '[{"username":1,"password":2},"goob",{"password":3,"confirmPassword":3},"goobergoober"]',
    )

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            authentication: () => ({
              register: () => okAsync({ success: true, token: '000', expiresAt: sessionExpiresAt }),
            }),
          },
        },
        cookies: { set: setCookie },
      })
    } catch {
      // Should redirect, do nothing
    }

    expect(setCookie).toHaveBeenCalledWith('auth_session', '000', {
      expires: sessionExpiresAt,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false,
    })
  })

  it('should fail if the form is invalid', async () => {
    const formData = new FormData()
    formData.set(
      '__superform_json',
      '[{"usernameeeee":1,"password":2},"goob",{"password":3,"confirmPassword":3},"goobergoober"]',
    )

    const res = await actions.default({
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          authentication: () => ({
            register: () => okAsync({ success: true, token: '000', expiresAt: new Date() }),
          }),
        },
      },
      cookies: { set: () => {} },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      username: ['Required'],
    })
  })

  it('should fail if the passwords do not match', async () => {
    const formData = new FormData()
    formData.set(
      '__superform_json',
      '[{"username":1,"password":2},"goob",{"password":3,"confirmPassword":4},"goobergoober","goobygooby"]',
    )

    const res = await actions.default({
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          authentication: () => ({
            register: () => okAsync({ success: true, token: '000', expiresAt: new Date() }),
          }),
        },
      },
      cookies: { set: () => {} },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      password: {
        confirmPassword: ['Passwords do not match'],
      },
    })
  })

  it('should error if the sign up request fails', async () => {
    const formData = new FormData()
    formData.set(
      '__superform_json',
      '[{"username":1,"password":2},"goob",{"password":3,"confirmPassword":3},"goobergoober"]',
    )

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            authentication: () => ({
              register: () => errAsync(new FetchError(new Error('Failed to fetch'))),
            }),
          },
        },
        cookies: { set: () => {} },
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

  it('should fail if the sign up request fails validation', async () => {
    const formData = new FormData()
    formData.set(
      '__superform_json',
      '[{"username":1,"password":2},"goob",{"password":3,"confirmPassword":3},"goobergoober"]',
    )

    const res = await actions.default({
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          authentication: () => ({
            register: () =>
              errAsync({
                name: 'ValidationError',
                message: 'Failed validation',
                statusCode: 400,
                details: {
                  target: 'json',
                  issues: [{ path: ['username'], message: 'Some error on username' }],
                },
              }),
          }),
        },
      },
      cookies: { set: () => {} },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      username: ['Some error on username'],
    })
  })

  it('should fail if the username is not unique', async () => {
    const formData = new FormData()
    formData.set(
      '__superform_json',
      '[{"username":1,"password":2},"goob",{"password":3,"confirmPassword":3},"goobergoober"]',
    )

    const res = await actions.default({
      request: new Request('http://localhost', { method: 'POST', body: formData }),
      locals: {
        di: {
          authentication: () => ({
            register: () =>
              errAsync({
                name: 'NonUniqueUsernameError',
                message: 'Username is already taken',
                statusCode: 409,
              }),
          }),
        },
      },
      cookies: { set: () => {} },
    })

    expect(res.status).toBe(400)
    expect(res.data.form.errors).toEqual({
      username: ['Username is already taken'],
    })
  })

  it('should error when the sign up call has an unknown error', async () => {
    const formData = new FormData()
    formData.set(
      '__superform_json',
      '[{"username":1,"password":2},"goob",{"password":3,"confirmPassword":3},"goobergoober"]',
    )

    try {
      await actions.default({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        locals: {
          di: {
            authentication: () => ({
              register: () =>
                // @ts-expect-error - Testing unknown error
                errAsync({
                  name: 'SomeRandomError',
                  message: 'A random error message',
                  statusCode: 410,
                }),
            }),
          },
        },
        cookies: { set: () => {} },
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
