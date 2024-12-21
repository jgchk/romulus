export type IAuthorizationService = {
  hasPermission(userId: number, permission: string): Promise<boolean>
}
