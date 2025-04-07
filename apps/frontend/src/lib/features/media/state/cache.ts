import { parse, stringify } from 'devalue'
import * as localForage from 'localforage'

import { browser } from '$app/environment'

import { createMediaTypeTree, type MediaType, type MediaTypeStore } from './types'

export async function cacheMediaTypeTree(store: MediaTypeStore) {
  if (!browser) return

  try {
    await localForage.setItem('media-type-tree', stringify([...store.values()]))
  } catch (error) {
    console.error('Error caching genre tree:', error)
  }
}

export async function getMediaTypeTreeFromCache() {
  if (!browser) return

  const stringifiedMediaTypeTree = await localForage.getItem<string | null>('media-type-tree')
  if (stringifiedMediaTypeTree) {
    const tree = createMediaTypeTree(parse(stringifiedMediaTypeTree) as MediaType[])
    return tree
  }
}
