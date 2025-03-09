import type { AuthorizationApplication } from '@romulus/authorization/application'
import { err, ok } from 'neverthrow'

import { type AuthenticationApplication } from './application.js'

export async function setupAdminAccountForDevelopment({
  authentication,
  authorization,
}: {
  authentication: AuthenticationApplication
  authorization: AuthorizationApplication
}) {
  const admin = await ensureAdminAccountExists(authentication)
  if (admin.isErr()) {
    console.error('Error ensuring admin account exists', admin.error)
    return
  }

  const result = await assignAllRolesToAccount(authorization, admin.value.id)
  if (result.isErr()) {
    console.error('Error assigning roles to admin account', result.error)
  }
}

async function ensureAdminAccountExists(authentication: AuthenticationApplication) {
  const registerResult = await authentication.registerCommand().execute('admin', 'admin')
  if (!(registerResult instanceof Error)) return ok({ id: registerResult.newUserAccount.id })

  const loginResult = await authentication.loginCommand().execute('admin', 'admin')
  if (!(loginResult instanceof Error)) return ok({ id: loginResult.userAccount.id })

  return err(registerResult)
}

async function assignAllRolesToAccount(authorization: AuthorizationApplication, userId: number) {
  const roles = ['default', 'genre-editor', 'admin']
  for (const role of roles) {
    const result = await authorization.assignRoleToUser(
      userId,
      role,
      authorization.getSystemUserId(),
    )
    if (result.isErr()) return result
  }
  return ok(undefined)
}
