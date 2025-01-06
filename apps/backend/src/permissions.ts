import { setupAuthorizationPermissions } from '@romulus/authorization/application'

export async function setupPermissions(
  createPermissions: (
    permissions: { name: string; description: string | undefined }[],
  ) => Promise<void>,
) {
  await setupAuthorizationPermissions(createPermissions)
}
