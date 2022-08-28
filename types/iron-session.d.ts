// eslint-disable-next-line @typescript-eslint/no-unused-vars
import IronSession from 'iron-session'

declare module 'iron-session' {
  interface IronSessionData {
    accountId?: number
  }
}
