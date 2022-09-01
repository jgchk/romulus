import { Prisma } from '@prisma/client'
import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { z } from 'zod'

import { createAccount } from '../../server/db/account'
import { withExceptionFilter } from '../../server/middleware'
import { sessionConfig } from '../../server/session'
import { nonemptyString } from '../../utils/validators'

const RegisterRequest = z.object({
  username: nonemptyString('Username is required'),
  password: nonemptyString('Password is required'),
})

type RegisterRequest = z.infer<typeof RegisterRequest>

const registerRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  const registerRequest = RegisterRequest.parse(req.body)

  try {
    const account = await createAccount(registerRequest)

    req.session.accountId = account.id

    await req.session.save()

    res.send({ accountId: account.id })
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

export default withIronSessionApiRoute(
  withExceptionFilter(registerRoute),
  sessionConfig
)
