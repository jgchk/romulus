import { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import Cookies from 'cookies'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

import { prisma } from './prisma'
import SessionManager from './session'

export const setTokenCookie = (
  req: NextApiRequest,
  res: NextApiResponse,
  token: string
) => {
  const cookies = new Cookies(req, res)
  cookies.set('token', token, { httpOnly: true, sameSite: true })
}

export const getTokenFromCookie = (req: NextApiRequest) => {
  if (!req.cookies.token) {
    return null
  }

  const token = req.cookies.token
  if (!token) {
    return null
  }

  return token
}

export default class AuthenticationManager {
  sessionManager: SessionManager

  constructor() {
    this.sessionManager = new SessionManager()
  }

  async login(username: string, password: string) {
    const account = await prisma.account.findUnique({
      where: { username },
      select: { id: true, password: true },
    })

    if (!account || !(await bcrypt.compare(password, account.password))) {
      throw new ApiError(401, 'Invalid email or password')
    }

    const { token } = await this.sessionManager.createSession(account.id)

    return token
  }

  async register(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 12)

    try {
      const account = await prisma.account.create({
        data: {
          username,
          password: hashedPassword,
        },
        select: { id: true },
      })

      const { token } = await this.sessionManager.createSession(account.id)

      return token
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ApiError(
          409,
          'Could not create account. Username already exists.'
        )
      }

      throw error
    }
  }
}
