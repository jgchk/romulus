import { IronSessionOptions } from 'iron-session'

import { env } from './env'

export const sessionConfig: IronSessionOptions = {
  cookieName: 'romulus-auth',
  password: env.AUTH_PASSWORD,
  cookieOptions: { secure: env.NODE_ENV === 'production' },
}
