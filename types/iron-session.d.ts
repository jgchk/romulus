import { DefaultAccount } from '../src/server/db/account/outputs'

declare module 'iron-session' {
  interface IronSessionData {
    account?: DefaultAccount
  }
}
