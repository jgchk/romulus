export const MediaTypeTreesRole = {
  ADMIN: 'media-type-trees:admin',
  WRITE: 'media-type-trees:write',
} as const

export type MediaTypeTreesRole = (typeof MediaTypeTreesRole)[keyof typeof MediaTypeTreesRole]
