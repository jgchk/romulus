import { createRouter } from '../createRouter'

export const authRouter = createRouter().query('whoami', {
  resolve: async ({ ctx: { account } }) => account ?? null,
})
