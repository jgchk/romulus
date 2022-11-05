import { useCallback, useMemo } from 'react'

import { DefaultMediaType } from '../server/db/media-type/outputs'
import { getMatchWeight } from '../utils/search'
import { trpc } from '../utils/trpc'

export const useMediaTypesQuery = () => {
  const utils = trpc.useContext()
  return trpc.useQuery(['media.type.all'], {
    onSuccess: (data) => {
      for (const mediaType of data) {
        utils.setQueryData(['media.type.byId', { id: mediaType.id }], mediaType)
      }
    },
  })
}

export const useAddMediaTypeMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['media.type.add'], {
    onSuccess: async (data) => {
      utils.setQueryData(['media.type.byId', { id: data.id }], data)
      await utils.invalidateQueries(['media.type.all'])
    },
  })
}

export type MediaTypeMatch = {
  id: number
  mediaType: DefaultMediaType
  weight: number
}
const WEIGHT_THRESHOLD = 0.2
export const useMediaTypeSearchQuery = (filter: string) => {
  const mediaTypesQuery = useMediaTypesQuery()

  const getMatches = useCallback(
    (allMediaTypes: DefaultMediaType[], filter: string) => {
      const m: MediaTypeMatch[] = []

      for (const mediaType of allMediaTypes) {
        const weight = getMatchWeight(mediaType.name, filter)
        if (weight >= WEIGHT_THRESHOLD) {
          m.push({ id: mediaType.id, mediaType, weight })
        }
      }

      return m.sort(
        (a, b) =>
          b.weight - a.weight ||
          a.mediaType.name
            .toLowerCase()
            .localeCompare(b.mediaType.name.toLowerCase())
      )
    },
    []
  )

  const output = useMemo(() => {
    if (mediaTypesQuery.data) {
      const matches = getMatches(mediaTypesQuery.data, filter)
      return { ...mediaTypesQuery, data: matches }
    } else {
      return mediaTypesQuery
    }
  }, [filter, getMatches, mediaTypesQuery])

  return output
}
