import { createRouter } from '../createRouter'
import SessionManager from '../session'
import { getAccountById } from '../db/account'

export const authRouter = createRouter().query('whoami', {
  async resolve({ ctx: { token } }) {
    if (!token) {
      return null
    }

    const session = await new SessionManager().getSession(token)

    const account = await getAccountById(session.accountId)

    return account
  },
})
