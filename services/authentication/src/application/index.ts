import { AuthenticationPermission } from '../domain/permissions.js'

export { CreateApiKeyCommand } from './commands/create-api-key.js'
export { DeleteApiKeyCommand } from './commands/delete-api-key.js'
export { GetAccountQuery } from './commands/get-account.js'
export { GetAccountsQuery } from './commands/get-accounts.js'
export { GetApiKeysByAccountQuery } from './commands/get-api-keys-by-account.js'
export { LoginCommand } from './commands/login.js'
export { LogoutCommand } from './commands/logout.js'
export { RefreshSessionCommand } from './commands/refresh-session.js'
export { RegisterCommand } from './commands/register.js'
export { RequestPasswordResetCommand } from './commands/request-password-reset.js'
export { ResetPasswordCommand } from './commands/reset-password.js'
export { ValidateApiKeyCommand } from './commands/validate-api-key.js'
export { WhoamiQuery } from './commands/whoami.js'

export async function setupAuthenticationPermissions(
  createPermissions: (
    permissions: { name: string; description: string | undefined }[],
  ) => Promise<void>,
) {
  await createPermissions(
    Object.values(AuthenticationPermission).map((permission) => ({
      name: permission,
      description: undefined,
    })),
  )
}
