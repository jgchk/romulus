import { useCallback, useMemo } from 'react'

import { DefaultSense } from '../server/db/sense/outputs'
import { getMatchWeight } from '../utils/search'
import { trpc } from '../utils/trpc'

export const useSensesQuery = () => {
  const utils = trpc.useContext()
  return trpc.useQuery(['sense.all'], {
    onSuccess: (data) => {
      for (const sense of data) {
        utils.setQueryData(['sense.byId', { id: sense.id }], sense)
      }
    },
  })
}

export const useSenseQuery = (id: number) =>
  trpc.useQuery(['sense.byId', { id }])

export const useAddSenseMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['sense.add'], {
    onSuccess: async (data) => {
      utils.setQueryData(['sense.byId', { id: data.id }], data)
      await utils.invalidateQueries(['sense.all'])
    },
  })
}

export type SenseMatch = {
  id: number
  sense: DefaultSense
  weight: number
}
const WEIGHT_THRESHOLD = 0.2
export const useSenseSearchQuery = (filter: string) => {
  const sensesQuery = useSensesQuery()

  const getMatches = useCallback(
    (allSenses: DefaultSense[], filter: string) => {
      const m: SenseMatch[] = []

      for (const sense of allSenses) {
        const weight = getMatchWeight(sense.name, filter)
        if (weight >= WEIGHT_THRESHOLD) {
          m.push({ id: sense.id, sense, weight })
        }
      }

      return m.sort(
        (a, b) =>
          b.weight - a.weight ||
          a.sense.name.toLowerCase().localeCompare(b.sense.name.toLowerCase())
      )
    },
    []
  )

  const output = useMemo(() => {
    if (sensesQuery.data) {
      const matches = getMatches(sensesQuery.data, filter)
      return { ...sensesQuery, data: matches }
    } else {
      return sensesQuery
    }
  }, [filter, getMatches, sensesQuery])

  return output
}
