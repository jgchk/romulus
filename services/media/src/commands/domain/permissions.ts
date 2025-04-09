export const MediaPermission = {
  CreateMediaTypes: 'media:create-media-types',
  EditMediaTypes: 'media:edit-media-types',
  DeleteMediaTypes: 'media:delete-media-types',

  CreateMediaArtifactTypes: 'media:create-media-artifact-types',
  EditMediaArtifactTypes: 'media:edit-media-artifact-types',
  DeleteMediaArtifactTypes: 'media:delete-media-artifact-types',
} as const

export type MediaPermission = (typeof MediaPermission)[keyof typeof MediaPermission]
