import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'

import { withExceptionFilter } from '../../server/middleware'
import { sessionConfig } from '../../server/session'

const logoutRoute = (req: NextApiRequest, res: NextApiResponse) => {
  req.session.destroy()
  res.send({ accountId: null })
}

export default withIronSessionApiRoute(
  withExceptionFilter(logoutRoute),
  sessionConfig
)
