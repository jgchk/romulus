export const MediaPermission = {
  WriteMediaTypes: 'media:media-types:write',
  WriteMediaArtifactTypes: 'media:media-artifact-types:write',
} as const

export type MediaPermission = (typeof MediaPermission)[keyof typeof MediaPermission]
