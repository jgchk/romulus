import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

import AuthenticationManager, {
  setTokenCookie,
} from '../../server/authentication'
import { withExceptionFilter } from '../../server/middleware'

const authenticationManager = new AuthenticationManager()

const RegisterRequest = z.object({
  username: z.string().trim().min(1, 'Username cannot be empty'),
  password: z.string().trim().min(1, 'Password cannot be empty'),
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
