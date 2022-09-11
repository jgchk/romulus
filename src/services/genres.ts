import { useCallback, useMemo } from 'react'
import { compareTwoStrings } from 'string-similarity'

import useGenreNavigatorSettings from '../components/GenresPage/GenreNavigator/useGenreNavigatorSettings'
import {
  DefaultGenre,
  SimpleGenre,
  TreeGenre,
} from '../server/db/genre/outputs'
import { toAscii } from '../utils/string'
import { trpc } from '../utils/trpc'

export const useGenresQuery = () => {
  const utils = trpc.useContext()
  return trpc.useQuery(['genre.all'], {
    onSuccess: (data) => {
      utils.setQueryData(['genre.all.simple'], data)
      utils.setQueryData(['genre.all.tree'], data)
      for (const genre of data) {
        utils.setQueryData(['genre.byId', { id: genre.id }], genre)
        utils.setQueryData(['genre.byId.simple', { id: genre.id }], genre)
      }
    },
  })
}

export const useGenresMapQuery = () => {
  const utils = trpc.useContext()
  return trpc.useQuery(['genre.all'], {
    select: (data: DefaultGenre[]): Map<number, DefaultGenre> =>
      new Map(data.map((genre) => [genre.id, genre])),
    onSuccess: (data) => {
      const genres = [...data.values()]
      utils.setQueryData(['genre.all.simple'], genres)
      utils.setQueryData(['genre.all.tree'], genres)
      for (const genre of genres) {
        utils.setQueryData(['genre.byId', { id: genre.id }], genre)
        utils.setQueryData(['genre.byId.simple', { id: genre.id }], genre)
      }
    },
  })
}

export const useTreeGenresQuery = () => {
  const utils = trpc.useContext()
  return trpc.useQuery(['genre.all.tree'], {
    onSuccess: (data) => {
      utils.setQueryData(['genre.all.simple'], data)
      for (const genre of data) {
        utils.setQueryData(['genre.byId.simple', { id: genre.id }], genre)
      }
    },
  })
}

export const useTreeGenresMapQuery = () => {
  const utils = trpc.useContext()
  return trpc.useQuery(['genre.all.tree'], {
    select: (data: TreeGenre[]): Map<number, TreeGenre> =>
      new Map(data.map((genre) => [genre.id, genre])),
    onSuccess: (data) => {
      const genres = [...data.values()]
      utils.setQueryData(['genre.all.simple'], genres)
      for (const genre of genres) {
        utils.setQueryData(['genre.byId.simple', { id: genre.id }], genre)
      }
    },
  })
}

export const useSimpleGenresQuery = () => {
  const utils = trpc.useContext()
  return trpc.useQuery(['genre.all.simple'], {
    onSuccess: (data) => {
      for (const genre of data) {
        utils.setQueryData(['genre.byId.simple', { id: genre.id }], genre)
      }
    },
  })
}

export type Match = {
  id: number
  genre: SimpleGenre
  matchedAka?: string
  weight: number
}
const toFilterString = (s: string) => toAscii(s.toLowerCase())
const getMatchWeight = (name: string, filter: string) => {
  const fName = toFilterString(name)
  const fFilter = toFilterString(filter)

  if (fName.length < 2 || fFilter.length < 2) {
    if (fName.startsWith(fFilter)) {
      return 1
    } else if (fName.includes(fFilter)) {
      return 0.5
    } else {
      return 0
    }
  }

  return compareTwoStrings(fName, fFilter)
}
const WEIGHT_THRESHOLD = 0.2
export const useSimpleGenreSearchQuery = (filter: string) => {
  const genresQuery = useSimpleGenresQuery()
  const { genreRelevanceFilter } = useGenreNavigatorSettings()

  const getMatches = useCallback((allGenres: SimpleGenre[], filter: string) => {
    const m: Match[] = []

    for (const genre of allGenres) {
      let name = genre.name
      if (genre.subtitle) {
        name += ` [${genre.subtitle}]`
      }
      const nameWeight = getMatchWeight(name, filter)
      let match: Match = { id: genre.id, genre, weight: nameWeight }

      for (const aka of genre.akas) {
        // TODO: incorporate aka relevance
        const akaWeight = getMatchWeight(aka.name, filter)
        if (akaWeight > match.weight) {
          match = {
            id: genre.id,
            genre,
            matchedAka: aka.name,
            weight: akaWeight,
          }
        }
      }

      if (match.weight >= WEIGHT_THRESHOLD) {
        m.push(match)
      }
    }

    return m.sort(
      (a, b) =>
        b.weight - a.weight ||
        a.genre.name.toLowerCase().localeCompare(b.genre.name.toLowerCase())
    )
  }, [])

  const output = useMemo(() => {
    if (genresQuery.data) {
      const matches = getMatches(
        genresQuery.data.filter(
          (genre) => genre.relevance >= genreRelevanceFilter
        ),
        filter
      )
      return { ...genresQuery, data: matches }
    } else {
      return genresQuery
    }
  }, [filter, genreRelevanceFilter, genresQuery, getMatches])

  return output
}

export const useGenreQuery = (id: number) => {
  const utils = trpc.useContext()
  return trpc.useQuery(['genre.byId', { id }], {
    onSuccess: (data) => {
      utils.setQueryData(['genre.byId.simple', { id: data.id }], data)
    },
  })
}

export const useSimpleGenreQuery = (id: number) =>
  trpc.useQuery(['genre.byId.simple', { id }])

export const useAddGenreMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['genre.add'], {
    onSuccess: async (data) => {
      utils.setQueryData(['genre.byId', { id: data.id }], data)
      utils.setQueryData(['genre.byId.simple', { id: data.id }], data)
      await Promise.all([
        utils.invalidateQueries(['genre.all']),
        utils.invalidateQueries(['genre.all.simple']),
        utils.invalidateQueries(['genre.all.tree']),
        utils.invalidateQueries(['genre.history.byGenreId']),
        utils.invalidateQueries(['genre.history.byUserId']),
        utils.invalidateQueries(['genre.history.byUserId.count']),
      ])
    },
  })
}

export const useEditGenreMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['genre.edit'], {
    onSuccess: async (data) => {
      utils.setQueryData(['genre.byId', { id: data.id }], data)
      utils.setQueryData(['genre.byId.simple', { id: data.id }], data)
      await Promise.all([
        utils.invalidateQueries(['genre.all']),
        utils.invalidateQueries(['genre.all.simple']),
        utils.invalidateQueries(['genre.all.tree']),
        utils.invalidateQueries(['genre.history.byGenreId']),
        utils.invalidateQueries(['genre.history.byUserId']),
        utils.invalidateQueries(['genre.history.byUserId.count']),
      ])
    },
  })
}

export const useDeleteGenreMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['genre.delete'], {
    onSuccess: async (data, { id }) => {
      await Promise.all([
        utils.invalidateQueries(['genre.all']),
        utils.invalidateQueries(['genre.all.simple']),
        utils.invalidateQueries(['genre.all.tree']),
        utils.invalidateQueries(['genre.history.byGenreId', { id }]),
        utils.invalidateQueries(['genre.history.byUserId']),
        utils.invalidateQueries(['genre.history.byUserId.count']),
      ])
    },
  })
}
