export async function checkApiAuth(
  request: Request,
  locals: {
    user: App.Locals['user']
    dbConnection: App.Locals['dbConnection']
    di: Pick<App.Locals['di'], 'apiCommandService'>
  },
): Promise<boolean> {
  if (locals.user) {
    return true
  }

  const key = getKeyFromHeaders(request)
  if (key === null) {
    return false
  }

  return locals.di.apiCommandService().validateApiKey(key)
}

function getKeyFromHeaders(request: Request) {
  const bearer = request.headers.get('authorization')
  if (!bearer) return null

  const match = /^Bearer (.+)$/.exec(bearer)
  if (!match) return null

  return match[1]
}
