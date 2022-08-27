import * as trpcNext from '@trpc/server/adapters/next'
import { withIronSessionApiRoute } from 'iron-session/next'

import { createContext } from '../../../server/context'
import { appRouter } from '../../../server/routers/_app'
import { sessionConfig } from '../../../server/session'

const handler = trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  batching: {
    enabled: true,
  },
})

export default withIronSessionApiRoute(handler, sessionConfig)
