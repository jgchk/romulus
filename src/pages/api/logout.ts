import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { z } from 'zod'

import AuthenticationManager, {
  clearTokenCookie,
  getTokenFromCookie,
} from '../../server/authentication'
import { withExceptionFilter } from '../../server/middleware'

const authenticationManager = new AuthenticationManager()

const LogoutRequest = z
  .object({ everywhere: z.boolean().optional() })
  .optional()

type LogoutResponse = {
  status: 'success'
}

export default function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
) {
  const handler = async () => {
    let everywhere = false
    if (req.body) {
      const logoutRequest = LogoutRequest.parse(req.body)
      everywhere = logoutRequest?.everywhere ?? false
    }

    const token = getTokenFromCookie(req)
    if (token === null) {
      throw new ApiError(401, 'You are not logged in')
    }

    await authenticationManager.logout(token, everywhere)

    clearTokenCookie(req, res)

    res.status(200).json({ status: 'success' })
  }

  return withExceptionFilter(req, res)(handler)
}
