import { hashApiKey } from './api-keys'
import { ApiKeysDatabase } from './db/controllers/api-keys'

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

  const keyHash = await hashApiKey(key)
  const apiKeysDb = new ApiKeysDatabase()
  const maybeExistingKey = await apiKeysDb.findByKeyHash(keyHash, locals.dbConnection)
  return maybeExistingKey !== undefined
}

function getKeyFromHeaders(request: Request) {
  const bearer = request.headers.get('authorization')
  if (!bearer) return null

  const match = /^Bearer (.+)$/.exec(bearer)
  if (!match) return null

  return match[1]
}
