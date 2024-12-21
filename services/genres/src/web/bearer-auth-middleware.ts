import type { WhoamiQuery } from '@romulus/authentication/application'
import { createMiddleware } from 'hono/factory'

import { UnauthorizedError } from '../domain/errors/unauthorized'
import { setError } from './utils'

export const bearerAuth = (whoami: WhoamiQuery) =>
  createMiddleware<{
    Variables: {
      token: string
      user: { id: number }
    }
  }>(async (c, next) => {
    const header = c.req.header('Authorization')
    if (!header) {
      return setError(c, new UnauthorizedError(), 401)
    }

    const token = header.split(' ').at(1)
    if (!token) {
      return setError(c, new UnauthorizedError(), 401)
    }

    c.set('token', token)

    const userResponse = await whoami.execute(token)
    if (userResponse instanceof Error) {
      return setError(c, userResponse, 401)
    }

    c.set('user', { id: userResponse.account.id })

    await next()
  })
