export const MediaTypeTreePermission = {
  ADMIN: 'ADMIN',
  WRITE: 'WRITE',
} as const

export type MediaTypeTreePermission =
  (typeof MediaTypeTreePermission)[keyof typeof MediaTypeTreePermission]
