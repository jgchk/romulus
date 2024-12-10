export const AuthenticationPermission = {
  RequestPasswordReset: 'authentication:request-password-reset',
  GetAccount: 'authentication:get-account',
} as const

export type AuthenticationPermission =
  (typeof AuthenticationPermission)[keyof typeof AuthenticationPermission]
