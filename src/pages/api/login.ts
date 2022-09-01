import bcrypt from 'bcrypt'
import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { z } from 'zod'

import { withExceptionFilter } from '../../server/middleware'
import { prisma } from '../../server/prisma'
import { sessionConfig } from '../../server/session'
import { nonemptyString } from '../../utils/validators'

const LoginRequest = z.object({
  username: nonemptyString('Username is required'),
  password: nonemptyString('Password is required'),
})

type LoginRequest = z.infer<typeof LoginRequest>

const loginRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  const loginRequest = LoginRequest.parse(req.body)

  const account = await prisma.account.findUnique({
    where: { username: loginRequest.username },
    select: { id: true, password: true },
  })

  if (
    !account ||
    !(await bcrypt.compare(loginRequest.password, account.password))
  ) {
    throw new ApiError(401, 'Invalid email or password')
  }

  req.session.accountId = account.id

  await req.session.save()

  res.send({ accountId: account.id })
}

export default withIronSessionApiRoute(
  withExceptionFilter(loginRoute),
  sessionConfig
)
