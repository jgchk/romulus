import anyAscii from 'any-ascii'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  createContext,
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiSettings3Fill,
} from 'react-icons/ri'

import useGenreMap, { GenreMap } from '../../hooks/useGenreMap'
import { DefaultGenre } from '../../server/db/genre'
import { useSession } from '../../services/auth'
import { useGenresQuery } from '../../services/genres'
import { ButtonSecondary } from '../common/Button'
import { CenteredLoader } from '../common/Loader'
import { useGenreTreeSettings } from './common'
import GenreTreeSettings from './GenreTreeSettings'
import GenreTypeChip from './GenreTypeChip'

const GenreTree: FC<{
  selectedGenreId?: number
}> = ({ selectedGenreId }) => {
  const genresQuery = useGenresQuery()
  const session = useSession()
  const router = useRouter()

  if (genresQuery.data) {
    return (
      <div className='w-full h-full flex flex-col'>
        <div className='flex-1 overflow-auto'>
          <Tree genres={genresQuery.data} selectedId={selectedGenreId} />
        </div>
        {session.isLoggedIn && (
          <div className='p-1 border-t'>
            <ButtonSecondary
              className='w-full'
              onClick={() => router.push({ pathname: '/genres/create' })}
            >
              New Genre
            </ButtonSecondary>
          </div>
        )}
      </div>
    )
  }

  if (genresQuery.error) {
    return (
      <div className='w-full h-full flex items-center justify-center text-red-600'>
        Error fetching genres :(
      </div>
    )
  }

  return <CenteredLoader />
}

type Expanded = Record<number, 'expanded' | 'collapsed' | undefined>

type TreeContext = {
  selectedId: number | undefined
  filter: string
  genreMap: GenreMap
  expanded: Expanded
  setExpanded: Dispatch<SetStateAction<Expanded>>
  getDescendants: (id: number) => number[]
  getMatchesFilter: (id: number) => boolean
}

const TreeContext = createContext<TreeContext>({
  selectedId: undefined,
  filter: '',
  genreMap: {},
  expanded: {},
  setExpanded: () => {
    throw new Error('Must use TreeContext inside of a TreeProvider')
  },
  getDescendants: () => {
    throw new Error('Must use TreeContext inside of a TreeProvider')
  },
  getMatchesFilter: () => {
    throw new Error('Must use TreeContext inside of a TreeProvider')
  },
})

const useTreeContext = () => useContext(TreeContext)

const Tree: FC<{ genres: DefaultGenre[]; selectedId?: number }> = ({
  genres: unsortedGenres,
  selectedId,
}) => {
  const [expanded, setExpanded] = useState<Expanded>({})
  const [filter, setFilter] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const genreMap = useGenreMap(unsortedGenres)

  const getDescendants = useCallback(
    (id: number) => {
      const descendants: number[] = []
      const queue = [id]

      while (queue.length > 0) {
        const currId = queue.shift()
        if (currId === undefined) break

        const currGenre = genreMap[currId]
        const childIds = currGenre.childGenres.map((g) => g.id)
        descendants.push(...childIds)
        queue.push(...childIds)
      }

      return descendants
    },
    [genreMap]
  )

  const getMatchesFilter = useCallback(
    (id: number) => {
      if (!filter) return false

      const genre = genreMap[id]
      return anyAscii(genre.name.toLowerCase()).includes(
        anyAscii(filter.toLowerCase())
      )
    },
    [filter, genreMap]
  )

  const sortedGenres = useMemo(
    () =>
      unsortedGenres.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      ),
    [unsortedGenres]
  )

  const genres = useMemo(() => {
    let gs = sortedGenres
    if (filter) {
      gs = gs.filter((g) => {
        const descendants = getDescendants(g.id)
        return [g.id, ...descendants].some((id) => getMatchesFilter(id))
      })
    }
    return gs
  }, [filter, getDescendants, getMatchesFilter, sortedGenres])

  const topLevelGenres = useMemo(
    () => genres.filter((genre) => genre.parentGenres.length === 0),
    [genres]
  )

  const session = useSession()

  return (
    <TreeContext.Provider
      value={{
        selectedId,
        filter,
        genreMap,
        expanded,
        setExpanded,
        getDescendants,
        getMatchesFilter,
      }}
    >
      <div className='w-full h-full flex flex-col'>
        <div className='p-4 flex space-x-1 border-b'>
          <input
            className='border rounded-sm p-1 px-2 w-full'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder='Filter...'
          />
          <button
            className='p-2 hover:bg-blue-100 hover:text-blue-600 rounded-sm text-gray-500'
            title='Settings'
            onClick={() => setShowSettings(!showSettings)}
          >
            <RiSettings3Fill />
          </button>
        </div>
        {showSettings && (
          <div className='border-b p-4'>
            <GenreTreeSettings />
          </div>
        )}
        {genres.length > 0 ? (
          <div className='flex-1 overflow-auto p-4'>
            <ul>
              {topLevelGenres.map((genre) => (
                <GenreNode key={genre.id} id={genre.id} />
              ))}
            </ul>
          </div>
        ) : (
          <div className='flex-1 w-full flex flex-col items-center justify-center text-gray-400'>
            <div>No genres found.</div>
            {session.isLoggedIn && (
              <div>
                <Link href={{ pathname: '/genres/create' }}>
                  <a className='text-blue-500 hover:underline'>Create one.</a>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </TreeContext.Provider>
  )
}

const GenreNode: FC<{ id: number }> = ({ id }) => {
  const {
    selectedId,
    filter,
    genreMap,
    expanded,
    setExpanded,
    getDescendants,
    getMatchesFilter,
  } = useTreeContext()

  const genre = useMemo(() => genreMap[id], [genreMap, id])

  const descendants = useMemo(
    () => getDescendants(genre.id),
    [genre.id, getDescendants]
  )

  const isExpanded = useMemo(() => {
    if (expanded[genre.id] === 'expanded') return true

    if (expanded[genre.id] === undefined) {
      if (selectedId !== undefined && descendants.includes(selectedId))
        return true
      if (descendants.some((id) => getMatchesFilter(id))) return true
    }

    return false
  }, [descendants, expanded, genre.id, getMatchesFilter, selectedId])

  const children = useMemo(() => {
    let matchingChildren = genre.childGenres
    if (filter) {
      matchingChildren = matchingChildren.filter((g) => {
        const descendants = getDescendants(g.id)
        return [g.id, ...descendants].some((id) => getMatchesFilter(id))
      })
    }
    return matchingChildren.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    )
  }, [filter, genre.childGenres, getDescendants, getMatchesFilter])

  const { showTypeTags } = useGenreTreeSettings()

  return (
    <li
      className={clsx(
        genre.parentGenres.length > 0 && 'ml-4 border-l',
        genre.parentGenres.some(({ id }) => selectedId === id) &&
          'border-gray-400',
        filter && getMatchesFilter(genre.id) && 'font-bold'
      )}
      key={genre.id}
    >
      <div className='ml-1 flex space-x-1'>
        <button
          className={clsx(
            'p-1 hover:bg-blue-100 hover:text-blue-600 rounded-sm text-gray-500',
            genre.childGenres.length === 0 && 'invisible'
          )}
          onClick={() =>
            setExpanded({
              ...expanded,
              [genre.id]: isExpanded ? 'collapsed' : 'expanded',
            })
          }
        >
          {isExpanded ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
        </button>
        <Link
          href={{
            pathname: '/genres/[id]',
            query: { id: genre.id.toString() },
          }}
        >
          <a
            className={
              selectedId === genre.id
                ? 'text-blue-600 font-bold'
                : 'text-gray-600'
            }
          >
            {genre.name}
            {showTypeTags && genre.type !== 'STYLE' && (
              <>
                {' '}
                <GenreTypeChip type={genre.type} />
              </>
            )}
          </a>
        </Link>
      </div>
      {isExpanded && children.length > 0 && (
        <ul>
          {children.map(({ id }) => (
            <GenreNode key={id} id={id} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default GenreTree
