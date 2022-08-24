import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

import AuthenticationManager, {
  setTokenCookie,
} from '../../server/authentication'
import { withExceptionFilter } from '../../server/middleware'
import { nonemptyString } from '../../utils/validators'

const authenticationManager = new AuthenticationManager()

const LoginRequest = z.object({
  username: nonemptyString('Username is required'),
  password: nonemptyString('Password is required'),
})

type LoginRequest = z.infer<typeof LoginRequest>

type LoginResponse = {
  status: 'success'
  token: string
}

export default function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  const handler = async () => {
    const loginRequest = LoginRequest.parse(req.body)

    const token = await authenticationManager.login(
      loginRequest.username,
      loginRequest.password
    )

    setTokenCookie(req, res, token)

    res.status(200).json({ status: 'success', token })
  }

  return withExceptionFilter(req, res)(handler)
}
