import { queryOptions } from '@tanstack/svelte-query'

import { cacheMediaTypeTree } from './cache'
import { type MediaTypeStore } from './types'

export const mediaTypeQueries = {
  all: () => ['media-types'],
  tree: () =>
    queryOptions({
      queryKey: [...mediaTypeQueries.all(), 'tree'],
      queryFn: async ({ signal }) => {
        const response = await fetch('/api/media-types/tree', {
          signal,
        })
        const json = (await response.json()) as {
          mediaTypes: { id: string; name: string; parents: string[] }[]
        }
        const mediaTypeTree = convertTree(json.mediaTypes)
        await cacheMediaTypeTree(mediaTypeTree)
        return mediaTypeTree
      },
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }),
}

function convertTree(
  mediaTypes: { id: string; name: string; parents: string[] }[],
): MediaTypeStore {
  const store: MediaTypeStore = new Map(
    mediaTypes.map((mediaType) => [
      mediaType.id,
      { id: mediaType.id, name: mediaType.name, children: [] },
    ]),
  )

  for (const mediaType of mediaTypes) {
    for (const parentId of mediaType.parents) {
      const parent = store.get(parentId)
      if (parent !== undefined) {
        parent.children.push(mediaType.id)
      }
    }
  }

  return store
}
