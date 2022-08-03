import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import Cookies from 'cookies'
import AuthenticationManager from '../../server/authentication'
import { withExceptionFilter } from '../../server/middleware'

const authenticationManager = new AuthenticationManager()

const RegisterRequest = z.object({
  username: z.string(),
  password: z.string(),
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

    const cookies = new Cookies(req, res)
    cookies.set('Authorization', `Bearer ${token}`, {
      httpOnly: true,
      sameSite: true,
    })

    res.status(200).json({ status: 'success', token })
  }

  return withExceptionFilter(req, res)(handler)
}
