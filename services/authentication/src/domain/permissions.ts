export const AuthenticationPermission = {
  RequestPasswordReset: 'authentication:request-password-reset',
} as const

export type AuthenticationPermission =
  (typeof AuthenticationPermission)[keyof typeof AuthenticationPermission]
