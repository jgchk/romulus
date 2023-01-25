import { Sort } from '../server/db/genre/inputs'
import { DefaultGenre, TreeStructure } from '../server/db/genre/outputs'
import { trpc } from '../utils/trpc'

export const usePaginatedGenresQuery = (
  page = 0,
  size = 30,
  sort: Sort[] = []
) => {
  return trpc.useQuery(['genre.paginated', { page, size, sort }], {
    keepPreviousData: true,
  })
}

export const useGenresMapQuery = () => {
  const utils = trpc.useContext()
  return trpc.useQuery(['genre.all'], {
    select: (data: DefaultGenre[]): Map<number, DefaultGenre> =>
      new Map(data.map((genre) => [genre.id, genre])),
    onSuccess: (data) => {
      const genres = [...data.values()]
      for (const genre of genres) {
        utils.setQueryData(['genre.byId', { id: genre.id }], genre)
        utils.setQueryData(['genre.byId.simple', { id: genre.id }], genre)
      }
    },
  })
}

export const useTopLevelTreeGenresQuery = () => {
  return trpc.useQuery(['genre.tree.topLevel'])
}

export const useTreeGenreChildrenQuery = (genreId: number) => {
  return trpc.useQuery(['genre.tree.children', { id: genreId }])
}

export const useTreeStructureMapQuery = () => {
  return trpc.useQuery(['genre.tree.structure'], {
    select: (data: TreeStructure[]): Map<number, TreeStructure> =>
      new Map(data.map((genre) => [genre.id, genre])),
  })
}

export const useSimpleGenreSearchQuery = (query: string) => {
  const utils = trpc.useContext()
  return trpc.useQuery(['genre.search.simple', { query }], {
    onSuccess: (data) => {
      for (const match of data) {
        utils.setQueryData(
          ['genre.byId.simple', { id: match.genre.id }],
          match.genre
        )
      }
    },
  })
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
        utils.invalidateQueries(['genre.history.byGenreId', { id }]),
        utils.invalidateQueries(['genre.history.byUserId']),
        utils.invalidateQueries(['genre.history.byUserId.count']),
      ])
    },
  })
}
