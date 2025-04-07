export type MediaType = { id: string; name: string; children: string[] }
export type MediaTypeStore = Map<string, MediaType>

export function createMediaTypeTree(mediaTypes: MediaType[]): MediaTypeStore {
  return new Map(mediaTypes.map((mediaType) => [mediaType.id, mediaType]))
}

export const DEFAULT_MEDIA_TYPE_TREE = createMediaTypeTree([
  { id: 'dance', name: 'Dance', children: [] },
  { id: 'game', name: 'Game', children: [] },
  { id: 'language-art', name: 'Language Art', children: [] },
  { id: 'music', name: 'Music', children: [] },
])
