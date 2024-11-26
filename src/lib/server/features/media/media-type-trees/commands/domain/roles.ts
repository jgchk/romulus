export const MediaTypeTreePermission = {
  ADMIN: 'media-type-trees:admin',
  WRITE: 'media-type-trees:write',
} as const

export type MediaTypeTreePermission =
  (typeof MediaTypeTreePermission)[keyof typeof MediaTypeTreePermission]
