import { type ResultAsync } from 'neverthrow'

export type IAuthenticationService = {
  whoami(token: string): ResultAsync<{ id: number }, Error>
}
