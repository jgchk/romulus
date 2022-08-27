import { withIronSessionApiRoute } from 'iron-session/next'

import { sessionConfig } from '../../server/session'

export default withIronSessionApiRoute((req, res) => {
  req.session.destroy()
  res.send({ account: null })
}, sessionConfig)
