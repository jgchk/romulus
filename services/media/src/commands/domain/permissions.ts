export const MediaPermission = {
  CreateMediaTypes: 'media:create-media-types',
  EditMediaTypes: 'media:edit-media-types',
  DeleteMediaTypes: 'media:delete-media-types',

  CreateMediaArtifactType: 'media:create-media-artifact-type',
  EditMediaArtifactType: 'media:edit-media-artifact-type',
  DeleteMediaArtifactType: 'media:delete-media-artifact-type',
} as const

export type MediaPermission = (typeof MediaPermission)[keyof typeof MediaPermission]
