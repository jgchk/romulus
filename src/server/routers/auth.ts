import { publicProcedure, router } from '../trpc'

export const authRouter = router({
  whoami: publicProcedure.query(({ ctx: { account } }) => account ?? null),
})
