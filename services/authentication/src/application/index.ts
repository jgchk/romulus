import { AuthenticationPermission } from '../domain/permissions'

export { CreateApiKeyCommand } from './commands/create-api-key'
export { DeleteApiKeyCommand } from './commands/delete-api-key'
export { GetAccountQuery } from './commands/get-account'
export { GetAccountsQuery } from './commands/get-accounts'
export { GetApiKeysByAccountQuery } from './commands/get-api-keys-by-account'
export { LoginCommand } from './commands/login'
export { LogoutCommand } from './commands/logout'
export { RefreshSessionCommand } from './commands/refresh-session'
export { RegisterCommand } from './commands/register'
export { RequestPasswordResetCommand } from './commands/request-password-reset'
export { ResetPasswordCommand } from './commands/reset-password'
export { ValidateApiKeyCommand } from './commands/validate-api-key'
export { WhoamiQuery } from './commands/whoami'

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
