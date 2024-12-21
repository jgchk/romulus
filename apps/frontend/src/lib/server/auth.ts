import type { FetchError, IAuthenticationClient } from '@romulus/authentication/client'
import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

export async function checkApiAuth(
  request: Request,
  locals: {
    user: App.Locals['user']
    dbConnection: App.Locals['dbConnection']
    di: {
      authentication: () => {
        validateApiKey: IAuthenticationClient['validateApiKey']
      }
    }
  },
): Promise<Result<boolean, FetchError>> {
  if (locals.user) {
    return ok(true)
  }

  const key = getKeyFromHeaders(request)
  if (key === null) {
    return ok(false)
  }

  const result = await locals.di.authentication().validateApiKey(key)
  if (result.isErr()) {
    return err(result.error)
  }

  return ok(result.value)
}

function getKeyFromHeaders(request: Request) {
  const bearer = request.headers.get('authorization')
  if (!bearer) return null

  const match = /^Bearer (.+)$/.exec(bearer)
  if (!match) return null

  return match[1]
}
