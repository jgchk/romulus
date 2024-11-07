import { ApiCommandService } from './features/api/commands/command-service'
import { DrizzleApiKeyRepository } from './features/api/commands/infrastructure/repositories/api-key/drizzle-api-key'
import { Sha256HashRepository } from './features/common/infrastructure/repositories/hash/sha256-hash-repository'

export async function checkApiAuth(
  request: Request,
  locals: Pick<App.Locals, 'user' | 'dbConnection'>,
): Promise<boolean> {
  if (locals.user) {
    return true
  }

  const key = getKeyFromHeaders(request)
  if (key === null) {
    return false
  }

  const apiService = new ApiCommandService(
    new DrizzleApiKeyRepository(locals.dbConnection),
    new Sha256HashRepository(),
  )
  return apiService.validateApiKey(key)
}

function getKeyFromHeaders(request: Request) {
  const bearer = request.headers.get('authorization')
  if (!bearer) return null

  const match = /^Bearer (.+)$/.exec(bearer)
  if (!match) return null

  return match[1]
}
