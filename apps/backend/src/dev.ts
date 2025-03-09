import { err, ok } from 'neverthrow'

import { createAuthenticationApplication, createAuthorizationApplication } from './application.js'
import type { Infrastructure } from './infrastructure.js'

export async function setupAdminAccountForDevelopment(infrastructure: Infrastructure) {
  const admin = await ensureAdminAccountExists(infrastructure)
  if (admin.isErr()) {
    console.error('Error ensuring admin account exists', admin.error)
    return
  }

  const result = await assignAllRolesToAccount(infrastructure, admin.value.id)
  if (result.isErr()) {
    console.error('Error assigning roles to admin account', result.error)
  }
}

async function ensureAdminAccountExists(infrastructure: Infrastructure) {
  const authentication = createAuthenticationApplication(infrastructure)

  const registerResult = await authentication.registerCommand().execute('admin', 'admin')
  if (!(registerResult instanceof Error)) return ok({ id: registerResult.newUserAccount.id })

  const loginResult = await authentication.loginCommand().execute('admin', 'admin')
  if (!(loginResult instanceof Error)) return ok({ id: loginResult.userAccount.id })

  return err(registerResult)
}

async function assignAllRolesToAccount(infrastructure: Infrastructure, userId: number) {
  const authorization = createAuthorizationApplication(infrastructure)
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
