import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

import AuthenticationManager, {
  setTokenCookie,
} from '../../server/authentication'
import { withExceptionFilter } from '../../server/middleware'
import { nonemptyString } from '../../utils/validators'

const authenticationManager = new AuthenticationManager()

const RegisterRequest = z.object({
  username: nonemptyString('Username is required'),
  password: nonemptyString('Password is required'),
})

type RegisterRequest = z.infer<typeof RegisterRequest>

type RegisterResponse = {
  status: 'success'
  token: string
}

export default function registerHandler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  const handler = async () => {
    const registerRequest = RegisterRequest.parse(req.body)

    const token = await authenticationManager.register(
      registerRequest.username,
      registerRequest.password
    )

    setTokenCookie(req, res, token)

    res.status(200).json({ status: 'success', token })
  }

  return withExceptionFilter(req, res)(handler)
}
