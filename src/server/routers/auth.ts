import { createRouter } from '../createRouter'

export const authRouter = createRouter().query('whoami', {
  resolve: ({ ctx: { account } }) => (account ? { id: account.id } : null),
})
