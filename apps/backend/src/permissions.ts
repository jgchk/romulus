import { setupAuthenticationPermissions } from '@romulus/authentication/application'
import { setupAuthorizationPermissions } from '@romulus/authorization/application'
import { setupGenresPermissions } from '@romulus/genres/application'

export async function setupPermissions(
  createPermissions: (
    permissions: { name: string; description: string | undefined }[],
  ) => Promise<void>,
) {
  await setupAuthorizationPermissions(createPermissions)
  await setupAuthenticationPermissions(createPermissions)
  await setupGenresPermissions(createPermissions)
}
