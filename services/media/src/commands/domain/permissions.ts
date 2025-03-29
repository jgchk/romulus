export const MediaPermission = {
  CreateMediaTypes: 'media:create-media-types',
  EditMediaTypes: 'media:edit-media-types',
  DeleteMediaTypes: 'media:delete-media-types',
} as const

export type MediaPermission = (typeof MediaPermission)[keyof typeof MediaPermission]
